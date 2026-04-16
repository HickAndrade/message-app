import type { RealtimeTransport } from "../../../plugins/realtime.plugin";
import { CHAT_REALTIME_EVENTS } from "./chat-events";
import type { ChatEventPublisher } from "./chat-event-publisher";
import type {
    ConversationBroadcastPayload,
    ConversationUpdatePayload,
    EventRecipient
} from "./chat-events";

export class PusherChatEventDelivery implements ChatEventPublisher {
    constructor(private readonly realtimeTransport: RealtimeTransport) {}

    async publishConversationCreated(conversation: ConversationBroadcastPayload) {
        await this.realtimeTransport.triggerToUsers(
            conversation.users,
            CHAT_REALTIME_EVENTS.conversationNew,
            conversation
        );
    }

    async publishConversationRemoved(conversation: ConversationBroadcastPayload) {
        await this.realtimeTransport.triggerToUsers(
            conversation.users,
            CHAT_REALTIME_EVENTS.conversationRemove,
            conversation
        );
    }

    async publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload) {
        await this.realtimeTransport.triggerToUsers(
            users,
            CHAT_REALTIME_EVENTS.conversationUpdate,
            payload
        );
    }

    async publishMessageCreated(conversationId: string, message: unknown) {
        await this.realtimeTransport.trigger(
            conversationId,
            CHAT_REALTIME_EVENTS.messageNew,
            message
        );
    }

    async publishMessageUpdated(conversationId: string, message: unknown) {
        await this.realtimeTransport.trigger(
            conversationId,
            CHAT_REALTIME_EVENTS.messageUpdate,
            message
        );
    }
}
