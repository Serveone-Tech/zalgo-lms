import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";

const enrollSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  amount: z.number().optional(),
  couponId: z.string().optional().nullable(),
});

export async function enroll(req: Request, res: Response) {
  const userId = (req as any).userId;

  const parsed = enrollSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { courseId, amount, couponId } = parsed.data;

  const course = await storage.getCourse(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const coursePrice = course.price ?? 0;

  if (coursePrice > 0) {
    if (!couponId) {
      return res.status(403).json({
        message: "This is a paid course. Please complete payment through the payment gateway.",
      });
    }
    const coupon = await storage.getCoupon(couponId);
    if (!coupon || !coupon.isActive) {
      return res.status(403).json({ message: "Invalid coupon. Please use the payment gateway." });
    }
    const effectiveFinal = coursePrice - (coursePrice * coupon.discountPercent) / 100;
    if (effectiveFinal > 0) {
      return res.status(403).json({
        message: "This is a paid course. Please complete payment through the payment gateway.",
      });
    }
  }

  const existing = await storage.getEnrollment(userId, courseId);
  if (existing) return res.status(400).json({ message: "Already enrolled in this course" });

  await storage.createEnrollment({ userId, courseId, progress: 0 });
  await storage.createOrder({ userId, courseId, amount: 0, couponId: couponId ?? null, status: "completed" });
  if (couponId) await storage.incrementCouponUsage(couponId);

  res.json({ success: true });
}

export async function getEnrollment(req: Request, res: Response) {
  const userId = (req as any).userId;
  const enrollment = await storage.getEnrollment(userId, req.params.courseId);
  res.json({ enrolled: !!enrollment, enrollment });
}

export async function completeLecture(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { courseId, lectureId } = req.params;

  const enrollment = await storage.getEnrollment(userId, courseId);
  if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });

  await storage.markLectureComplete(userId, courseId, lectureId);
  const modules = await storage.getCourseModules(courseId);
  const allLectures = (await Promise.all(modules.map((m: any) => storage.getModuleLectures(m.id)))).flat();
  const completed = await storage.getCompletedLectures(userId, courseId);
  const progress = allLectures.length ? Math.round((completed.length / allLectures.length) * 100) : 0;
  await storage.updateEnrollmentProgress(userId, courseId, progress);
  res.json({ progress, completed });
}

export async function getCourseProgress(req: Request, res: Response) {
  const userId = (req as any).userId;
  const enrollment = await storage.getEnrollment(userId, req.params.courseId);
  if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });
  const completed = await storage.getCompletedLectures(userId, req.params.courseId);
  res.json({ completed });
}
