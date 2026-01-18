import { z } from "zod";
import { TransactionRecurrence, TransactionType } from "../../../generated/prisma/enums";

export const CreateTransactionSchema = z.object({
  title: z
    .string("title must be a string")
    .trim()
    .min(1, "title should be least than 1 character"),
  amount: z
    .number("amount must be a number")
    .min(1, "amount should be least than 1 character"),
  type: z.enum(TransactionType),
  category: z.string("category must be a string").trim(),
  date: z.string("date must be a string").trim(),
  recurrence: z.enum(TransactionRecurrence).optional(),

  totalInstallment: z.number("totalInstallment must be a number").optional(),
  installmentIndex: z.number("installmentIndex must be a number").optional(),
  installmentGroupId: z
    .string("installmentGroupId must be a string")
    .optional(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;