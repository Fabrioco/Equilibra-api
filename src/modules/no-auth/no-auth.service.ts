import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { mailTransporter } from "../../utils/email.util";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import crypto from "crypto";
import { VerifyTokenDto } from "./dtos/verify-token.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import bcrypt from "bcrypt";

class noAuthService {
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = this.generateOtp(); // código visível
    const otpHash = this.hashOtp(otp); // hash para o banco
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otpHash,
        tokenExpiresAt: expiresAt,
      },
    });

    await mailTransporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Redefinição de senha",
      html: `
      <h2>Redefinir senha</h2>
      <p>Seu código é:</p>
      <h1>${otp}</h1>
      <p>Expira em 15 minutos.</p>
    `,
    });
  }

  async verifyToken(dto: VerifyTokenDto) {
    const tokenHash = this.hashOtp(dto.token);

    const user = await prisma.user.findFirst({
      where: {
        email: dto.email,
        resetToken: tokenHash,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      status: "ok",
      message: "Token is valid",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashOtp(dto.token);
    const user = await prisma.user.findFirst({
      where: {
        email: dto.email,
        resetToken: tokenHash,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired token", 401);
    }

    if (dto.confirmNewPassword !== dto.newPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const salt = await bcrypt.genSalt(12);
    const newPassword = await bcrypt.hash(dto.newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetToken: null,
        tokenExpiresAt: null,
      },
    });
    return {
      message: "Password updated successfully",
    };
  }

  private hashOtp(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
  }

  private compareOtp(code: string, hash: string): boolean {
    return this.hashOtp(code) === hash;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new noAuthService();
