import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { CreateGoalDto } from "./dtos/create-goal.dto";
import { UpdateGoalDto } from "./dtos/update-goal.dto";

class GoalService {
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
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    return goal;
  }

  async update(id: number, userId: number, dto: UpdateGoalDto) {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    const updateData: {
      title?: string;
      amountCurrent?: number;
      amountGoal?: number;
      date?: Date;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.amountCurrent !== undefined) updateData.amountCurrent = dto.amountCurrent;
    if (dto.amountGoal !== undefined) updateData.amountGoal = dto.amountGoal;
    if (dto.date) updateData.date = new Date(dto.date);

    return await prisma.goal.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  async delete(id: number, userId: number) {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    await prisma.goal.delete({
      where: {
        id,
      },
    });
  }
}

export default new GoalService();
