import type PusherServer from "pusher";
import fp from "fastify-plugin";
import Pusher from "pusher";

import { env } from "../config/env";

export type RealtimeUser = {
    email: string | null;
};

export interface RealtimeTransport {
    trigger(channel: string, eventName: string, payload: unknown): Promise<unknown>;
    triggerToUsers(users: RealtimeUser[], eventName: string, payload: unknown): Promise<void>;
}

export interface RealtimeAuthorizer {
    authorizeChannel(
        socketId: string,
        channel: string,
        data: { user_id: string } & Record<string, unknown>
    ): unknown;
}

export class RealtimeService implements RealtimeTransport, RealtimeAuthorizer {
    private server: PusherServer | null = null;

    private getServer() {
        if (!env.PUSHER_APP_ID || !env.PUSHER_APP_KEY || !env.PUSHER_SECRET) {
            throw new Error(
                "Pusher server is not configured. Set PUSHER_APP_ID, PUSHER_APP_KEY, and PUSHER_SECRET."
            );
        }

        if (!this.server) {
            this.server = new Pusher({
                appId: env.PUSHER_APP_ID,
                key: env.PUSHER_APP_KEY,
                secret: env.PUSHER_SECRET,
                cluster: env.PUSHER_CLUSTER,
                useTLS: true
            });
        }

        return this.server;
    }

    async trigger(channel: string, eventName: string, payload: unknown) {
        return this.getServer().trigger(channel, eventName, payload);
    }

    async triggerToUsers(users: RealtimeUser[], eventName: string, payload: unknown) {
        await Promise.all(
            users
                .filter((user) => Boolean(user.email))
                .map((user) => this.trigger(user.email!, eventName, payload))
        );
    }

    authorizeChannel(
        socketId: string,
        channel: string,
        data: { user_id: string } & Record<string, unknown>
    ) {
        return this.getServer().authorizeChannel(socketId, channel, data);
    }
}

type RealtimePluginOptions = {
    service?: RealtimeService;
};

export default fp<RealtimePluginOptions>(async (app, options) => {
    app.decorate("realtimeService", options.service ?? new RealtimeService());
}, {
    name: "realtime-plugin"
});

declare module "fastify" {
    interface FastifyInstance {
        realtimeService: RealtimeService;
    }
}
