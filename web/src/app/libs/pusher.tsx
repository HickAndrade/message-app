import PusherClient from "pusher-js";

//https://pusher.com/docs/channels/miscellaneous/clusters/
//https://pusher.com/docs/channels/channels_libraries/libraries/

const PUSHER_CLUSTER = "sa1";
let pusherClientInstance: PusherClient | null = null;

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
