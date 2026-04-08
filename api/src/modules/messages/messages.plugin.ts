import fp from "fastify-plugin";

import { ConversationsRepository } from "../conversations/repositories/conversations.repository";
import { messagesRoutes } from "./messages.routes";
import { MessagesService } from "./messages.service";
import { MessagesRepository } from "./repositories/messages.repository";

export default fp(async (app) => {
    const messagesRepository = new MessagesRepository(app.prisma);
    const conversationsRepository = new ConversationsRepository(app.prisma);
    const messagesService = new MessagesService(
        messagesRepository,
        conversationsRepository,
        app.realtimeService
    );

    app.decorate("messagesService", messagesService);
    await app.register(messagesRoutes(messagesService));
}, {
    name: "messages-module",
    dependencies: ["prisma-plugin", "realtime-plugin", "request-auth-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        messagesService: MessagesService;
    }
}
