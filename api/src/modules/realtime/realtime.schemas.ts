import { z } from "zod";

export const pusherAuthSchema = z.object({
    channel_name: z.string().trim().min(1),
    socket_id: z.string().trim().min(1)
});

export type PusherAuthDTO = z.infer<typeof pusherAuthSchema>;
