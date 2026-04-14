import type { FastifyInstance } from "fastify";

import type { BuildAppOptions } from "../../app";
import { applyTestEnv } from "./test-env";

export async function buildTestApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
    applyTestEnv();

    const { buildApp } = await import("../../app.js");

    const app = buildApp({
        logger: false,
        ...options
    });

    await app.ready();

    return app;
}
