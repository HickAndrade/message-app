import type { CreatedMessageRecord } from "../../messages/repositories/types";
import type {
    ConversationBroadcastPayload,
    ConversationUpdatePayload,
    EventRecipient
} from "../chat/chat-events";
import { CHAT_OUTBOX_TOPICS } from "../chat/chat-events";

export const OUTBOX_STATUSES = {
    pending: "pending",
    processing: "processing",
    processed: "processed",
    failed: "failed"
} as const;

export type OutboxStatus = typeof OUTBOX_STATUSES[keyof typeof OUTBOX_STATUSES];

export type ConversationCreatedOutboxEvent = {
    payload: ConversationBroadcastPayload;
    topic: typeof CHAT_OUTBOX_TOPICS.conversationCreated;
};

export type ConversationRemovedOutboxEvent = {
    payload: ConversationBroadcastPayload;
    topic: typeof CHAT_OUTBOX_TOPICS.conversationRemoved;
};

export type ConversationUpdatedOutboxEvent = {
    payload: {
        conversation: ConversationUpdatePayload;
        users: EventRecipient[];
    };
    topic: typeof CHAT_OUTBOX_TOPICS.conversationUpdated;
};

export type MessageCreatedOutboxEvent = {
    payload: {
        conversationId: string;
        message: CreatedMessageRecord;
    };
    topic: typeof CHAT_OUTBOX_TOPICS.messageCreated;
};

export type MessageUpdatedOutboxEvent = {
    payload: {
        conversationId: string;
        message: CreatedMessageRecord;
    };
    topic: typeof CHAT_OUTBOX_TOPICS.messageUpdated;
};

export type ChatOutboxEvent =
    | ConversationCreatedOutboxEvent
    | ConversationRemovedOutboxEvent
    | ConversationUpdatedOutboxEvent
    | MessageCreatedOutboxEvent
    | MessageUpdatedOutboxEvent;

export type EnqueueOutboxEvent = ChatOutboxEvent & {
    requestId?: string | null;
};

export type OutboxEventRecord = ChatOutboxEvent & {
    attempts: number;
    availableAt: Date;
    createdAt: Date;
    id: string;
    lastError: string | null;
    processedAt: Date | null;
    requestId: string | null;
    status: OutboxStatus;
    updatedAt: Date;
};

export interface OutboxRepository {
    enqueue(event: EnqueueOutboxEvent): Promise<OutboxEventRecord>;
    claimNext(now?: Date): Promise<OutboxEventRecord | null>;
    markFailed(id: string, errorMessage: string): Promise<void>;
    markProcessed(id: string): Promise<void>;
    markRetry(id: string, errorMessage: string, availableAt: Date): Promise<void>;
}
