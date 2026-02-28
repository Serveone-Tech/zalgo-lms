import type { Request, Response } from "express";
import crypto from "crypto";
import { razorpay, isRazorpayConfigured } from "../config/razorpay";
import { storage } from "../storage";

export async function createOrder(req: Request, res: Response) {
  if (!isRazorpayConfigured || !razorpay) {
    return res.status(503).json({ message: "Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_SECRET to your environment." });
  }

  const userId = (req as any).userId;
  const { courseId, couponId } = req.body;

  if (!courseId) return res.status(400).json({ message: "courseId is required" });

  const course = await storage.getCourse(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const existing = await storage.getEnrollment(userId, courseId);
  if (existing) return res.status(400).json({ message: "Already enrolled in this course" });

  let finalAmount = course.price ?? 0;

  if (couponId) {
    const coupon = await storage.getCoupon(couponId);
    if (coupon && coupon.isActive) {
      finalAmount = finalAmount - (finalAmount * coupon.discountPercent) / 100;
    }
  }

  if (finalAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount. Use free enrollment for zero-price courses." });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${courseId.slice(-6)}_${userId.slice(-6)}_${Date.now()}`,
      notes: { courseId, userId, couponId: couponId ?? "" },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
      finalAmount,
    });
  } catch (err: any) {
    console.error("[Razorpay] Create order error:", err);
    res.status(500).json({ message: "Failed to create payment order. Please try again." });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  if (!isRazorpayConfigured) {
    return res.status(503).json({ message: "Payment gateway is not configured." });
  }

  const userId = (req as any).userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, finalAmount, couponId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = hmac.digest("hex");

  if (digest !== razorpay_signature) {
    console.error("[Razorpay] Signature mismatch — possible fraud attempt from userId:", userId);
    return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
  }

  try {
    const existing = await storage.getEnrollment(userId, courseId);
    if (!existing) {
      await storage.createEnrollment({ userId, courseId, progress: 0 });
      await storage.createOrder({
        userId,
        courseId,
        amount: finalAmount ?? 0,
        couponId: couponId ?? null,
        status: "completed",
      });
      if (couponId) await storage.incrementCouponUsage(couponId);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("[Razorpay] Post-verification enrollment error:", err);
    res.status(500).json({ message: "Payment verified but enrollment failed. Please contact support." });
  }
}
