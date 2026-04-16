import type { OutboxRepository } from "../repositories/outbox.repository.types";
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
    constructor(private readonly outboxRepository: OutboxRepository) {}

    async publishConversationCreated(conversation: ConversationBroadcastPayload) {
        await this.outboxRepository.enqueue({
            payload: conversation,
            topic: CHAT_OUTBOX_TOPICS.conversationCreated
        });
    }

    async publishConversationRemoved(conversation: ConversationBroadcastPayload) {
        await this.outboxRepository.enqueue({
            payload: conversation,
            topic: CHAT_OUTBOX_TOPICS.conversationRemoved
        });
    }

    async publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload) {
        await this.outboxRepository.enqueue({
            payload: {
                conversation: payload,
                users
            },
            topic: CHAT_OUTBOX_TOPICS.conversationUpdated
        });
    }

    async publishMessageCreated(conversationId: string, message: unknown) {
        await this.outboxRepository.enqueue({
            payload: {
                conversationId,
                message
            },
            topic: CHAT_OUTBOX_TOPICS.messageCreated
        });
    }

    async publishMessageUpdated(conversationId: string, message: unknown) {
        await this.outboxRepository.enqueue({
            payload: {
                conversationId,
                message
            },
            topic: CHAT_OUTBOX_TOPICS.messageUpdated
        });
    }
}
