import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import routes from "./modules/index.routes";
import { AppError, errorHandler } from "./middlewares/error";

export const createApp = (): Application => {
  const app = express();

  // middlewares
  app.use(
    cors({
      origin: "*",
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
  app.use("/v1", routes);

  app.use(errorHandler);
  return app;
};
