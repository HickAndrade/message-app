import fp from "fastify-plugin";

import { PrismaConversationsRepository } from "../conversations/repositories/conversations.repository";
import { messagesRoutes } from "./messages.routes";
import { MessagesService } from "./messages.service";
import { PrismaMessagesRepository } from "./repositories/messages.repository";

export default fp(async (app) => {
    const messagesRepository = new PrismaMessagesRepository(app.prisma);
    const conversationsRepository = new PrismaConversationsRepository(app.prisma);
    const messagesService = new MessagesService(
        messagesRepository,
        conversationsRepository,
        app.chatEventPublisher
    );

    await app.register(messagesRoutes(messagesService));
}, {
    name: "messages-module",
    dependencies: ["prisma-plugin", "chat-event-publisher-plugin", "request-auth-plugin"]
});
