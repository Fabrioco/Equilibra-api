import { Router } from "express";
import controller from "./no-auth.controller";

const router = Router();

router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-token", controller.verifyToken);
router.post("/reset-password", controller.resetPassword);

export default router;
