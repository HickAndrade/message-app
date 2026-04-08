import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import fp from "fastify-plugin";

import { env } from "../config/env";

export default fp(async (app) => {
    await app.register(cors, {
        origin: env.CORS_ORIGIN.length > 0 ? env.CORS_ORIGIN : true,
        credentials: true
    });

    await app.register(formbody);
}, {
    name: "support-plugin"
});
