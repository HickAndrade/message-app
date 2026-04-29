import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import helmet from "@fastify/helmet";
import fp from "fastify-plugin";

import { env } from "../config/env";

export default fp(async (app) => {
    const corsOrigin =
        env.CORS_ORIGIN.length > 0
            ? env.CORS_ORIGIN
            : env.NODE_ENV === "production"
              ? false
              : true;

    await app.register(cors, {
        methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        origin: corsOrigin,
        credentials: true
    });

    await app.register(helmet, {
        contentSecurityPolicy: false
    });
    await app.register(formbody);
}, {
    name: "support-plugin"
});
