import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

import { env } from "../config/env";

declare global {
    var prisma: PrismaClient | undefined;
}

type PrismaPluginOptions = {
    client?: PrismaClient;
};


function getDefaultPrismaClient() {
    if (env.NODE_ENV === "production") {
        return new PrismaClient();
    }

    if (!globalThis.prisma) {
        globalThis.prisma = new PrismaClient();
    }

    return globalThis.prisma;
}

export default fp<PrismaPluginOptions>(async (app, options) => {
    const prisma = options.client ?? getDefaultPrismaClient();
    const shouldDisconnect = !options.client;

    app.decorate("prisma", prisma);

    app.addHook("onClose", async () => {
        if (shouldDisconnect) {
            await prisma.$disconnect();
        }
    });
}, {
    name: "prisma-plugin"
});

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
