import { z } from "zod";

export const CreateGoalSchema = z.object({
  title: z.string("Title must be a string").trim().min(1, "Title is required"),
  amountCurrent: z
    .number("AmountCurrent must be a number"),
  amountGoal: z
    .number("AmountGoal must be a number")
    .min(1, "AmountGoal must be least than 1"),
  date: z.string("Date must be a string").trim().min(1, "Date is required"),
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;