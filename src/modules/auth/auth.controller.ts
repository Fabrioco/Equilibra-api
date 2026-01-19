import { Request, Response } from "express";
import service from "./auth.service";
import { RegisterRequestSchema } from "./dtos/register-request.dto";
import { LoginRequestSchema } from "./dtos/login-request.dto";
import { UpdateMeSchema } from "./dtos/update-me.dto";

class AuthController {
  async register(req: Request, res: Response) {
    const dto = RegisterRequestSchema.parse(req.body);
    const result = await service.register(dto);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const dto = LoginRequestSchema.parse(req.body);
    const result = await service.login(dto);
    return res.status(200).json(result);
  }

  async me(req: Request, res: Response) {
    const result = await service.me(req.user.id);
    return res.status(200).json(result);
  }

  async updateMe(req: Request, res: Response) {
    const dto = UpdateMeSchema.parse(req.body);
    const result = await service.updateMe(req.user.id, dto);
    return res.status(200).json(result);
  }
}

export default new AuthController();
