import { z } from "zod";
import { TransactionRecurrence, TransactionType } from "../../../generated/prisma/enums";

export const GetTransactionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional(),
  cursor: z.coerce.number().optional(),

  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().optional(),
  recurrence: z.nativeEnum(TransactionRecurrence).optional(),

  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),

  search: z.string().optional(),
});
