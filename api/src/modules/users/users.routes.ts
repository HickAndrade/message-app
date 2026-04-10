import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import { authenticateRequest } from "../../plugins/request-auth.plugin";
import { validateBody } from "../../shared/middlewares/validate-body";
import { type UpdateSettingsDTO, updateSettingsSchema } from "./users.schemas";
import type { UsersService } from "./users.service";

export const usersRoutes = (usersService: UsersService) => async (
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) => {
    app.get("/users/me", { preHandler: [authenticateRequest] }, async (request) => {
        return usersService.toPublicUser(request.currentUser!);
    });

    app.get("/users", { preHandler: [authenticateRequest] }, async (request) => {
        return usersService.listUsers(request.currentUser!.email);
    });
    
    app.post(
        "/settings",
        {
            preHandler: [
                authenticateRequest,
                validateBody(updateSettingsSchema)
            ]
        },
        async (request) => {
            return usersService.updateSettings(
                request.currentUser!.id,
                request.body as UpdateSettingsDTO
            );
        }
    );
};
