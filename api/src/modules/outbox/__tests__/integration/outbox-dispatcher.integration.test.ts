import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { OUTBOX_STATUSES } from "../../repositories/outbox.repository.types";
import OutboxIntegrationEnvironment, {
    OUTBOX_TEST_NOW
} from "./outbox.environment";

describe("Outbox dispatcher", () => {
    let environment: OutboxIntegrationEnvironment;

    beforeEach(() => {
        environment = new OutboxIntegrationEnvironment();
    });

    afterEach(async () => {
        await environment.close();
    });

    it("dispatches a pending outbox event and marks it as processed", async () => {
        await environment.setup();

        await environment.enqueueConversationCreated({
            users: [{
                email: "henrique@example.com"
            }]
        });

        const dispatched = await environment.app.outboxDispatcher.dispatchNext(OUTBOX_TEST_NOW);

        assert.equal(dispatched, true);
        assert.equal(environment.delivery.calls.conversationCreated.length, 1);
        assert.equal(environment.outbox.events[0]?.status, OUTBOX_STATUSES.processed);
    });

    it("retries a failed delivery and eventually marks the event as failed", async () => {
        await environment.setup({ deliveryMode: "fail" });

        await environment.enqueueConversationCreated({
            users: [{
                email: "henrique@example.com"
            }]
        });

        const firstAttempt = await environment.app.outboxDispatcher.dispatchNext(OUTBOX_TEST_NOW);

        assert.equal(firstAttempt, true);
        assert.equal(environment.outbox.events[0]?.attempts, 1);
        assert.equal(environment.outbox.events[0]?.status, OUTBOX_STATUSES.pending);
        assert.equal(environment.outbox.events[0]?.lastError, "delivery failed");

        environment.outbox.events[0]!.availableAt = OUTBOX_TEST_NOW;

        await environment.app.outboxDispatcher.dispatchNext(OUTBOX_TEST_NOW);
        environment.outbox.events[0]!.availableAt = OUTBOX_TEST_NOW;

        await environment.app.outboxDispatcher.dispatchNext(OUTBOX_TEST_NOW);

        assert.equal(environment.outbox.events[0]?.attempts, 3);
        assert.equal(environment.outbox.events[0]?.status, OUTBOX_STATUSES.failed);
    });
});
