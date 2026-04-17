import type { Prisma } from "@prisma/client";

export interface CreateMessageInput {
    body?: string;
    clientMessageId: string;
    conversationId: string;
    image?: string;
    senderId: string;
}

export type CreatedMessageRecord = Prisma.MessageGetPayload<{
    include: {
        seen: true;
        sender: true;
    };
}>;

export type ConversationMessageRecord = Prisma.MessageGetPayload<{
    include: {
        seen: true;
    };
}>;

export type AttachedConversationState = {
    messages: ConversationMessageRecord[];
    users: Array<{
        email: string | null;
    }>;
};

export interface CreateMessageResult {
    conversation?: AttachedConversationState;
    created: boolean;
    message: CreatedMessageRecord;
}

export interface MessagesRepository {
    create(data: CreateMessageInput): Promise<CreateMessageResult>;
}
