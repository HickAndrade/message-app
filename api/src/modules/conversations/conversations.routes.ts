import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest, getCurrentUser } from "../../plugins/request-auth.plugin";
import {
    createAuthenticatedUserRateLimit,
    RATE_LIMIT_POLICIES
} from "../../shared/middlewares/rate-limit";
import { validateBody } from "../../shared/middlewares/validate-body";
import { validateParams } from "../../shared/middlewares/validate-params";
import {
    conversationParamsSchema,
    createConversationSchema,
    type ConversationParams,
    type CreateConversationDTO
} from "./conversations.schemas";
import type { ConversationsService } from "./conversations.service";

type ConversationParamsRoute = {
    Params: ConversationParams;
};

type CreateConversationRoute = {
    Body: CreateConversationDTO;
};

export const conversationsRoutes = (conversationsService: ConversationsService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    const createConversationRateLimit = createAuthenticatedUserRateLimit(
        RATE_LIMIT_POLICIES.conversationsCreate
    );

    app.get("/conversations", { preHandler: [authenticateRequest] }, async (request) => {
        return conversationsService.listForUser(getCurrentUser(request).id);
    });

    app.get<ConversationParamsRoute>(
        "/conversations/:conversationId",
        {
            preHandler: [
                authenticateRequest,
                validateParams(conversationParamsSchema)
            ]
        },
        async (request) => {
            return conversationsService.getById(getCurrentUser(request).id, request.params.conversationId);
        }
    );

    app.get<ConversationParamsRoute>(
        "/conversations/:conversationId/messages",
        {
            preHandler: [
                authenticateRequest,
                validateParams(conversationParamsSchema)
            ]
        },
        async (request) => {
            return conversationsService.listMessages(getCurrentUser(request).id, request.params.conversationId);
        }
    );

    app.post<CreateConversationRoute>(
        "/conversations",
        {
            preHandler: [
                authenticateRequest,
                createConversationRateLimit,
                validateBody(createConversationSchema)
            ]
        },
        async (request, reply) => {
            const currentUser = getCurrentUser(request);
            const conversation = await conversationsService.create(
                currentUser,
                request.body
            );

            reply.code(201).send(conversation);
        }
    );

    app.delete<ConversationParamsRoute>(
        "/conversations/:conversationId",
        {
            preHandler: [
                authenticateRequest,
                validateParams(conversationParamsSchema)
            ]
        },
        async (request) => {
            return conversationsService.remove(getCurrentUser(request), request.params.conversationId);
        }
    );

    app.post<ConversationParamsRoute>(
        "/conversations/:conversationId/seen",
        {
            preHandler: [
                authenticateRequest,
                validateParams(conversationParamsSchema)
            ]
        },
        async (request) => {
            return conversationsService.markSeen(getCurrentUser(request), request.params.conversationId);
        }
    );
};
