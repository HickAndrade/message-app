import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../../../../__tests__/utils/build-test-app";
import { TEST_AUTH_COOKIE_NAME } from "../../../../__tests__/utils/test-env";
import type {
    OutboxEventRecord,
    OutboxRepository
} from "../../../outbox/repositories/outbox.repository.types";
import { OUTBOX_STATUSES } from "../../../outbox/repositories/outbox.repository.types";

const NOW = new Date("2026-01-01T00:00:00.000Z");

type UserRecord = {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    hashedPassword: string | null;
    createdAt: Date;
    updatedAt: Date;
    conversationIds: string[];
    seenMessageIds: string[];
};

type ConversationRecord = {
    id: string;
    isGroup: boolean;
    lastMessageAt: Date | null;
    name: string | null;
    userIds: string[];
};

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

function createConversationsPrismaMock() {
    const users: UserRecord[] = [];
    const conversations: ConversationRecord[] = [];

    const client = {
        user: {
            async findUnique({ where }: { where: { email?: string; id?: string } }) {
                if (where.email) {
                    return users.find((user) => user.email === where.email) ?? null;
                }

                if (where.id) {
                    return users.find((user) => user.id === where.id) ?? null;
                }

                return null;
            },
            async create({ data }: { data: { email: string; hashedPassword: string; name: string } }) {
                const user: UserRecord = {
                    id: `user-${users.length + 1}`,
                    name: data.name,
                    email: data.email,
                    emailVerified: null,
                    image: null,
                    hashedPassword: data.hashedPassword,
                    createdAt: NOW,
                    updatedAt: NOW,
                    conversationIds: [],
                    seenMessageIds: []
                };

                users.push(user);

                return user;
            }
        },
        conversation: {
            async findMany({
                where
            }: {
                where?: {
                    OR?: Array<{
                        userIds?: {
                            equals?: string[];
                        };
                    }>;
                };
            } = {}) {
                if (!where?.OR) {
                    return conversations.map((conversation) => ({
                        ...conversation
                    }));
                }

                const matched = conversations.filter((conversation) => {
                    return where.OR?.some((condition) => {
                        const equals = condition.userIds?.equals;

                        if (!equals) {
                            return false;
                        }

                        return equals.length === conversation.userIds.length
                            && equals.every((userId, index) => conversation.userIds[index] === userId);
                    });
                });

                return matched.map((conversation) => ({
                    ...conversation
                }));
            },
            async create({
                data,
                include
            }: {
                data: {
                    isGroup?: boolean;
                    name?: string;
                    users: {
                        connect: Array<{
                            id: string;
                        }>;
                    };
                };
                include?: {
                    users?: boolean;
                };
            }) {
                const userIds = data.users.connect.map((user) => user.id);
                const conversation: ConversationRecord = {
                    id: `conversation-${conversations.length + 1}`,
                    isGroup: Boolean(data.isGroup),
                    lastMessageAt: null,
                    name: data.name ?? null,
                    userIds
                };

                conversations.push(conversation);

                for (const user of users) {
                    if (userIds.includes(user.id) && !user.conversationIds.includes(conversation.id)) {
                        user.conversationIds.push(conversation.id);
                    }
                }

                return {
                    ...conversation,
                    users: include?.users
                        ? users.filter((user) => userIds.includes(user.id))
                        : undefined
                };
            }
        },
        async $disconnect() {
            return undefined;
        }
    } as unknown as PrismaClient;

    return {
        client,
        conversations,
        users
    };
}

export default class ConversationsIntegrationEnvironment {
    readonly outbox = createOutboxRepositoryFake();
    readonly prisma = createConversationsPrismaMock();
    app!: FastifyInstance;

    async setup() {
        this.app = await buildTestApp({
            outboxModule: {
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

    async registerUser(data: { email: string; name: string; password: string }) {
        const response = await this.app.inject({
            method: "POST",
            payload: data,
            url: "/auth/register"
        });

        return {
            cookie: response.cookies[0]?.value ?? "",
            cookieName: TEST_AUTH_COOKIE_NAME,
            user: this.prisma.users.find((user) => user.email === data.email) ?? null
        };
    }
}
