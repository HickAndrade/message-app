import type { FastifyBaseLogger } from "fastify";

import type { RequestContext } from "../../../plugins/request-context.plugin";
import type {
    ChatOutboxEvent,
    OutboxRepository
} from "../repositories/outbox.repository.types";
import type {
    ConversationBroadcastPayload,
    ConversationUpdatePayload,
    EventRecipient
} from "./chat-events";
import { CHAT_OUTBOX_TOPICS } from "./chat-events";

export interface ChatEventPublisher {
    publishConversationCreated(conversation: ConversationBroadcastPayload): Promise<void>;
    publishConversationRemoved(conversation: ConversationBroadcastPayload): Promise<void>;
    publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload): Promise<void>;
    publishMessageCreated(conversationId: string, message: unknown): Promise<void>;
    publishMessageUpdated(conversationId: string, message: unknown): Promise<void>;
}

export class OutboxChatEventPublisher implements ChatEventPublisher {
    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly logger: Pick<FastifyBaseLogger, "info">,
        private readonly getRequestContext: () => RequestContext | null
    ) {}

    private async enqueueWithRequestContext(event: ChatOutboxEvent) {
        const requestContext = this.getRequestContext();
        const record = await this.outboxRepository.enqueue({
            ...event,
            requestId: requestContext?.requestId ?? null
        });

        this.logger.info({
            outboxEventId: record.id,
            requestId: record.requestId,
            status: record.status,
            topic: record.topic
        }, "Chat event enqueued in outbox");
    }

    async publishConversationCreated(conversation: ConversationBroadcastPayload) {
        await this.enqueueWithRequestContext({
            payload: conversation,
            topic: CHAT_OUTBOX_TOPICS.conversationCreated
        });
    }

    async publishConversationRemoved(conversation: ConversationBroadcastPayload) {
        await this.enqueueWithRequestContext({
            payload: conversation,
            topic: CHAT_OUTBOX_TOPICS.conversationRemoved
        });
    }

    async publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload) {
        await this.enqueueWithRequestContext({
            payload: {
                conversation: payload,
                users
            },
            topic: CHAT_OUTBOX_TOPICS.conversationUpdated
        });
    }

    async publishMessageCreated(conversationId: string, message: unknown) {
        await this.enqueueWithRequestContext({
            payload: {
                conversationId,
                message
            },
            topic: CHAT_OUTBOX_TOPICS.messageCreated
        });
    }

    async publishMessageUpdated(conversationId: string, message: unknown) {
        await this.enqueueWithRequestContext({
            payload: {
                conversationId,
                message
            },
            topic: CHAT_OUTBOX_TOPICS.messageUpdated
        });
    }
}
