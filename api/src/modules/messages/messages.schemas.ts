import { z } from "zod";

export const sendMessageSchema = z.object({
    conversationId: z.string().trim().min(1),
    image: z.string().trim().optional(),
    message: z.string().trim().optional()
}).refine((data) => Boolean(data.message || data.image), {
    message: "Message or image is required"
});

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
