import { User } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<"id" | "name" | "email">;
    }
  }
}
