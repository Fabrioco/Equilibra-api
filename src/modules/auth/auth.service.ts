import "dotenv/config";
import * as jwt from "jsonwebtoken";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { prisma } from "../../lib/prisma";
import * as bcrypt from "bcrypt";
import { AppError } from "../../middlewares/error";
import { LoginRequestDto } from "./dtos/login-request.dto";
import { UpdateMeDto } from "./dtos/update-me.dto";
import { Plan } from "../../generated/prisma/enums";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not defined", 500);
  }
  return secret;
}

class AuthService {
  async register(dto: RegisterRequestDto) {
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
        plan: user.plan,
        privacyMode: user.privacyMode,
        enableNotifications: user.enableNotifications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
        plan: user.plan,
        privacyMode: user.privacyMode,
        enableNotifications: user.enableNotifications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

  async updateMe(userId: number, dto: UpdateMeDto) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (existingUser) {
        throw new AppError("Email already in use", 409);
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      plan?: Plan;
      privacyMode?: boolean;
      enableNotifications?: boolean;
    } = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.password) {
      updateData.password = await this.hashPassword(dto.password);
    }
    if (dto.plan) updateData.plan = dto.plan;
    if (typeof dto.privacyMode === "boolean")
      updateData.privacyMode = dto.privacyMode;
    if (typeof dto.enableNotifications === "boolean")
      updateData.enableNotifications = dto.enableNotifications;

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      omit: {
        password: true,
      },
    });
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
      getJwtSecret(),
      {
        expiresIn: "1d",
      },
    );
  }
}

export default new AuthService();
