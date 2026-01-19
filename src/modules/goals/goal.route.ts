import { Router } from "express";
import controller from "./goal.controller";

const router = Router();

router.post("/", controller.create);

export default router;