import fp from "fastify-plugin";

import { realtimeRoutes } from "./realtime.routes";
import { PusherAuthService } from "./realtime.service";

export default fp(async (app) => {
    const pusherAuthService = new PusherAuthService(app.realtimeService);

    await app.register(realtimeRoutes(pusherAuthService));
}, {
    name: "realtime-module",
    dependencies: ["realtime-plugin", "request-auth-plugin"]
});
