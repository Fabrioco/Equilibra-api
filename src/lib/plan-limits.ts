import { prisma } from "./prisma";
import { AppError } from "../middlewares/error";

/** Limites por plano: FREE, ESSENCIAL, PRO, ELITE/ULTIMATE */
export const PLAN_LIMITS: Record<
  string,
  { maxTransactionsPerMonth: number; maxGoals: number }
> = {
  FREE: {
    maxTransactionsPerMonth: 10,
    maxGoals: 2,
  },
  ESSENCIAL: {
    maxTransactionsPerMonth: 50,
    maxGoals: 5,
  },
  PRO: {
    maxTransactionsPerMonth: 200,
    maxGoals: 15,
  },
  ELITE: {
    maxTransactionsPerMonth: 99999,
    maxGoals: 99999,
  },
  ULTIMATE: {
    maxTransactionsPerMonth: 99999,
    maxGoals: 99999,
  },
};

export const PLAN_LIMIT_ERROR_CODE = "PLAN_LIMIT_EXCEEDED" as const;

export type PlanLimitType = "transactions" | "goals";

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
}

export async function checkTransactionLimit(
  userId: number,
  amountToAdd = 1,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) return;

  const limits = getPlanLimits(user.plan);
  if (limits.maxTransactionsPerMonth >= 99999) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const count = await prisma.transaction.count({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  if (count + amountToAdd > limits.maxTransactionsPerMonth) {
    throw new AppError(
      `Limite de transações do plano atingido (${limits.maxTransactionsPerMonth}/mês). Faça upgrade para continuar.`,
      403,
      PLAN_LIMIT_ERROR_CODE,
      "transactions",
    );
  }
}

export async function checkGoalLimit(userId: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) return;

  const limits = getPlanLimits(user.plan);
  if (limits.maxGoals >= 99999) return;

  const count = await prisma.goal.count({
    where: { userId },
  });

  if (count >= limits.maxGoals) {
    throw new AppError(
      `Limite de metas do plano atingido (${limits.maxGoals}). Faça upgrade para continuar.`,
      403,
      PLAN_LIMIT_ERROR_CODE,
      "goals",
    );
  }
}
