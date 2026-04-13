import fp from "fastify-plugin";

import type { RealtimeTransport } from "./realtime.plugin";

type EventRecipient = {
    email: string | null;
};

type ConversationUpdatePayload = {
    id: string;
    messages: unknown[];
};

type ConversationBroadcastPayload = {
    users: EventRecipient[];
} & Record<string, unknown>;

export interface ChatEventPublisher {
    publishConversationCreated(conversation: ConversationBroadcastPayload): Promise<void>;
    publishConversationRemoved(conversation: ConversationBroadcastPayload): Promise<void>;
    publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload): Promise<void>;
    publishMessageCreated(conversationId: string, message: unknown): Promise<void>;
    publishMessageUpdated(conversationId: string, message: unknown): Promise<void>;
}

export class PusherChatEventPublisher implements ChatEventPublisher {
    constructor(private readonly realtimeTransport: RealtimeTransport) {}

    async publishConversationCreated(conversation: ConversationBroadcastPayload) {
        await this.realtimeTransport.triggerToUsers(conversation.users, "conversation:new", conversation);
    }

    async publishConversationRemoved(conversation: ConversationBroadcastPayload) {
        await this.realtimeTransport.triggerToUsers(conversation.users, "conversation:remove", conversation);
    }

    async publishConversationUpdated(users: EventRecipient[], payload: ConversationUpdatePayload) {
        await this.realtimeTransport.triggerToUsers(users, "conversation:update", payload);
    }

    async publishMessageCreated(conversationId: string, message: unknown) {
        await this.realtimeTransport.trigger(conversationId, "messages:new", message);
    }

    async publishMessageUpdated(conversationId: string, message: unknown) {
        await this.realtimeTransport.trigger(conversationId, "message:update", message);
    }
}

type ChatEventPublisherPluginOptions = {
    publisher?: ChatEventPublisher;
};

export default fp<ChatEventPublisherPluginOptions>(async (app, options) => {
    app.decorate(
        "chatEventPublisher",
        options.publisher ?? new PusherChatEventPublisher(app.realtimeService)
    );
}, {
    name: "chat-event-publisher-plugin",
    dependencies: ["realtime-plugin"]
});

declare module "fastify" {
    interface FastifyInstance {
        chatEventPublisher: ChatEventPublisher;
    }
}
