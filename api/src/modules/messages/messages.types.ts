import type { ChatEventPublisher } from "../../plugins/chat-event-publisher.plugin";
import type { ConversationsRepository } from "../conversations/repositories/conversations.repository";

export interface MessagesConversationLookup {
    findByIdForUser: ConversationsRepository["findByIdForUser"];
}

export interface MessagesEventPublisher {
    publishConversationUpdated: ChatEventPublisher["publishConversationUpdated"];
    publishMessageCreated: ChatEventPublisher["publishMessageCreated"];
}
