export const CHAT_OUTBOX_TOPICS = {
    conversationCreated: "conversation.created",
    conversationRemoved: "conversation.removed",
    conversationUpdated: "conversation.updated",
    messageCreated: "message.created",
    messageUpdated: "message.updated"
} as const;

export const CHAT_REALTIME_EVENTS = {
    conversationNew: "conversation:new",
    conversationRemove: "conversation:remove",
    conversationUpdate: "conversation:update",
    messageNew: "messages:new",
    messageUpdate: "message:update"
} as const;

export type EventRecipient = {
    email: string | null;
};

export type ConversationUpdatePayload = {
    id: string;
    messages: unknown[];
};

export type ConversationBroadcastPayload = {
    users: EventRecipient[];
} & Record<string, unknown>;
