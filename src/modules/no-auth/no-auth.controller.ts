import { Request, Response } from "express";
import { ForgotPasswordSchema } from "./dtos/forgot-password.dto";
import service from "./no-auth.service";
import { VerifyTokenSchema } from "./dtos/verify-token.dto";
import { ResetPasswordSchema } from "./dtos/reset-password.dto";

class NoAuthController {
  async forgotPassword(req: Request, res: Response) {
    const dto = ForgotPasswordSchema.parse(req.body);
    await service.forgotPassword(dto);
    return res.status(200).json({
      message: "Password reset code sent to your email",
    });
  }

  async verifyToken(req: Request, res: Response) {
    const dto = VerifyTokenSchema.parse(req.body);
    await service.verifyToken(dto);
    return res.status(200).json({
      status: "ok",
      message: "Token is valid",
    });
  }

  async resetPassword(req: Request, res: Response) {
    const dto = ResetPasswordSchema.parse(req.body);
    await service.resetPassword(dto);
    return res.status(200).json({
      message: "Password updated successfully",
    });
  }
}

export default new NoAuthController();
