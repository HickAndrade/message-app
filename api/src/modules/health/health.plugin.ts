import fp from "fastify-plugin";
import { HttpError } from "../../shared/errors/http-error";

export default fp(async (app) => {
    app.get("/health", async (_request, reply) => {
        try {
            await app.prisma.$runCommandRaw({
                ping: 1
            });
        } catch (_error) {
            throw new HttpError(503, "Database unavailable");
        }

        reply.send({
            status: "ok",
            service: "message-api",
            timestamp: new Date().toISOString()
        });
    });
}, {
    name: "health-plugin"
});
