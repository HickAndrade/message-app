import PusherServer from "pusher";
import PusherClient from "pusher-js";

//https://pusher.com/docs/channels/miscellaneous/clusters/
//https://pusher.com/docs/channels/channels_libraries/libraries/

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: 'sa1',
    useTLS: true
});

export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
    { 
      cluster: 'sa1',
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax'
      }
    }
)