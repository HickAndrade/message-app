import fp from "fastify-plugin";

import { conversationsRoutes } from "./conversations.routes";
import { ConversationsService } from "./conversations.service";
import { PrismaConversationsRepository } from "./repositories/conversations.repository";

export default fp(async (app) => {
    const repository = new PrismaConversationsRepository(app.prisma);
    const conversationsService = new ConversationsService(repository, app.chatEventPublisher);

    await app.register(conversationsRoutes(conversationsService));
}, {
    name: "conversations-module",
    dependencies: ["prisma-plugin", "chat-event-publisher-plugin", "request-auth-plugin"]
});
