import type { RealtimeAuthorizer } from "../../plugins/realtime.plugin";
import type { PusherAuthDTO } from "./realtime.schemas";

export class PusherAuthService {
    constructor(private readonly realtimeService: RealtimeAuthorizer) {}

    authorize(currentUserEmail: string, data: PusherAuthDTO) {
        return this.realtimeService.authorizeChannel(data.socket_id, data.channel_name, {
            user_id: currentUserEmail
        });
    }
}
