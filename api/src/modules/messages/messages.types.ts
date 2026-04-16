import type { ChatEventPublisher } from "../outbox/chat/chat-event-publisher";
import type { ConversationsRepository } from "../conversations/repositories/conversations.repository";

export interface MessagesConversationLookup {
    findByIdForUser: ConversationsRepository["findByIdForUser"];
}

export interface MessagesEventPublisher {
    publishConversationUpdated: ChatEventPublisher["publishConversationUpdated"];
    publishMessageCreated: ChatEventPublisher["publishMessageCreated"];
}
