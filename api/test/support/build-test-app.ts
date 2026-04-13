import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import type { ChatEventPublisher } from "../../src/plugins/chat-event-publisher.plugin";
import type { RealtimeService } from "../../src/plugins/realtime.plugin";
import { applyTestEnv } from "./test-env";

type BuildTestAppOptions = {
    chatEventPublisher?: ChatEventPublisher;
    prisma?: PrismaClient;
    realtimeService?: RealtimeService;
};

export async function buildTestApp(options: BuildTestAppOptions = {}): Promise<FastifyInstance> {
    applyTestEnv();

    const { buildApp } = await import("../../src/app");
    const app = buildApp({
        chatEventPublisher: options.chatEventPublisher,
        logger: false,
        prisma: options.prisma,
        realtimeService: options.realtimeService
    });

    await app.ready();

    return app;
}
