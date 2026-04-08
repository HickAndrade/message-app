import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest } from "../../plugins/request-auth.plugin";
import { validateBody } from "../../shared/middlewares/validate-body";
import { createConversationSchema, type CreateConversationDTO } from "./conversations.schemas";
import type { ConversationsService } from "./conversations.service";

type ConversationParams = {
    conversationId: string;
};

export const conversationsRoutes = (conversationsService: ConversationsService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.get("/conversations", { preHandler: [authenticateRequest] }, async (request) => {
        return conversationsService.listForUser(request.currentUser!.id);
    });

    app.get("/conversations/:conversationId", { preHandler: [authenticateRequest] }, async (request) => {
        const params = request.params as ConversationParams;
        return conversationsService.getById(request.currentUser!.id, params.conversationId);
    });

    app.get("/conversations/:conversationId/messages", { preHandler: [authenticateRequest] }, async (request) => {
        const params = request.params as ConversationParams;
        return conversationsService.listMessages(request.currentUser!.id, params.conversationId);
    });

    app.post(
        "/conversations",
        {
            preHandler: [
                authenticateRequest,
                validateBody(createConversationSchema)
            ]
        },
        async (request, reply) => {
            const conversation = await conversationsService.create(
                request.currentUser!,
                request.body as CreateConversationDTO
            );

            reply.code(201).send(conversation);
        }
    );

    app.delete("/conversations/:conversationId", { preHandler: [authenticateRequest] }, async (request) => {
        const params = request.params as ConversationParams;
        return conversationsService.remove(request.currentUser!, params.conversationId);
    });

    app.post("/conversations/:conversationId/seen", { preHandler: [authenticateRequest] }, async (request) => {
        const params = request.params as ConversationParams;
        return conversationsService.markSeen(request.currentUser!, params.conversationId);
    });
};
