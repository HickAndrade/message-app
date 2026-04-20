import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest, getCurrentUser } from "../../plugins/request-auth.plugin";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type UpdateSettingsDTO, updateSettingsSchema } from "./users.schemas";
import type { UsersService } from "./users.service";

type UpdateSettingsRoute = {
    Body: UpdateSettingsDTO;
};

export const usersRoutes = (usersService: UsersService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.get("/users/me", { preHandler: [authenticateRequest] }, async (request) => {
        return usersService.toPublicUser(getCurrentUser(request));
    });

    app.get("/users", { preHandler: [authenticateRequest] }, async (request) => {
        return usersService.listUsers(getCurrentUser(request).email);
    });

    app.post<UpdateSettingsRoute>(
        "/users/settings",
        {
            preHandler: [
                authenticateRequest,
                validateBody(updateSettingsSchema)
            ]
        },
        async (request) => {
            const currentUser = getCurrentUser(request);

            return usersService.updateSettings(
                currentUser.id,
                request.body
            );
        }
    );
};
