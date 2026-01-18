import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { mailTransporter } from "../../utils/email.util";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import crypto from "crypto";
import { VerifyTokenDto } from "./dtos/verify-token.dto";

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
        resetToken: tokenHash,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired token", 401);
    }

    // invalida o token após verificação
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        tokenExpiresAt: null,
      },
    });

    return true;
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
