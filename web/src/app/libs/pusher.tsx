import PusherServer from "pusher";
import PusherClient from "pusher-js";

//https://pusher.com/docs/channels/miscellaneous/clusters/
//https://pusher.com/docs/channels/channels_libraries/libraries/

const PUSHER_CLUSTER = "sa1";
let pusherServerInstance: PusherServer | null = null;
let pusherClientInstance: PusherClient | null = null;

export function getPusherServer() {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const secret = process.env.PUSHER_SECRET;

    if (!appId || !key || !secret) {
        throw new Error(
            "Pusher server is not configured. Set PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_APP_KEY, and PUSHER_SECRET."
        );
    }

    if (!pusherServerInstance) {
        pusherServerInstance = new PusherServer({
            appId,
            key,
            secret,
            cluster: PUSHER_CLUSTER,
            useTLS: true
        });
    }

    return pusherServerInstance;
}

export function getPusherClient() {
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

    if (!key) {
        throw new Error(
            "Pusher client is not configured. Set NEXT_PUBLIC_PUSHER_APP_KEY."
        );
    }

    if (!pusherClientInstance) {
        pusherClientInstance = new PusherClient(key, {
            cluster: PUSHER_CLUSTER,
            channelAuthorization: {
                endpoint: "/api/pusher/auth",
                transport: "ajax"
            }
        });
    }

    return pusherClientInstance;
}
