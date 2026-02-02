import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code?: string;
  limitType?: "transactions" | "goals";

  constructor(
    message: string,
    status = 400,
    code?: string,
    limitType?: "transactions" | "goals",
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.limitType = limitType;
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    const errors = err.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const field = issue.path.join(".");
      if (!acc[field]) acc[field] = [];
      acc[field].push(issue.message);
      return acc;
    }, {});

    return res.status(400).json({
      message: "Validation error",
      errors,
      statusCode: 400,
    });
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      message: err.message,
      statusCode: err.status,
    };
    if (err.code) body.code = err.code;
    if (err.limitType) body.limitType = err.limitType;
    return res.status(err.status).json(body);
  }

  return res.status(500).json({
    message: "Internal Server Error",
    statusCode: 500,
  });
}
