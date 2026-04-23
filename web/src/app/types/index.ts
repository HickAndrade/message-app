export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified?: string | null;
    image: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface Message {
    id: string;
    body: string | null;
    clientMessageId?: string;
    image: string | null;
    createdAt: string;
    conversationId?: string;
    senderId?: string;
}

export interface Conversation {
    id: string;
    createAt?: string;
    lastMessageAt?: string;
    name: string | null;
    isGroup: boolean | null;
}

export type FullMessageType = Message & {
    sender: User;
    seen: User[];
};

export type FullConversationType = Conversation & {
    users: User[];
    messages: FullMessageType[];
};
