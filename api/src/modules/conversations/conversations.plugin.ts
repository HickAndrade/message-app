import fp from "fastify-plugin";

import { conversationsRoutes } from "./conversations.routes";
import { ConversationsService } from "./conversations.service";
import { ConversationsRepository } from "./repositories/conversations.repository";

export default fp(async (app) => {
    const repository = new ConversationsRepository(app.prisma);
    const conversationsService = new ConversationsService(repository, app.realtimeService);

    app.decorate("conversationsService", conversationsService);
    await app.register(conversationsRoutes(conversationsService));
}, {
    name: "conversations-module",
    dependencies: ["prisma-plugin", "realtime-plugin", "request-auth-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        conversationsService: ConversationsService;
    }
}
