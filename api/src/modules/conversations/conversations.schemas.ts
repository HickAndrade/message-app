import { z } from "zod";

export const conversationMemberSchema = z.object({
    value: z.string().trim().min(1)
});

export const createConversationSchema = z.object({
    isGroup: z.boolean().optional(),
    members: z.array(conversationMemberSchema).optional(),
    name: z.string().trim().optional(),
    userId: z.string().trim().optional()
});

export const conversationParamsSchema = z.object({
    conversationId: z.string().trim().min(1)
});

export type CreateConversationDTO = z.infer<typeof createConversationSchema>;
export type ConversationParams = z.infer<typeof conversationParamsSchema>;
