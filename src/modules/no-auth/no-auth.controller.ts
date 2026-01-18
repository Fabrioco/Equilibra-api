import { Request, Response } from "express";
import { ForgotPasswordSchema } from "./dtos/forgot-password.dto";
import service from "./no-auth.service";
import { VerifyTokenSchema } from "./dtos/verify-token.dto";
import { ResetPasswordSchema } from "./dtos/reset-password.dto";

class noAuthController {
  async forgotPassword(req: Request, res: Response) {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    const result = await service.forgotPassword(parsed.data!);
    res.status(200).json(result);
  }

  async verifyToken(req: Request, res: Response) {
    const parsed = VerifyTokenSchema.safeParse(req.body);
    const result = await service.verifyToken(parsed.data!);
    res.status(200).json(result);
  }

  async resetPassword(req: Request, res: Response) {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    const result = await service.resetPassword(parsed.data!);
    res.status(200).json(result);
  }
}

export default new noAuthController();
