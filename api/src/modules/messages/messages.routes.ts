import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest, getCurrentUser } from "../../plugins/request-auth.plugin";
import {
    createAuthenticatedUserRateLimit,
    RATE_LIMIT_POLICIES
} from "../../shared/middlewares/rate-limit";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type SendMessageDTO, sendMessageSchema } from "./messages.schemas";
import type { MessagesService } from "./messages.service";

type SendMessageRoute = {
    Body: SendMessageDTO;
};

export const messagesRoutes = (messagesService: MessagesService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    const createMessageRateLimit = createAuthenticatedUserRateLimit(RATE_LIMIT_POLICIES.messagesCreate);

    app.post<SendMessageRoute>(
        "/messages",
        {
            preHandler: [
                authenticateRequest,
                createMessageRateLimit,
                validateBody(sendMessageSchema)
            ]
        },
        async (request) => {
            return messagesService.create(
                getCurrentUser(request),
                request.body
            );
        }
    );
};
