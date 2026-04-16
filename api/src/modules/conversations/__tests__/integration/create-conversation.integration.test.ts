import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { CHAT_OUTBOX_TOPICS } from "../../../outbox/chat/chat-events";
import ConversationsIntegrationEnvironment from "./conversations.environment";

describe("POST /conversations", () => {
    let environment: ConversationsIntegrationEnvironment;

    beforeEach(() => {
        environment = new ConversationsIntegrationEnvironment();
    });

    afterEach(async () => {
        await environment.close();
    });

    it("enqueues a conversation.created event when creating a direct conversation", async () => {
        await environment.setup();

        const currentUser = await environment.registerUser({
            email: "henrique@example.com",
            name: "Henrique",
            password: "123456"
        });

        const otherUser = await environment.registerUser({
            email: "maria@example.com",
            name: "Maria",
            password: "123456"
        });

        const response = await environment.app.inject({
            method: "POST",
            url: "/conversations",
            cookies: {
                [currentUser.cookieName]: currentUser.cookie
            },
            payload: {
                userId: otherUser.user?.id
            }
        });

        assert.equal(response.statusCode, 201);
        assert.equal(environment.outbox.events.length, 1);
        assert.equal(environment.outbox.events[0]?.topic, CHAT_OUTBOX_TOPICS.conversationCreated);
    });

    it("does not enqueue a new event when reusing an existing direct conversation", async () => {
        await environment.setup();

        const currentUser = await environment.registerUser({
            email: "henrique@example.com",
            name: "Henrique",
            password: "123456"
        });

        const otherUser = await environment.registerUser({
            email: "maria@example.com",
            name: "Maria",
            password: "123456"
        });

        const firstResponse = await environment.app.inject({
            method: "POST",
            url: "/conversations",
            cookies: {
                [currentUser.cookieName]: currentUser.cookie
            },
            payload: {
                userId: otherUser.user?.id
            }
        });

        const secondResponse = await environment.app.inject({
            method: "POST",
            url: "/conversations",
            cookies: {
                [currentUser.cookieName]: currentUser.cookie
            },
            payload: {
                userId: otherUser.user?.id
            }
        });

        assert.equal(firstResponse.statusCode, 201);
        assert.equal(secondResponse.statusCode, 201);
        assert.equal(environment.outbox.events.length, 1);
        assert.equal(environment.prisma.conversations.length, 1);
    });
});
