import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config/env";

type AuthTokenPayload = {
    email: string;
    name: string | null;
    sub: string;
};

const COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production"
};

function buildTokenPayload(user: User): AuthTokenPayload {
    return {
        sub: user.id,
        email: user.email,
        name: user.name ?? null
    };
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify<AuthTokenPayload>();
    } catch (error) {
        reply.code(401).send({
            message: "Unauthorized"
        });
        return;
    }

    const currentUser = await request.server.userService.findById(request.user.sub);

    if (!currentUser) {
        reply.code(401).send({
            message: "Unauthorized"
        });
        return;
    }

    request.currentUser = currentUser;
}

export default fp(async (app) => {
    await app.register(cookie);
    await app.register(jwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: env.AUTH_COOKIE_NAME,
            signed: false
        },
        sign: {
            expiresIn: env.AUTH_TOKEN_TTL
        }
    });

    app.decorate("authenticate", authenticateRequest);
    app.decorate("setAuthCookie", async (reply: FastifyReply, user: User) => {
        const token = await reply.jwtSign(buildTokenPayload(user));

        reply.setCookie(env.AUTH_COOKIE_NAME, token, COOKIE_BASE_OPTIONS);
    });
    app.decorate("clearAuthCookie", (reply: FastifyReply) => {
        reply.clearCookie(env.AUTH_COOKIE_NAME, COOKIE_BASE_OPTIONS);
    });
}, {
    name: "request-auth-plugin",
    dependencies: ["users-plugin"]
});

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: AuthTokenPayload;
        user: AuthTokenPayload;
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        clearAuthCookie: (reply: FastifyReply) => void;
        setAuthCookie: (reply: FastifyReply, user: User) => Promise<void>;
    }

    interface FastifyRequest {
        currentUser: User | null;
    }
}
