import { z } from "zod";

export const updateSettingsSchema = z.object({
    image: z.string().trim().optional(),
    name: z.string().trim().optional()
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;
