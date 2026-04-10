import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../support/build-test-app";
import { createPrismaMock } from "../support/prisma-mock";
import type { OutgoingHttpHeaders } from "node:http";

let app: FastifyInstance | undefined;

const AUTH_COOKIE_NAME = "message_app_token";

afterEach(async () => {
    if (app) {
        await app.close();
        app = undefined;
    }
});

const setCookieHeader = (headers: OutgoingHttpHeaders) => {
    return Array.isArray(headers["set-cookie"])
        ? headers["set-cookie"][0] ?? ""
        : headers["set-cookie"] ?? "";
}

describe("Auth routes", () => {
    it("creates a user using POST /auth/register and issues an auth cookie", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        const response = await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique",
                password: "123456"
            }
        });

        assert.equal(response.statusCode, 201);

        const body = response.json();

        assert.equal(body.email, "henrique@example.com");
        assert.equal(body.name, "Henrique");
        assert.equal(body.hashedPassword, undefined);
        assert.equal(prisma.users.length, 1);
        assert.match(setCookieHeader(response.headers), new RegExp(`${AUTH_COOKIE_NAME}=`));
    });

    it("rejects duplicate email registration", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique",
                password: "123456"
            }
        });

        const duplicateResponse = await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique Again",
                password: "123456"
            }
        });

        assert.equal(duplicateResponse.statusCode, 400);
        assert.deepEqual(duplicateResponse.json(), {
            message: "This email already registered."
        });
    });

    it("logs in with POST /auth/login and resolves the user with GET /auth/me", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique",
                password: "123456"
            }
        });

        const loginResponse = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: {
                email: "henrique@example.com",
                password: "123456"
            }
        });

        assert.equal(loginResponse.statusCode, 200);
        assert.match(setCookieHeader(loginResponse.headers), new RegExp(`${AUTH_COOKIE_NAME}=`));

        const currentUserResponse = await app.inject({
            method: "GET",
            url: "/auth/me",
            cookies: {
                [AUTH_COOKIE_NAME]: loginResponse.cookies[0]?.value ?? ""
            }
        });

        assert.equal(currentUserResponse.statusCode, 200);
        assert.equal(currentUserResponse.json().email, "henrique@example.com");
        assert.equal(currentUserResponse.json().hashedPassword, undefined);
    });

    it("rejects GET /auth/me without an auth cookie", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        const response = await app.inject({
            method: "GET",
            url: "/auth/me"
        });

        assert.equal(response.statusCode, 401);
    });
});
