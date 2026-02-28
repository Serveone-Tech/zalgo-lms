import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";
import { createOrder, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/order", requireAuth, paymentLimiter, createOrder);
router.post("/verify", requireAuth, paymentLimiter, verifyPayment);

export default router;
