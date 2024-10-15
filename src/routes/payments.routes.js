import { Router } from "express";
import { getAllPayments, createPayment } from "../controllers/payments.controller.js";

const router = Router();

router.get("/payments", getAllPayments);

router.post("/payment/", createPayment);

export default router;