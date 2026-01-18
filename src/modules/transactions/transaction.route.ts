import { Router } from "express";
import controller from "./transaction.controller";

const router = Router();

router.post("/", controller.createTransaction);
router.get("/", controller.getTransactions);
router.get("/:id", controller.getOneTransaction);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);
router.delete("/installments/:id", controller.deleteAllInstallments);
export default router;
