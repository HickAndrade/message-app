import type { User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

function getHeaderValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0]?.trim() || null;
    }

    if (typeof value === "string") {
        return value.trim() || null;
    }

    return null;
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply) {
    const email = getHeaderValue(request.headers["x-user-email"]);

    if (!email) {
        reply.code(401).send({
            message: "Unauthorized"
        });
        return;
    }

    const currentUser = await request.server.userService.findByEmail(email);

    if (!currentUser) {
        reply.code(401).send({
            message: "Unauthorized"
        });
        return;
    }

    request.currentUser = currentUser;
}

export default fp(async (app) => {
    app.decorate("authenticate", authenticateRequest);
}, {
    name: "request-auth-plugin",
    dependencies: ["users-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }

    interface FastifyRequest {
        currentUser: User | null;
    }
}
