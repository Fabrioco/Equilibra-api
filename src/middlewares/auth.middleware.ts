import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error";
import { prisma } from "../lib/prisma";

interface JwtPayload {
  id: number;
  name: string;
  email: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Header not provided", 401);
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer") {
    throw new AppError("Invalid token format", 401);
  }

  if (!token) {
    throw new AppError("Token not provided", 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not defined", 500);
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  req.user = user;
  next();
}
