import { Request, Response } from "express";
import { CreateGoalSchema } from "./dtos/create-goal.dto";
import service from "./goal.service";
import { UpdateGoalSchema } from "./dtos/update-goal.dto";

class goalController {
  async create(req: Request, res: Response) {
    const dto = CreateGoalSchema.parse(req.body);
    const result = await service.create(req.user.id, dto);
    return res.status(201).json(result);
  }

  async getAll(req: Request, res: Response) {
    const result = await service.getAll(req.user.id);
    return res.status(200).json(result);
  }

  async getOne(req: Request, res: Response) {
    const result = await service.getOne(+req.params.id, req.user.id);
    return res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const dto = UpdateGoalSchema.parse(req.body);
    const result = await service.update(+req.params.id, req.user.id, dto);
    return res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const result = await service.delete(+req.params.id, req.user.id);
    return res.status(200).json(result);
  }
}
export default new goalController();
