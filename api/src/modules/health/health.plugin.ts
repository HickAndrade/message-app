import fp from "fastify-plugin";

export default fp(async (app) => {
    app.get("/health", async () => ({
        status: "ok",
        service: "message-api",
        timestamp: new Date().toISOString()
    }));
}, {
    name: "health-plugin"
});
