import Fastify from "fastify";
import type { PrismaClient } from "@prisma/client";

import { isHttpError } from "./shared/errors/http-error";
import authPlugin from "./modules/auth/auth.plugin";
import conversationsPlugin from "./modules/conversations/conversations.plugin";
import healthModule from "./modules/health/health.plugin";
import messagesPlugin from "./modules/messages/messages.plugin";
import realtimeRoutesPlugin from "./modules/realtime/realtime.plugin";
import usersPlugin from "./modules/users/users.plugin";
import prismaPlugin from "./plugins/prisma.plugin";
import chatEventPublisherPlugin, {
    type ChatEventPublisher
} from "./plugins/chat-event-publisher.plugin";
import type { RealtimeService } from "./plugins/realtime.plugin";
import requestAuthPlugin from "./plugins/request-auth.plugin";
import realtimePlugin from "./plugins/realtime.plugin";
import supportPlugin from "./plugins/support.plugin";

type BuildAppOptions = {
    chatEventPublisher?: ChatEventPublisher;
    logger?: boolean;
    prisma?: PrismaClient;
    realtimeService?: RealtimeService;
};

export function buildApp(options: BuildAppOptions = {}) {
    const app = Fastify({
        logger: options.logger ?? true
    });

    app.register(supportPlugin);
    app.register(prismaPlugin, { client: options.prisma });
    app.register(realtimePlugin, { service: options.realtimeService });
    app.register(chatEventPublisherPlugin, { publisher: options.chatEventPublisher });
    app.register(usersPlugin);
    app.register(requestAuthPlugin);
    app.register(healthModule);
    app.register(authPlugin);
    app.register(conversationsPlugin);
    app.register(messagesPlugin);
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
