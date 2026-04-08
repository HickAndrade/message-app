import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { FastifyInstance } from "fastify";

import { buildTestApp } from "../support/build-test-app";

let app: FastifyInstance | undefined;

afterEach(async () => {
    if (app) {
        await app.close();
        app = undefined;
    }
});

describe("GET /health", () => {
    it("returns the API health payload", async () => {
        app = await buildTestApp();

        const response = await app.inject({
            method: "GET",
            url: "/health"
        });

        assert.equal(response.statusCode, 200);

        const body = response.json();

        assert.equal(body.status, "ok");
        assert.equal(body.service, "message-api");
        assert.ok(body.timestamp);
    });
});
