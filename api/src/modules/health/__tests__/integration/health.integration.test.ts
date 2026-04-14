import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildTestApp } from "../../../../__tests__/utils/build-test-app";

async function withApp(run: (app: Awaited<ReturnType<typeof buildTestApp>>) => Promise<void>) {
    const app = await buildTestApp();

    try {
        await run(app);
    } finally {
        await app.close();
    }
}

describe("GET /health", () => {
    it("returns the API health payload", async () => {
        await withApp(async (app) => {
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
});
