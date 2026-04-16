import { HttpError } from "../../shared/errors/http-error";
import type { ChatEventPublisher } from "../outbox/chat/chat-event-publisher";
import type { CreateConversationDTO } from "./conversations.schemas";
import type { ConversationsRepository } from "./repositories/conversations.repository";
import type { StoredUser } from "../users/users.service";

export class ConversationsService {
    constructor(
        private readonly repository: ConversationsRepository,
        private readonly eventPublisher: ChatEventPublisher
    ) {}

    async listForUser(userId: string) {
        return this.repository.listForUser(userId);
    }

    async getById(userId: string, conversationId: string) {
        const conversation = await this.repository.findByIdForUser(conversationId, userId);

        if (!conversation) {
            throw new HttpError(404, "Conversation not found");
        }

        return conversation;
    }

    async listMessages(userId: string, conversationId: string) {
        await this.getById(userId, conversationId);
        return this.repository.listMessages(conversationId);
    }

    async create(currentUser: StoredUser, data: CreateConversationDTO) {
        const isGroup = Boolean(data.isGroup);
        const userId = data.userId?.trim();
        const name = data.name?.trim();
        const members = Array.isArray(data.members) ? data.members : [];

        if (isGroup) {
            if (!name || members.length < 2) {
                throw new HttpError(400, "Invalid data");
            }

            const newConversation = await this.repository.createGroupConversation(name, currentUser.id, members);
            await this.eventPublisher.publishConversationCreated(newConversation);
            return newConversation;
        }

        if (!userId) {
            throw new HttpError(400, "Invalid data");
        }

        const existingConversation = await this.repository.findDirectConversation(currentUser.id, userId);
        if (existingConversation) {
            return existingConversation;
        }

        const newConversation = await this.repository.createDirectConversation(currentUser.id, userId);
        await this.eventPublisher.publishConversationCreated(newConversation);

        return newConversation;
    }

    async remove(currentUser: StoredUser, conversationId: string) {
        const conversation = await this.getById(currentUser.id, conversationId);
        const deletedConversation = await this.repository.deleteForUser(conversationId, currentUser.id);

        await this.eventPublisher.publishConversationRemoved(conversation);

        return deletedConversation;
    }

    async markSeen(currentUser: StoredUser, conversationId: string) {
        const conversation = await this.repository.findByIdWithMessagesForUser(conversationId, currentUser.id);

        if (!conversation) {
            throw new HttpError(404, "Conversation not found");
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) {
            return conversation;
        }

        const buildConversationUpdatePayload = (message: unknown) => ({
            id: conversationId,
            messages: [message]
        });

        if (lastMessage.seenIds.includes(currentUser.id)) {
            await this.eventPublisher.publishConversationUpdated(
                [currentUser],
                buildConversationUpdatePayload(lastMessage)
            );

            return conversation;
        }

        const updatedMessage = await this.repository.markMessageSeen(lastMessage.id, currentUser.id);

        await this.eventPublisher.publishConversationUpdated(
            [currentUser],
            buildConversationUpdatePayload(updatedMessage)
        );

        await this.eventPublisher.publishMessageUpdated(conversationId, updatedMessage);

        return updatedMessage;
    }
}
