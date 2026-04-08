import fp from "fastify-plugin";

import { authRoutes } from "./auth.routes";
import { AuthService } from "./auth.service";

export default fp(async (app) => {
    const authService = new AuthService(app.userService);

    await app.register(authRoutes(authService));
}, {
    name: "auth-module",
    dependencies: ["users-plugin"]
});
