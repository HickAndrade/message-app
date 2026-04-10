import fp from "fastify-plugin";

import { PrismaUsersRepository } from "./repositories/users.repository";
import { usersRoutes } from "./users.routes";
import { UsersService } from "./users.service";

export default fp(async (app) => {
    const repository = new PrismaUsersRepository(app.prisma);
    const userService = new UsersService(repository);

    app.decorate("userService", userService);
    await app.register(usersRoutes(userService));
}, {
    name: "users-plugin",
    dependencies: ["prisma-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        userService: UsersService;
    }
}
