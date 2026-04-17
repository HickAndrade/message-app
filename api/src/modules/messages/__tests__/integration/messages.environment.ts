import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../../../../__tests__/utils/build-test-app";
import { TEST_AUTH_COOKIE_NAME } from "../../../../__tests__/utils/test-env";
import { createPrismaMock } from "../../../../__tests__/utils/prisma-mock";
import type {
    OutboxEventRecord,
    OutboxRepository
} from "../../../outbox/repositories/outbox.repository.types";
import { OUTBOX_STATUSES } from "../../../outbox/repositories/outbox.repository.types";
import type {
    CreateMessageInput,
    CreatedMessageRecord,
    MessagesRepository
} from "../../repositories/types";
import type { MessagesConversationLookup } from "../../messages.types";

const NOW = new Date("2026-01-01T00:00:00.000Z");

function createOutboxRepositoryFake() {
    const events: OutboxEventRecord[] = [];

    const repository: OutboxRepository = {
        async enqueue(event) {
            const record: OutboxEventRecord = {
                attempts: 0,
                availableAt: NOW,
                createdAt: NOW,
                id: `outbox-${events.length + 1}`,
                lastError: null,
                processedAt: null,
                requestId: event.requestId ?? null,
                status: OUTBOX_STATUSES.pending,
                updatedAt: NOW,
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
                event.processedAt = NOW;
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

function createMessagesModuleFakes() {
    const memberships = new Map<string, Set<string>>();
    const messages = new Map<string, CreatedMessageRecord>();

    const conversationsRepository: MessagesConversationLookup = {
        async findByIdForUser(conversationId, userId) {
            const members = memberships.get(conversationId);

            if (!members?.has(userId)) {
                return null;
            }

            return {
                id: conversationId,
                userIds: Array.from(members)
            } as Awaited<ReturnType<MessagesConversationLookup["findByIdForUser"]>>;
        }
    };

    const messagesRepository: MessagesRepository = {
        async create(data: CreateMessageInput) {
            const key = `${data.senderId}:${data.conversationId}:${data.clientMessageId}`;
            const existing = messages.get(key);

            if (existing) {
                return {
                    created: false,
                    message: existing
                };
            }

            const message: CreatedMessageRecord = {
                id: `message-${messages.size + 1}`,
                body: data.body ?? null,
                clientMessageId: data.clientMessageId,
                conversationId: data.conversationId,
                createdAt: NOW,
                image: data.image ?? null,
                seenIds: [data.senderId],
                senderId: data.senderId,
                seen: [],
                sender: {
                    id: data.senderId,
                    name: "Henrique",
                    email: "henrique@example.com",
                    emailVerified: null,
                    image: null,
                    hashedPassword: "$2b$10$test",
                    createdAt: NOW,
                    updatedAt: NOW,
                    conversationIds: [data.conversationId],
                    seenMessageIds: []
                }
            };

            messages.set(key, message);

            return {
                created: true,
                conversation: {
                    messages: [message],
                    users: [{
                        email: "henrique@example.com"
                    }]
                },
                message
            };
        }
    };

    return {
        conversationsRepository,
        messages,
        messagesRepository,
        seedConversation(conversationId: string, userIds: string[]) {
            memberships.set(conversationId, new Set(userIds));
        }
    };
}

export default class MessagesIntegrationEnvironment {
    readonly authPrisma = createPrismaMock();
    readonly module = createMessagesModuleFakes();
    readonly outbox = createOutboxRepositoryFake();
    app!: FastifyInstance;

    async setup() {
        this.app = await buildTestApp({
            messagesModule: {
                conversationsRepository: this.module.conversationsRepository,
                messagesRepository: this.module.messagesRepository
            },
            outboxModule: {
                repository: this.outbox.repository
            },
            prisma: this.authPrisma.client
        });
    }

    async close() {
        if (this.app) {
            await this.app.close();
        }
    }

    async registerAndAuthenticate(data: { email: string; name: string; password: string }) {
        const response = await this.app.inject({
            method: "POST",
            payload: data,
            url: "/auth/register"
        });

        return {
            cookie: response.cookies[0]?.value ?? "",
            cookieName: TEST_AUTH_COOKIE_NAME,
            user: this.authPrisma.users.find((user) => user.email === data.email) ?? null
        };
    }
}
