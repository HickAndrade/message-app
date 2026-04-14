import { HttpError } from "../../shared/errors/http-error";
import type { SendMessageDTO } from "./messages.schemas";
import type {
    MessagesConversationLookup,
    MessagesEventPublisher
} from "./messages.types";
import type { MessagesRepository } from "./repositories/types";
import type { StoredUser } from "../users/users.service";

export class MessagesService {
    constructor(
        private readonly messagesRepository: MessagesRepository,
        private readonly conversationsRepository: MessagesConversationLookup,
        private readonly eventPublisher: MessagesEventPublisher
    ) {}

    async create(currentUser: StoredUser, data: SendMessageDTO) {
        const conversation = await this.conversationsRepository.findByIdForUser(
            data.conversationId,
            currentUser.id
        );

        if (!conversation) {
            throw new HttpError(404, "Conversation not found");
        }

        const result = await this.messagesRepository.create({
            body: data.message?.trim() || undefined,
            clientMessageId: data.clientMessageId,
            conversationId: data.conversationId,
            image: data.image?.trim() || undefined,
            senderId: currentUser.id
        });

        if (!result.created || !result.conversation) {
            return result.message;
        }

        await this.eventPublisher.publishMessageCreated(data.conversationId, result.message);

        const lastMessage = result.conversation.messages[result.conversation.messages.length - 1];

        if (lastMessage) {
            await this.eventPublisher.publishConversationUpdated(
                result.conversation.users,
                {
                    id: data.conversationId,
                    messages: [lastMessage]
                }
            );
        }

        return result.message;
    }
}
