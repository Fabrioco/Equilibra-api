import "dotenv/config";
import * as jwt from "jsonwebtoken";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { prisma } from "../../lib/prisma";
import * as bcrypt from "bcrypt";
import { AppError } from "../../middlewares/error";
import { LoginRequestDto } from "./dtos/login-request.dto";

class AuthService {
  async register(dto: RegisterRequestDto) {
    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT_SECRET is not defined", 500);
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const token = await this.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(dto: LoginRequestDto) {
    const user = await prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    const token = await this.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async me(userId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  private async hashPassword(password: string) {
    if (!password) {
      throw new AppError("Password is required", 400);
    }

    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  private async generateToken(user: {
    id: number;
    name: string;
    email: string;
  }) {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );
  }
}

export default new AuthService();
