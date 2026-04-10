import type { PrismaClient } from "@prisma/client";

export interface CreateMessageInput {
    body?: string;
    conversationId: string;
    image?: string;
    senderId: string;
}

export interface MessagesRepository {
    create(data: CreateMessageInput): Promise<CreatedMessageRecord>;
}

export class PrismaMessagesRepository implements MessagesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateMessageInput) {
        return this.prisma.message.create({
            data: {
                body: data.body,
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
}

export type CreatedMessageRecord = Awaited<ReturnType<PrismaMessagesRepository["create"]>>;
