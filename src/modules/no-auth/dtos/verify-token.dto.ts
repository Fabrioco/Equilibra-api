import { z } from "zod";

export const VerifyTokenSchema = z.object({
  email: z.email("Email must be a valid email").trim(),
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(6, "Token must be at most 6 characters"),
});

export type VerifyTokenDto = z.infer<typeof VerifyTokenSchema>;
