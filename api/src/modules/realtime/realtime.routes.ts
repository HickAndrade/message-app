import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest } from "../../plugins/request-auth.plugin";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type PusherAuthDTO, pusherAuthSchema } from "./realtime.schemas";
import type { PusherAuthService } from "./realtime.service";

export const realtimeRoutes = (pusherAuthService: PusherAuthService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.post(
        "/pusher/auth",
        {
            preHandler: [
                authenticateRequest,
                validateBody(pusherAuthSchema, "Invalid pusher auth payload")
            ]
        },
        async (request) => {
            return pusherAuthService.authorize(
                request.currentUser!.email,
                request.body as PusherAuthDTO
            );
        }
    );
};
