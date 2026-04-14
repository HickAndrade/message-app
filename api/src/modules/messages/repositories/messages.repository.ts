import { Prisma, type PrismaClient } from "@prisma/client";

import type {
    AttachedConversationState,
    CreateMessageInput,
    CreatedMessageRecord,
    MessagesRepository
} from "./types";

export class PrismaMessagesRepository implements MessagesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private async attachMessage(
        tx: Prisma.TransactionClient,
        conversationId: string,
        messageId: string
    ): Promise<AttachedConversationState> {
        const conversation = await tx.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                lastMessageAt: new Date(),
                messages: {
                    connect: {
                        id: messageId
                    }
                }
            },
            include: {
                users: true,
                messages: {
                    include: {
                        seen: true
                    }
                }
            }
        });

        return {
            messages: conversation.messages,
            users: conversation.users
        };
    }

    private async createMessage(
        tx: Prisma.TransactionClient,
        data: CreateMessageInput
    ): Promise<CreatedMessageRecord> {
        return tx.message.create({
            data: {
                body: data.body,
                clientMessageId: data.clientMessageId,
                image: data.image,
                conversation: {
                    connect: {
                        id: data.conversationId
                    }
                },
                sender: {
                    connect: {
                        id: data.senderId
                    }
                },
                seen: {
                    connect: {
                        id: data.senderId
                    }
                }
            },
            include: {
                seen: true,
                sender: true
            }
        });
    }

    private async findExistingMessage(
        senderId: string,
        conversationId: string,
        clientMessageId: string
    ): Promise<CreatedMessageRecord | null> {
        return this.prisma.message.findFirst({
            where: {
                clientMessageId,
                conversationId,
                senderId
            },
            include: {
                seen: true,
                sender: true
            }
        });
    }

    async create(data: CreateMessageInput) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const message = await this.createMessage(tx, data);
                const conversation = await this.attachMessage(tx, data.conversationId, message.id);

                return {
                    conversation,
                    created: true,
                    message
                };
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                const existingMessage = await this.findExistingMessage(
                    data.senderId,
                    data.conversationId,
                    data.clientMessageId
                );

                if (existingMessage) {
                    return {
                        created: false,
                        message: existingMessage
                    };
                }
            }

            throw error;
        }
    }
}
