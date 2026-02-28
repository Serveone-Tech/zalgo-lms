import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertCouponSchema } from "@shared/schema";
import { SESSION_USER_KEY } from "../config/constants";

const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  coursePrice: z.number().positive("Invalid course price"),
});

export async function getCoupons(req: Request, res: Response) {
  const userId = (req as any).userId ?? (req.session as any)[SESSION_USER_KEY];
  const user = userId ? await storage.getUser(userId) : null;
  if (user?.role === "admin") {
    const coupons = await storage.getAllCoupons();
    return res.json({ coupons });
  }
  const coupons = await storage.getActiveCoupons();
  res.json({ coupons });
}

export async function applyCoupon(req: Request, res: Response) {
  const parsed = applyCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { code, coursePrice } = parsed.data;
  const coupon = await storage.getCouponByCode(code);
  if (!coupon || !coupon.isActive) return res.status(400).json({ message: "Invalid or expired coupon code" });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: "This coupon has expired" });
  if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) return res.status(400).json({ message: "Coupon usage limit has been reached" });

  const discount = (coursePrice * coupon.discountPercent) / 100;
  const finalAmount = Math.max(0, coursePrice - discount);
  res.json({ couponId: coupon.id, discount, finalAmount, discountPercent: coupon.discountPercent });
}

export async function createCoupon(req: Request, res: Response) {
  try {
    const body = insertCouponSchema.parse(req.body);
    if (body.discountPercent <= 0 || body.discountPercent > 100) {
      return res.status(400).json({ message: "Discount percent must be between 1 and 100" });
    }
    const existing = await storage.getCouponByCode(body.code);
    if (existing) return res.status(400).json({ message: "Coupon code already exists" });
    const coupon = await storage.createCoupon(body);
    res.status(201).json({ coupon });
  } catch (err: any) {
    res.status(400).json({ message: err.errors?.[0]?.message ?? err.message });
  }
}

export async function updateCoupon(req: Request, res: Response) {
  const updateSchema = insertCouponSchema.partial();
  try {
    const body = updateSchema.parse(req.body);
    const updated = await storage.updateCoupon(req.params.id, body);
    if (!updated) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.errors?.[0]?.message ?? err.message });
  }
}

export async function deleteCoupon(req: Request, res: Response) {
  await storage.deleteCoupon(req.params.id);
  res.json({ success: true });
}
