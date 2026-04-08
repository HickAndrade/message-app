import type { PrismaClient } from "@prisma/client";

type ConversationMember = {
    value: string;
};

export class ConversationsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listForUser(userId: string) {
        return this.prisma.conversation.findMany({
            orderBy: {
                lastMessageAt: "desc"
            },
            where: {
                userIds: {
                    has: userId
                }
            },
            include: {
                users: true,
                messages: {
                    include: {
                        seen: true,
                        sender: true
                    }
                }
            }
        });
    }

    async findByIdForUser(conversationId: string, userId: string) {
        return this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    has: userId
                }
            },
            include: {
                users: true
            }
        });
    }

    async findByIdWithMessagesForUser(conversationId: string, userId: string) {
        return this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    has: userId
                }
            },
            include: {
                messages: {
                    include: {
                        seen: true
                    }
                },
                users: true
            }
        });
    }

    async listMessages(conversationId: string) {
        return this.prisma.message.findMany({
            where: {
                conversationId
            },
            include: {
                seen: true,
                sender: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
    }

    async findDirectConversation(currentUserId: string, otherUserId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        userIds: {
                            equals: [currentUserId, otherUserId]
                        }
                    },
                    {
                        userIds: {
                            equals: [otherUserId, currentUserId]
                        }
                    }
                ]
            }
        });

        return conversations[0] ?? null;
    }

    async createGroupConversation(name: string, currentUserId: string, members: ConversationMember[]) {
        return this.prisma.conversation.create({
            data: {
                name,
                isGroup: true,
                users: {
                    connect: [
                        ...members.map((member) => ({
                            id: member.value
                        })),
                        {
                            id: currentUserId
                        }
                    ]
                }
            },
            include: {
                users: true
            }
        });
    }

    async createDirectConversation(currentUserId: string, otherUserId: string) {
        return this.prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        {
                            id: currentUserId
                        },
                        {
                            id: otherUserId
                        }
                    ]
                }
            },
            include: {
                users: true
            }
        });
    }

    async deleteForUser(conversationId: string, userId: string) {
        return this.prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [userId]
                }
            }
        });
    }

    async markMessageSeen(messageId: string, userId: string) {
        return this.prisma.message.update({
            where: {
                id: messageId
            },
            include: {
                sender: true,
                seen: true
            },
            data: {
                seen: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
    }

    async attachMessage(conversationId: string, messageId: string) {
        return this.prisma.conversation.update({
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
    }
}
