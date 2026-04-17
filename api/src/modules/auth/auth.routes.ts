import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest, getCurrentUser } from "../../plugins/request-auth.plugin";
import {
    createIpRateLimit,
    RATE_LIMIT_POLICIES
} from "../../shared/middlewares/rate-limit";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type LoginDTO, loginSchema, type RegisterDTO, registerSchema } from "./auth.schemas";
import type { AuthService } from "./auth.service";

type RegisterRoute = {
    Body: RegisterDTO;
};

type LoginRoute = {
    Body: LoginDTO;
};

export const authRoutes = (authService: AuthService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    const registerRateLimit = createIpRateLimit(RATE_LIMIT_POLICIES.authRegister);
    const loginRateLimit = createIpRateLimit(RATE_LIMIT_POLICIES.authLogin);

    app.post<RegisterRoute>(
        "/auth/register",
        {
            preHandler: [registerRateLimit, validateBody(registerSchema)]
        },
        async (request, reply) => {
            const { publicUser, user } = await authService.register(request.body);

            await app.setAuthCookie(reply, user);
            reply.code(201).send(publicUser);
        }
    );

    app.post<LoginRoute>(
        "/auth/login",
        {
            preHandler: [loginRateLimit, validateBody(loginSchema)]
        },
        async (request, reply) => {
            const { publicUser, user } = await authService.login(request.body);

            await app.setAuthCookie(reply, user);
            reply.send(publicUser);
        }
    );

    app.get("/auth/me", { preHandler: [authenticateRequest] }, async (request) => {
        return authService.getCurrentUser(getCurrentUser(request));
    });

    app.post("/auth/logout", async (_request, reply) => {
        app.clearAuthCookie(reply);
        reply.code(204).send();
    });
};
