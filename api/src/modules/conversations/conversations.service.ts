import type { User } from "@prisma/client";

import { HttpError } from "../../shared/errors/http-error";
import type { RealtimeService } from "../../plugins/realtime.plugin";
import type { CreateConversationDTO } from "./conversations.schemas";
import { ConversationsRepository } from "./repositories/conversations.repository";

export class ConversationsService {
    constructor(
        private readonly repository: ConversationsRepository,
        private readonly realtimeService: RealtimeService
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

    async create(currentUser: User, data: CreateConversationDTO) {
        const isGroup = Boolean(data.isGroup);
        const userId = data.userId?.trim();
        const name = data.name?.trim();
        const members = Array.isArray(data.members) ? data.members : [];

        if (isGroup) {
            if (!name || members.length < 2) {
                throw new HttpError(400, "Invalid data");
            }

            const newConversation = await this.repository.createGroupConversation(name, currentUser.id, members);
            await this.realtimeService.triggerToUsers(newConversation.users, "conversation:new", newConversation);
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
        await this.realtimeService.triggerToUsers(newConversation.users, "conversation:new", newConversation);

        return newConversation;
    }

    async remove(currentUser: User, conversationId: string) {
        const conversation = await this.getById(currentUser.id, conversationId);
        const deletedConversation = await this.repository.deleteForUser(conversationId, currentUser.id);

        await this.realtimeService.triggerToUsers(conversation.users, "conversation:remove", conversation);

        return deletedConversation;
    }

    async markSeen(currentUser: User, conversationId: string) {
        const conversation = await this.repository.findByIdWithMessagesForUser(conversationId, currentUser.id);

        if (!conversation) {
            throw new HttpError(404, "Conversation not found");
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) {
            return conversation;
        }

        if (lastMessage.seenIds.includes(currentUser.id)) {
            await this.realtimeService.trigger(currentUser.email, "conversation:update", {
                id: conversationId,
                messages: [lastMessage]
            });

            return conversation;
        }

        const updatedMessage = await this.repository.markMessageSeen(lastMessage.id, currentUser.id);

        await this.realtimeService.trigger(currentUser.email, "conversation:update", {
            id: conversationId,
            messages: [updatedMessage]
        });

        await this.realtimeService.trigger(conversationId, "message:update", updatedMessage);

        return updatedMessage;
    }
}
