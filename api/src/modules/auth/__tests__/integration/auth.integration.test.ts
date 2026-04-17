import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OutgoingHttpHeaders } from "node:http";

import { buildTestApp } from "../../../../__tests__/utils/build-test-app";
import { createPrismaMock } from "../../../../__tests__/utils/prisma-mock";
import { TEST_AUTH_COOKIE_NAME } from "../../../../__tests__/utils/test-env";

const setCookieHeader = (headers: OutgoingHttpHeaders) => {
    return Array.isArray(headers["set-cookie"])
        ? headers["set-cookie"][0] ?? ""
        : headers["set-cookie"] ?? "";
};

async function withApp(
    run: (input: ReturnType<typeof createPrismaMock> & {
        app: Awaited<ReturnType<typeof buildTestApp>>;
    }) => Promise<void>
) {
    const prisma = createPrismaMock();
    const app = await buildTestApp({ prisma: prisma.client });

    try {
        await run({ ...prisma, app });
    } finally {
        await app.close();
    }
}

describe("Auth routes", () => {
    it("creates a user using POST /auth/register and issues an auth cookie", async () => {
        await withApp(async ({ app, users }) => {
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
            assert.equal(users.length, 1);
            assert.match(setCookieHeader(response.headers), new RegExp(`${TEST_AUTH_COOKIE_NAME}=`));
        });
    });

    it("rejects duplicate email registration", async () => {
        await withApp(async ({ app }) => {
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
    });

    it("logs in with POST /auth/login and resolves the user with GET /auth/me", async () => {
        await withApp(async ({ app }) => {
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
            assert.match(setCookieHeader(loginResponse.headers), new RegExp(`${TEST_AUTH_COOKIE_NAME}=`));

            const currentUserResponse = await app.inject({
                method: "GET",
                url: "/auth/me",
                cookies: {
                    [TEST_AUTH_COOKIE_NAME]: loginResponse.cookies[0]?.value ?? ""
                }
            });

            assert.equal(currentUserResponse.statusCode, 200);
            assert.equal(currentUserResponse.json().email, "henrique@example.com");
            assert.equal(currentUserResponse.json().hashedPassword, undefined);
        });
    });

    it("rejects GET /auth/me without an auth cookie", async () => {
        await withApp(async ({ app }) => {
            const response = await app.inject({
                method: "GET",
                url: "/auth/me"
            });

            assert.equal(response.statusCode, 401);
        });
    });

    it("rate limits repeated registration attempts from the same client", async () => {
        await withApp(async ({ app }) => {
            for (let index = 0; index < 5; index += 1) {
                const response = await app.inject({
                    method: "POST",
                    url: "/auth/register",
                    payload: {
                        email: `henrique-${index}@example.com`,
                        name: "Henrique",
                        password: "123456"
                    }
                });

                assert.equal(response.statusCode, 201);
            }

            const limitedResponse = await app.inject({
                method: "POST",
                url: "/auth/register",
                payload: {
                    email: "henrique-limit@example.com",
                    name: "Henrique",
                    password: "123456"
                }
            });

            assert.equal(limitedResponse.statusCode, 429);
            assert.deepEqual(limitedResponse.json(), {
                message: "Too many requests"
            });
        });
    });
});
