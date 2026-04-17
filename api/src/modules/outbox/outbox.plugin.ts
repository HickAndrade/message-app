import fp from "fastify-plugin";

import { env } from "../../config/env";
import { OutboxDispatcher } from "./outbox-dispatcher";
import {
    type ChatEventPublisher,
    OutboxChatEventPublisher
} from "./chat/chat-event-publisher";
import { PusherChatEventDelivery } from "./chat/pusher-chat-event-delivery";
import { PrismaOutboxRepository } from "./repositories/outbox.repository";
import type { OutboxRepository } from "./repositories/outbox.repository.types";

const DEFAULT_POLL_INTERVAL_MS = 1_000;

export type OutboxPluginOptions = {
    deliveryPublisher?: ChatEventPublisher;
    repository?: OutboxRepository;
};

export default fp<OutboxPluginOptions>(async (app, options) => {
    const outboxLogger = app.log.child({
        module: "outbox"
    });
    const publisherLogger = outboxLogger.child({
        component: "publisher"
    });
    const dispatcherLogger = outboxLogger.child({
        component: "dispatcher"
    });
    const outboxRepository = options.repository ?? new PrismaOutboxRepository(app.prisma);
    const chatEventPublisher = new OutboxChatEventPublisher(
        outboxRepository,
        publisherLogger,
        app.getRequestContext
    );
    const deliveryPublisher = options.deliveryPublisher ?? new PusherChatEventDelivery(app.realtimeService);
    const outboxDispatcher = new OutboxDispatcher(outboxRepository, deliveryPublisher, dispatcherLogger);

    app.decorate("outboxRepository", outboxRepository);
    app.decorate("chatEventPublisher", chatEventPublisher);
    app.decorate("outboxDispatcher", outboxDispatcher);

    let timer: NodeJS.Timeout | null = null;

    if (env.NODE_ENV !== "test") {
        app.addHook("onReady", async () => {
            outboxLogger.info({
                pollIntervalMs: DEFAULT_POLL_INTERVAL_MS
            }, "Starting outbox dispatcher loop");

            timer = setInterval(() => {
                void outboxDispatcher.dispatchNext().catch((error) => {
                    outboxLogger.error({
                        err: error
                    }, "Outbox dispatcher poll failed");
                });
            }, DEFAULT_POLL_INTERVAL_MS);

            timer.unref();
        });
    }

    app.addHook("onClose", async () => {
        if (timer) {
            clearInterval(timer);
            outboxLogger.info("Stopped outbox dispatcher loop");
        }
    });
}, {
    name: "outbox-plugin",
    dependencies: ["prisma-plugin", "realtime-plugin", "request-context-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        chatEventPublisher: ChatEventPublisher;
        outboxDispatcher: OutboxDispatcher;
        outboxRepository: OutboxRepository;
    }
}
