import express, { Application, Request, Response } from "express";
import cors from "cors";

export const createApp = (): Application => {
  const app = express();

  // middlewares
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // routes
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
};
