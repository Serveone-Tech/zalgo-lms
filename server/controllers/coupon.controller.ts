import type { Request, Response } from "express";
import { storage } from "../storage";
import { insertCouponSchema } from "@shared/schema";
import { SESSION_USER_KEY } from "../config/constants";

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
  const { code, coursePrice } = req.body;
  const coupon = await storage.getCouponByCode(code);
  if (!coupon || !coupon.isActive) return res.status(400).json({ message: "Invalid or expired coupon" });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: "Coupon expired" });
  if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) return res.status(400).json({ message: "Coupon usage limit reached" });
  const discount = (coursePrice * coupon.discountPercent) / 100;
  const finalAmount = coursePrice - discount;
  res.json({ couponId: coupon.id, discount, finalAmount, discountPercent: coupon.discountPercent });
}

export async function createCoupon(req: Request, res: Response) {
  try {
    const body = insertCouponSchema.parse(req.body);
    const coupon = await storage.createCoupon(body);
    res.json({ coupon });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateCoupon(req: Request, res: Response) {
  const updated = await storage.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Coupon not found" });
  res.json({ coupon: updated });
}

export async function deleteCoupon(req: Request, res: Response) {
  await storage.deleteCoupon(req.params.id);
  res.json({ success: true });
}
