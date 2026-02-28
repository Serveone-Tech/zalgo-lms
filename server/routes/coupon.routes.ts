import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { getCoupons, applyCoupon, createCoupon, updateCoupon, deleteCoupon } from "../controllers/coupon.controller";

const router = Router();

router.get("/", getCoupons);
router.post("/apply", applyCoupon);
router.post("/", requireAdmin, createCoupon);
router.patch("/:id", requireAdmin, updateCoupon);
router.delete("/:id", requireAdmin, deleteCoupon);

export default router;
