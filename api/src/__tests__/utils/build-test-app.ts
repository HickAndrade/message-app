import type { FastifyInstance } from "fastify";

import type { BuildAppOptions } from "../../app";
import { createPrismaMock } from "./prisma-mock";
import { applyTestEnv } from "./test-env";

export async function buildTestApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
    applyTestEnv();

    const { buildApp } = await import("../../app.js");
    const defaultPrisma = options.prisma ?? createPrismaMock().client;

    const app = buildApp({
        logger: false,
        prisma: defaultPrisma,
        ...options
    });

    await app.ready();

    return app;
}
