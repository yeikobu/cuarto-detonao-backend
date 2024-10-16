import { Router } from "express";
import { getAllPayments, createPayment, updatePaymentById } from "../controllers/payments.controller.js";

const router = Router();

router.get("/payments", getAllPayments);

router.post("/payment/", createPayment);

router.put("/payment/:id", updatePaymentById);

export default router;