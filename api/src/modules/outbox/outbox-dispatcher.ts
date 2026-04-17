import type { FastifyBaseLogger } from "fastify";

import { CHAT_OUTBOX_TOPICS } from "./chat/chat-events";
import type { ChatEventPublisher } from "./chat/chat-event-publisher";
import type {
    ChatOutboxEvent,
    OutboxEventRecord,
    OutboxRepository
} from "./repositories/outbox.repository.types";

const DEFAULT_RETRY_DELAY_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 3;

type OutboxDispatcherOptions = {
    maxAttempts?: number;
    retryDelayMs?: number;
};

function toErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown outbox dispatch error";
}

export class OutboxDispatcher {
    private readonly logger: Pick<FastifyBaseLogger, "error" | "info" | "warn">;
    private readonly maxAttempts: number;
    private readonly retryDelayMs: number;

    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly deliveryPublisher: ChatEventPublisher,
        logger: Pick<FastifyBaseLogger, "error" | "info" | "warn">,
        {
            maxAttempts = DEFAULT_MAX_ATTEMPTS,
            retryDelayMs = DEFAULT_RETRY_DELAY_MS
        }: OutboxDispatcherOptions = {}
    ) {
        this.logger = logger;
        this.maxAttempts = maxAttempts;
        this.retryDelayMs = retryDelayMs;
    }

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

        this.logger.info({
            attempts: event.attempts,
            outboxEventId: event.id,
            requestId: event.requestId,
            topic: event.topic
        }, "Dispatching outbox event");

        try {
            await this.deliver(event);
            await this.outboxRepository.markProcessed(event.id);
            this.logger.info({
                outboxEventId: event.id,
                requestId: event.requestId,
                topic: event.topic
            }, "Outbox event processed");
        } catch (error) {
            try {
                await this.handleFailure(event, error, now);
            } catch (failureHandlingError) {
                this.logger.error({
                    attempts: event.attempts,
                    cause: error,
                    err: failureHandlingError,
                    outboxEventId: event.id,
                    requestId: event.requestId,
                    topic: event.topic
                }, "Outbox event failure handling crashed");
                throw failureHandlingError;
            }
        }

        return true;
    }

    private async handleFailure(event: OutboxEventRecord, error: unknown, now: Date) {
        const errorMessage = toErrorMessage(error);

        if (event.attempts >= this.maxAttempts) {
            await this.outboxRepository.markFailed(event.id, errorMessage);
            this.logger.error({
                attempts: event.attempts,
                err: error,
                outboxEventId: event.id,
                requestId: event.requestId,
                topic: event.topic
            }, "Outbox event delivery failed permanently");
            return;
        }

        const nextAttemptAt = new Date(now.getTime() + this.retryDelayMs);

        await this.outboxRepository.markRetry(
            event.id,
            errorMessage,
            nextAttemptAt
        );

        this.logger.warn({
            attempts: event.attempts,
            err: error,
            nextAttemptAt,
            outboxEventId: event.id,
            requestId: event.requestId,
            topic: event.topic
        }, "Outbox event delivery failed and was scheduled for retry");
    }
}
