import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../../../../__tests__/utils/build-test-app";
import { createPrismaMock } from "../../../../__tests__/utils/prisma-mock";
import {
    CHAT_OUTBOX_TOPICS,
    type ConversationBroadcastPayload
} from "../../chat/chat-events";
import type { ChatEventPublisher } from "../../chat/chat-event-publisher";
import type {
    ChatOutboxEvent,
    OutboxEventRecord,
    OutboxRepository
} from "../../repositories/outbox.repository.types";
import { OUTBOX_STATUSES } from "../../repositories/outbox.repository.types";

export const OUTBOX_TEST_NOW = new Date("2026-01-01T00:00:00.000Z");

function createOutboxRepositoryFake() {
    const events: OutboxEventRecord[] = [];

    const repository: OutboxRepository = {
        async enqueue(event) {
            const record: OutboxEventRecord = {
                attempts: 0,
                availableAt: OUTBOX_TEST_NOW,
                createdAt: OUTBOX_TEST_NOW,
                id: `outbox-${events.length + 1}`,
                lastError: null,
                processedAt: null,
                requestId: event.requestId ?? null,
                status: OUTBOX_STATUSES.pending,
                updatedAt: OUTBOX_TEST_NOW,
                ...event
            };

            events.push(record);

            return record;
        },
        async claimNext(now = new Date()) {
            const event = events.find((entry) => entry.status === OUTBOX_STATUSES.pending && entry.availableAt <= now);

            if (!event) {
                return null;
            }

            event.attempts += 1;
            event.lastError = null;
            event.status = OUTBOX_STATUSES.processing;

            return event;
        },
        async markProcessed(id) {
            const event = events.find((entry) => entry.id === id);

            if (event) {
                event.processedAt = OUTBOX_TEST_NOW;
                event.status = OUTBOX_STATUSES.processed;
            }
        },
        async markRetry(id, errorMessage, availableAt) {
            const event = events.find((entry) => entry.id === id);

            if (event) {
                event.availableAt = availableAt;
                event.lastError = errorMessage;
                event.status = OUTBOX_STATUSES.pending;
            }
        },
        async markFailed(id, errorMessage) {
            const event = events.find((entry) => entry.id === id);

            if (event) {
                event.lastError = errorMessage;
                event.status = OUTBOX_STATUSES.failed;
            }
        }
    };

    return {
        events,
        repository
    };
}

function createDeliveryPublisherSpy(mode: "success" | "fail" = "success") {
    const calls = {
        conversationCreated: [] as ChatOutboxEvent[]
    };

    const maybeFail = async () => {
        if (mode === "fail") {
            throw new Error("delivery failed");
        }
    };

    const publisher: ChatEventPublisher = {
        async publishConversationCreated(conversation) {
            calls.conversationCreated.push({
                payload: conversation,
                topic: CHAT_OUTBOX_TOPICS.conversationCreated
            });

            await maybeFail();
        },
        async publishConversationRemoved() {
            await maybeFail();
        },
        async publishConversationUpdated() {
            await maybeFail();
        },
        async publishMessageCreated() {
            await maybeFail();
        },
        async publishMessageUpdated() {
            await maybeFail();
        }
    };

    return {
        calls,
        publisher
    };
}

export default class OutboxIntegrationEnvironment {
    readonly prisma = createPrismaMock();
    readonly outbox = createOutboxRepositoryFake();
    delivery!: ReturnType<typeof createDeliveryPublisherSpy>;
    app!: FastifyInstance;

    async setup(options: { deliveryMode?: "success" | "fail" } = {}) {
        const mode = options.deliveryMode ?? "success";
        this.delivery = createDeliveryPublisherSpy(mode);

        this.app = await buildTestApp({
            outboxModule: {
                deliveryPublisher: this.delivery.publisher,
                repository: this.outbox.repository
            },
            prisma: this.prisma.client
        });
    }

    async close() {
        if (this.app) {
            await this.app.close();
        }
    }

    async enqueueConversationCreated(payload: ConversationBroadcastPayload) {
        return this.outbox.repository.enqueue({
            payload,
            topic: CHAT_OUTBOX_TOPICS.conversationCreated
        });
    }
}
