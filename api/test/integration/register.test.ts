import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../support/build-test-app";
import { createPrismaMock } from "../support/prisma-mock";

let app: FastifyInstance | undefined;

afterEach(async () => {
    if (app) {
        await app.close();
        app = undefined;
    }
});

describe("POST /register", () => {
    it("creates a user using the root register route", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        const response = await app.inject({
            method: "POST",
            url: "/register",
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
        assert.notEqual(body.hashedPassword, "123456");
        assert.equal(prisma.users.length, 1);
    });

    it("rejects duplicate email registration", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        await app.inject({
            method: "POST",
            url: "/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique",
                password: "123456"
            }
        });

        const duplicateResponse = await app.inject({
            method: "POST",
            url: "/register",
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

    it("does not expose the route under /api/register in the current surface", async () => {
        const prisma = createPrismaMock();
        app = await buildTestApp({ prisma: prisma.client });

        const response = await app.inject({
            method: "POST",
            url: "/api/register",
            payload: {
                email: "henrique@example.com",
                name: "Henrique",
                password: "123456"
            }
        });

        assert.equal(response.statusCode, 404);
    });
});
