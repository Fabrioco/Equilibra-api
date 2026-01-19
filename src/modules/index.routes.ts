import { Router } from "express";
import authRouter from "./auth/auth.route";
import noAuthRouter from "./no-auth/no-auth.route";
import transactionRouter from "./transactions/transaction.route";
import goalRouter from "./goals/goal.route";
import { authMiddleware } from "../middlewares/auth.middleware";

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/no-auth", noAuthRouter);
routes.use("/transactions", authMiddleware, transactionRouter);
routes.use("/goals", authMiddleware, goalRouter);

export default routes;
