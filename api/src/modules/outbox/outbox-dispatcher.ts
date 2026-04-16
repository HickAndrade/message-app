import { CHAT_OUTBOX_TOPICS } from "./chat/chat-events";
import type { ChatEventPublisher } from "./chat/chat-event-publisher";
import type {
    ChatOutboxEvent,
    OutboxEventRecord,
    OutboxRepository
} from "./repositories/outbox.repository.types";

const DEFAULT_RETRY_DELAY_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 3;

function toErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown outbox dispatch error";
}

export class OutboxDispatcher {
    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly deliveryPublisher: ChatEventPublisher,
        private readonly options: {
            maxAttempts: number;
            retryDelayMs: number;
        } = {
            maxAttempts: DEFAULT_MAX_ATTEMPTS,
            retryDelayMs: DEFAULT_RETRY_DELAY_MS
        }
    ) {}

    private async deliver(event: ChatOutboxEvent) {
        switch (event.topic) {
            case CHAT_OUTBOX_TOPICS.conversationCreated:
                await this.deliveryPublisher.publishConversationCreated(event.payload);
                return;
            case CHAT_OUTBOX_TOPICS.conversationRemoved:
                await this.deliveryPublisher.publishConversationRemoved(event.payload);
                return;
            case CHAT_OUTBOX_TOPICS.conversationUpdated:
                await this.deliveryPublisher.publishConversationUpdated(
                    event.payload.users,
                    event.payload.conversation
                );
                return;
            case CHAT_OUTBOX_TOPICS.messageCreated:
                await this.deliveryPublisher.publishMessageCreated(
                    event.payload.conversationId,
                    event.payload.message
                );
                return;
            case CHAT_OUTBOX_TOPICS.messageUpdated:
                await this.deliveryPublisher.publishMessageUpdated(
                    event.payload.conversationId,
                    event.payload.message
                );
                return;
            default: {
                const exhaustiveCheck: never = event;
                return exhaustiveCheck;
            }
        }
    }

    async dispatchNext(now = new Date()) {
        const event = await this.outboxRepository.claimNext(now);

        if (!event) {
            return false;
        }

        try {
            await this.deliver(event);
            await this.outboxRepository.markProcessed(event.id);
        } catch (error) {
            await this.handleFailure(event, error, now);
        }

        return true;
    }

    private async handleFailure(event: OutboxEventRecord, error: unknown, now: Date) {
        const errorMessage = toErrorMessage(error);

        if (event.attempts >= this.options.maxAttempts) {
            await this.outboxRepository.markFailed(event.id, errorMessage);
            return;
        }

        await this.outboxRepository.markRetry(
            event.id,
            errorMessage,
            new Date(now.getTime() + this.options.retryDelayMs)
        );
    }
}
