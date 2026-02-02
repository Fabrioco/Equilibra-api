import { checkTransactionLimit } from "../../lib/plan-limits";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import {
  Transaction,
  TransactionRecurrence,
  TransactionType,
} from "../../generated/prisma/client";
import { UpdateTransactionDto } from "./dtos/update-transaction.dto";

export class GetTransactionsQueryDto {
  limit?: number;
  cursor?: number;

  startDate?: Date;
  endDate?: Date;

  type?: TransactionType;
  category?: string;
  recurrence?: TransactionRecurrence;

  minAmount?: number;
  maxAmount?: number;

  search?: string;
}

class TransactionService {
  async createTransaction(userId: number, dto: CreateTransactionDto) {
    const amountToAdd =
      dto.recurrence === TransactionRecurrence.INSTALLMENT
        ? Math.max(1, dto.totalInstallment ?? 1)
        : 1;
    await checkTransactionLimit(userId, amountToAdd);

    switch (dto.recurrence) {
      case TransactionRecurrence.ONE_TIME:
        return this.createOneTime(userId, dto);

      case TransactionRecurrence.FIXED:
        return this.createFixed(userId, dto);

      case TransactionRecurrence.INSTALLMENT:
        return this.createInstallment(userId, dto);

      default:
        throw new AppError("Invalid recurrence type", 400);
    }
  }
  async getTransactions(userId: number, query: GetTransactionsQueryDto) {
    const {
      limit = 20,
      cursor,
      startDate,
      endDate,
      type,
      category,
      recurrence,
      minAmount,
      maxAmount,
      search,
    } = query;

    return prisma.transaction.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,

      where: {
        userId,

        ...(type && { type }),
        ...(category && { category }),
        ...(recurrence && { recurrence }),

        ...(startDate || endDate
          ? {
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),

        ...(minAmount || maxAmount
          ? {
              amount: {
                ...(minAmount && { gte: minAmount }),
                ...(maxAmount && { lte: maxAmount }),
              },
            }
          : {}),

        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      orderBy: {
        date: "desc",
      },
    });
  }

  async getOne(id: number, userId: number) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    return transaction;
  }

  async updateTransaction(
    id: number,
    userId: number,
    dto: UpdateTransactionDto,
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new AppError("Transaction not found", 404);
    }

    if (dto.recurrence && dto.recurrence !== transaction.recurrence) {
      throw new AppError(
        "Recurrence cannot be changed. Delete and recreate the transaction.",
        400,
      );
    }

    if (transaction.recurrence === "INSTALLMENT") {
      if (dto.installmentIndex || dto.totalInstallment) {
        throw new AppError("Installment structure cannot be modified", 400);
      }
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        date: dto.date,
      },
    });
  }

  async deleteTransaction(
    id: number,
    userId: number,
    scope: "ONE" | "ALL" = "ONE",
  ) {
    const transaction = await this.getTransactionOrFail(id, userId);

    if (transaction.recurrence === "ONE_TIME") {
      return this.deleteOneTime(id);
    }

    if (transaction.recurrence === "FIXED") {
      return this.deleteFixed(id);
    }

    if (transaction.recurrence === "INSTALLMENT") {
      if (scope === "ALL") {
        return this.deleteAllInstallments(transaction);
      }

      return this.deleteOneInstallment(transaction);
    }

    throw new AppError("Invalid delete operation", 400);
  }

  private async createOneTime(userId: number, dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.ONE_TIME,
        date: dto.date,
        userId,
      },
    });
  }

  private async getTransactionOrFail(id: number, userId: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new AppError("Transaction not found", 404);
    }

    return transaction;
  }

  private async deleteOneTime(id: number) {
    return prisma.transaction.delete({
      where: { id },
    });
  }

  private async deleteFixed(id: number) {
    return prisma.transaction.delete({
      where: { id },
    });
  }

  private async deleteOneInstallment(transaction: Transaction) {
    return prisma.transaction.delete({
      where: { id: transaction.id },
    });
  }

  private async deleteAllInstallments(transaction: Transaction) {
    return prisma.transaction.deleteMany({
      where: {
        userId: transaction.userId,
        recurrence: "INSTALLMENT",
        title: transaction.title,
        totalInstallment: transaction.totalInstallment,
      },
    });
  }

  private async createFixed(userId: number, dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.FIXED,
        date: dto.date,
        userId,
      },
    });
  }

  private async createInstallment(userId: number, dto: CreateTransactionDto) {
    if (!dto.totalInstallment || dto.totalInstallment < 2) {
      throw new AppError(
        "totalInstallment must be greater than 1 for INSTALLMENT",
        400,
      );
    }

    const baseDate = new Date(dto.date);

    // 1. Calculamos o valor base da parcela (arredondado para baixo)
    const installmentAmount = Math.floor(dto.amount / dto.totalInstallment);

    // 2. Calculamos quanto sobra (o resto da divisão)
    const remainder = dto.amount % dto.totalInstallment;

    const transactions = [];

    for (let i = 1; i <= dto.totalInstallment; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(baseDate.getMonth() + (i - 1));

      // 3. Se for a ÚLTIMA parcela, somamos o resto (remainder)
      // Assim o valor total sempre baterá com o dto.amount original
      const finalAmount =
        i === dto.totalInstallment
          ? installmentAmount + remainder
          : installmentAmount;

      transactions.push({
        title: dto.title,
        amount: finalAmount, // ✅ Valor dividido corretamente
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.INSTALLMENT,
        totalInstallment: dto.totalInstallment,
        installmentIndex: i,
        date: installmentDate,
        userId,
      });
    }

    return prisma.transaction.createMany({
      data: transactions,
    });
  }
  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10); // yyyy-mm-dd
  }
}

export default new TransactionService();
