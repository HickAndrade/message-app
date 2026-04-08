import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { validateBody } from "../../shared/middlewares/validate-body";
import { type RegisterDTO, registerSchema } from "./auth.schemas";
import type { AuthService } from "./auth.service";

export const authRoutes = (authService: AuthService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.post(
        "/register",
        {
            preHandler: [validateBody(registerSchema)]
        },
        async (request, reply) => {
            const user = await authService.register(request.body as RegisterDTO);
            reply.code(201).send(user);
        }
    );
};
