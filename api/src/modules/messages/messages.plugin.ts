import fp from "fastify-plugin";

import { PrismaConversationsRepository } from "../conversations/repositories/conversations.repository";
import { messagesRoutes } from "./messages.routes";
import type {
    MessagesConversationLookup,
    MessagesEventPublisher
} from "./messages.types";
import { MessagesService } from "./messages.service";
import { PrismaMessagesRepository } from "./repositories/messages.repository";
import type { MessagesRepository } from "./repositories/types";

export type MessagesPluginOptions = {
    conversationsRepository?: MessagesConversationLookup;
    eventPublisher?: MessagesEventPublisher;
    messagesRepository?: MessagesRepository;
};

export default fp<MessagesPluginOptions>(async (app, options) => {
    const messagesRepository = options.messagesRepository ?? new PrismaMessagesRepository(app.prisma);
    const conversationsRepository = options.conversationsRepository
        ?? new PrismaConversationsRepository(app.prisma);
    const messagesService = new MessagesService(
        messagesRepository,
        conversationsRepository,
        options.eventPublisher ?? app.chatEventPublisher
    );

    await app.register(messagesRoutes(messagesService));
}, {
    name: "messages-module",
    dependencies: ["prisma-plugin", "chat-event-publisher-plugin", "request-auth-plugin"]
});
