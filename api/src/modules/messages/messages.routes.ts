import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest } from "../../plugins/request-auth.plugin";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type SendMessageDTO, sendMessageSchema } from "./messages.schemas";
import type { MessagesService } from "./messages.service";

export const messagesRoutes = (messagesService: MessagesService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.post(
        "/messages",
        {
            preHandler: [
                authenticateRequest,
                validateBody(sendMessageSchema)
            ]
        },
        async (request) => {
            return messagesService.create(
                request.currentUser!,
                request.body as SendMessageDTO
            );
        }
    );
};
