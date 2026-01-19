import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { CreateGoalDto } from "./dtos/create-goal.dto";
import { UpdateGoalDto } from "./dtos/update-goal.dto";

class goalService {
  async create(userId: number, dto: CreateGoalDto) {
    return await prisma.goal.create({
      data: {
        title: dto.title,
        amountCurrent: dto.amountCurrent,
        amountGoal: dto.amountGoal,
        date: new Date(dto.date),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async getAll(userId: number) {
    return {
      items: await prisma.goal.findMany({
        where: {
          userId,
        },
      }),
    };
  }

  async getOne(id: number, userId: number) {
    const result = await prisma.goal.findFirst({
      where: {
        id,
      },
    });

    if (!result) {
      throw new AppError("Goal not found", 404);
    }

    if (result.userId !== userId) {
      throw new AppError("Goal not found", 404);
    }

    return result;
  }

  async update(id: number, userId: number, dto: UpdateGoalDto) {
    const result = await prisma.goal.findFirst({
      where: {
        id,
      },
    });

    if (!result) {
      throw new AppError("Goal not found", 404);
    }

    if (result.userId !== userId) {
      throw new AppError("Goal not found", 404);
    }

    return await prisma.goal.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        amountCurrent: dto.amountCurrent,
        amountGoal: dto.amountGoal,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async delete(id: number, userId: number) {
    const result = await prisma.goal.findFirst({
      where: {
        id,
      },
    });

    if (!result) {
      throw new AppError("Goal not found", 404);
    }

    if (result.userId !== userId) {
      throw new AppError("Goal not found", 404);
    }

    return await prisma.goal.delete({
      where: {
        id,
      },
    });
  }
}

export default new goalService();
