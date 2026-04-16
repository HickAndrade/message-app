import { Prisma, type PrismaClient } from "@prisma/client";

import type {
    ChatOutboxEvent,
    OutboxEventRecord,
    OutboxStatus,
    OutboxRepository
} from "./outbox.repository.types";
import { OUTBOX_STATUSES } from "./outbox.repository.types";

type StoredOutboxRecord = {
    attempts: number;
    availableAt: Date;
    createdAt: Date;
    id: string;
    lastError: string | null;
    payload: Prisma.JsonValue;
    processedAt: Date | null;
    status: string;
    topic: string;
    updatedAt: Date;
};

function toOutboxStatus(status: string): OutboxStatus {
    switch (status) {
        case OUTBOX_STATUSES.pending:
        case OUTBOX_STATUSES.processing:
        case OUTBOX_STATUSES.processed:
        case OUTBOX_STATUSES.failed:
            return status;
        default:
            throw new Error(`Unknown outbox status: ${status}`);
    }
}

export class PrismaOutboxRepository implements OutboxRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private toRecord(record: StoredOutboxRecord): OutboxEventRecord {
        return {
            attempts: record.attempts,
            availableAt: record.availableAt,
            createdAt: record.createdAt,
            id: record.id,
            lastError: record.lastError,
            payload: record.payload as ChatOutboxEvent["payload"],
            processedAt: record.processedAt,
            status: toOutboxStatus(record.status),
            topic: record.topic as ChatOutboxEvent["topic"],
            updatedAt: record.updatedAt
        } as OutboxEventRecord;
    }

    async enqueue(event: ChatOutboxEvent) {
        const record = await this.prisma.outboxEvent.create({
            data: {
                payload: event.payload as Prisma.InputJsonValue,
                topic: event.topic
            }
        });

        return this.toRecord(record);
    }

    async claimNext(now = new Date()) {
        const candidate = await this.prisma.outboxEvent.findFirst({
            orderBy: [
                {
                    availableAt: "asc"
                },
                {
                    createdAt: "asc"
                }
            ],
            where: {
                availableAt: {
                    lte: now
                },
                status: OUTBOX_STATUSES.pending
            }
        });

        if (!candidate) {
            return null;
        }

        const claimed = await this.prisma.outboxEvent.updateMany({
            data: {
                attempts: {
                    increment: 1
                },
                lastError: null,
                status: OUTBOX_STATUSES.processing
            },
            where: {
                availableAt: {
                    lte: now
                },
                id: candidate.id,
                status: OUTBOX_STATUSES.pending
            }
        });

        if (claimed.count === 0) {
            return null;
        }

        const record = await this.prisma.outboxEvent.findUnique({
            where: {
                id: candidate.id
            }
        });

        return record ? this.toRecord(record) : null;
    }

    async markProcessed(id: string) {
        await this.prisma.outboxEvent.update({
            data: {
                lastError: null,
                processedAt: new Date(),
                status: OUTBOX_STATUSES.processed
            },
            where: {
                id
            }
        });
    }

    async markRetry(id: string, errorMessage: string, availableAt: Date) {
        await this.prisma.outboxEvent.update({
            data: {
                availableAt,
                lastError: errorMessage,
                status: OUTBOX_STATUSES.pending
            },
            where: {
                id
            }
        });
    }

    async markFailed(id: string, errorMessage: string) {
        await this.prisma.outboxEvent.update({
            data: {
                lastError: errorMessage,
                status: OUTBOX_STATUSES.failed
            },
            where: {
                id
            }
        });
    }
}
