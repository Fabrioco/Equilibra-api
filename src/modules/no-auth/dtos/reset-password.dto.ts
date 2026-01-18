import { z } from "zod";

export const ResetPasswordSchema = z.object({
  id: z.number(),
  email: z.email("email must be a valid email").trim(),
  newPassword: z
    .string("newPassword must be a string")
    .trim()
    .min(8, "newPassword should be least than 8 character"),
  confirmNewPassword: z
    .string("confirmNewPassword must be a string")
    .trim()
    .min(8, "confirmNewPassword should be least than 8 character"),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
