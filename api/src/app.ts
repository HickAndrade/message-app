import Fastify from "fastify";
import type { PrismaClient } from "@prisma/client";

import { isHttpError } from "./shared/errors/http-error";
import authPlugin from "./modules/auth/auth.plugin";
import conversationsPlugin from "./modules/conversations/conversations.plugin";
import healthModule from "./modules/health/health.plugin";
import messagesPlugin, {
    type MessagesPluginOptions
} from "./modules/messages/messages.plugin";
import outboxPlugin, {
    type OutboxPluginOptions
} from "./modules/outbox/outbox.plugin";
import realtimeRoutesPlugin from "./modules/realtime/realtime.plugin";
import usersPlugin from "./modules/users/users.plugin";
import prismaPlugin from "./plugins/prisma.plugin";
import requestContextPlugin from "./plugins/request-context.plugin";
import type { RealtimeService } from "./plugins/realtime.plugin";
import requestAuthPlugin from "./plugins/request-auth.plugin";
import realtimePlugin from "./plugins/realtime.plugin";
import supportPlugin from "./plugins/support.plugin";

export type BuildAppOptions = {
    logger?: boolean;
    messagesModule?: MessagesPluginOptions;
    outboxModule?: OutboxPluginOptions;
    prisma?: PrismaClient;
    realtimeService?: RealtimeService;
};

export function buildApp(options: BuildAppOptions = {}) {
    const app = Fastify({
        logger: options.logger ?? true
    });

    app.register(supportPlugin);
    app.register(requestContextPlugin);
    app.register(prismaPlugin, { client: options.prisma });
    app.register(realtimePlugin, { service: options.realtimeService });
    app.register(usersPlugin);
    app.register(requestAuthPlugin);
    app.register(healthModule);
    app.register(authPlugin);

    if (options.outboxModule) {
        app.register(outboxPlugin, options.outboxModule);
    } else {
        app.register(outboxPlugin);
    }

    if (options.messagesModule) {
        app.register(messagesPlugin, options.messagesModule);
    } else {
        app.register(messagesPlugin);
    }

    app.register(conversationsPlugin);
    app.register(realtimeRoutesPlugin);

    app.setErrorHandler((error, request, reply) => {
        if (isHttpError(error)) {
            reply.code(error.statusCode).send({
                message: error.message
            });
            return;
        }

        request.log.error(error);
        reply.code(500).send({
            message: "Internal Error"
        });
    });

    return app;
}
