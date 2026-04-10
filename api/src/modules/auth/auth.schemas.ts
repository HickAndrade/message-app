import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().trim().email(),
    name: z.string().trim().min(1),
    password: z.string().min(1)
});

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
