import { z } from "zod";

export const VerifyTokenSchema = z.object({
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(6, "Token must be at most 6 characters"),
});

export type VerifyTokenDto = z.infer<typeof VerifyTokenSchema>;
