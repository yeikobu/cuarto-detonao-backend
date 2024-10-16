import { Router } from "express";
import { getAllPayments, createPayment, updatePaymentById, deletePaymentById } from "../controllers/payments.controller.js";

const router = Router();

router.get("/payments", getAllPayments);

router.post("/payment/", createPayment);

router.put("/payment/:id", updatePaymentById);

router.delete("/payment/:id", deletePaymentById);

export default router;