import { prisma } from "../../lib/prisma";
import { CreateGoalDto } from "./dtos/create-goal.dto";

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
}

export default new goalService();
