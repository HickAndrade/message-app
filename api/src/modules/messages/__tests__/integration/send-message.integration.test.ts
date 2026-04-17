import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { CHAT_OUTBOX_TOPICS } from "../../../outbox/chat/chat-events";
import MessagesIntegrationEnvironment from "./messages.environment";

describe("POST /messages", () => {
    let environment: MessagesIntegrationEnvironment;

    beforeEach(async () => {
        environment = new MessagesIntegrationEnvironment();
        await environment.setup();
    });

    afterEach(async () => {
        await environment.close();
    });

    it("creates a message once for the same clientMessageId", async () => {
        const auth = await environment.registerAndAuthenticate({
            email: "henrique@example.com",
            name: "Henrique",
            password: "123456"
        });

        assert.ok(auth.user);

        environment.module.seedConversation("conversation-1", [auth.user.id]);

        const payload = {
            clientMessageId: "client-message-1",
            conversationId: "conversation-1",
            message: "hello"
        };

        const firstResponse = await environment.app.inject({
            method: "POST",
            url: "/messages",
            cookies: {
                [auth.cookieName]: auth.cookie
            },
            payload
        });

        const secondResponse = await environment.app.inject({
            method: "POST",
            url: "/messages",
            cookies: {
                [auth.cookieName]: auth.cookie
            },
            payload
        });

        assert.equal(firstResponse.statusCode, 200);
        assert.equal(secondResponse.statusCode, 200);
        assert.equal(firstResponse.json().id, secondResponse.json().id);
        assert.equal(environment.module.messages.size, 1);
        assert.equal(environment.outbox.events.length, 2);
        assert.deepEqual(
            environment.outbox.events.map((event) => event.topic),
            [CHAT_OUTBOX_TOPICS.messageCreated, CHAT_OUTBOX_TOPICS.conversationUpdated]
        );
        const messageCreatedEvent = environment.outbox.events[0];
        const conversationUpdatedEvent = environment.outbox.events[1];

        assert.ok(messageCreatedEvent?.requestId);
        assert.equal(messageCreatedEvent?.requestId, conversationUpdatedEvent?.requestId);
    });

    it("rejects sending a message to a conversation the current user does not belong to", async () => {
        const auth = await environment.registerAndAuthenticate({
            email: "henrique@example.com",
            name: "Henrique",
            password: "123456"
        });

        assert.ok(auth.user);

        environment.module.seedConversation("conversation-1", ["user-999"]);

        const response = await environment.app.inject({
            method: "POST",
            url: "/messages",
            cookies: {
                [auth.cookieName]: auth.cookie
            },
            payload: {
                clientMessageId: "client-message-1",
                conversationId: "conversation-1",
                message: "hello"
            }
        });

        assert.equal(response.statusCode, 404);
        assert.deepEqual(response.json(), {
            message: "Conversation not found"
        });
    });

    it("rate limits repeated message writes for the same authenticated user", async () => {
        const auth = await environment.registerAndAuthenticate({
            email: "henrique@example.com",
            name: "Henrique",
            password: "123456"
        });

        assert.ok(auth.user);

        environment.module.seedConversation("conversation-1", [auth.user.id]);

        for (let index = 0; index < 20; index += 1) {
            const response = await environment.app.inject({
                method: "POST",
                url: "/messages",
                cookies: {
                    [auth.cookieName]: auth.cookie
                },
                payload: {
                    clientMessageId: `client-message-${index}`,
                    conversationId: "conversation-1",
                    message: "hello"
                }
            });

            assert.equal(response.statusCode, 200);
        }

        const limitedResponse = await environment.app.inject({
            method: "POST",
            url: "/messages",
            cookies: {
                [auth.cookieName]: auth.cookie
            },
            payload: {
                clientMessageId: "client-message-limit",
                conversationId: "conversation-1",
                message: "hello"
            }
        });

        assert.equal(limitedResponse.statusCode, 429);
        assert.deepEqual(limitedResponse.json(), {
            message: "Too many requests"
        });
    });
});
