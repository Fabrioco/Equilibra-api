import { z } from "zod";

export const UpdateGoalSchema = z.object({
  title: z
    .string("Title must be a string")
    .trim()
    .min(1, "Title is required")
    .optional(),
  amountCurrent: z.number("AmountCurrent must be a number").optional(),
  amountGoal: z
    .number("AmountGoal must be a number")
    .min(1, "AmountGoal must be least than 1")
    .optional(),
  date: z
    .string("Date must be a string")
    .trim()
    .min(1, "Date is required")
    .optional(),
});

export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;