import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import type { RealtimeService } from "../../src/plugins/realtime.plugin";
import { applyTestEnv } from "./test-env";

type BuildTestAppOptions = {
    prisma?: PrismaClient;
    realtimeService?: RealtimeService;
};

export async function buildTestApp(options: BuildTestAppOptions = {}): Promise<FastifyInstance> {
    applyTestEnv();

    const { buildApp } = await import("../../src/app");
    const app = buildApp({
        logger: false,
        prisma: options.prisma,
        realtimeService: options.realtimeService
    });

    await app.ready();

    return app;
}
