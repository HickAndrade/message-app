import { HttpError } from "../../shared/errors/http-error";
import type { ChatEventPublisher } from "../../plugins/chat-event-publisher.plugin";
import type { ConversationsRepository } from "../conversations/repositories/conversations.repository";
import type { SendMessageDTO } from "./messages.schemas";
import type { MessagesRepository } from "./repositories/messages.repository";
import type { StoredUser } from "../users/users.service";

export class MessagesService {
    constructor(
        private readonly messagesRepository: MessagesRepository,
        private readonly conversationsRepository: ConversationsRepository,
        private readonly eventPublisher: ChatEventPublisher
    ) {}

    async create(currentUser: StoredUser, data: SendMessageDTO) {
        const conversation = await this.conversationsRepository.findByIdForUser(
            data.conversationId,
            currentUser.id
        );

        if (!conversation) {
            throw new HttpError(404, "Conversation not found");
        }

        const newMessage = await this.messagesRepository.create({
            body: data.message?.trim() || undefined,
            conversationId: data.conversationId,
            image: data.image?.trim() || undefined,
            senderId: currentUser.id
        });

        const updatedConversation = await this.conversationsRepository.attachMessage(
            data.conversationId,
            newMessage.id
        );

        await this.eventPublisher.publishMessageCreated(data.conversationId, newMessage);

        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        if (lastMessage) {
            await this.eventPublisher.publishConversationUpdated(
                updatedConversation.users,
                {
                    id: data.conversationId,
                    messages: [lastMessage]
                }
            );
        }

        return newMessage;
    }
}
