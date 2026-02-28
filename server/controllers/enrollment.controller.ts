import type { Request, Response } from "express";
import { storage } from "../storage";

export async function enroll(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { courseId, amount, couponId } = req.body;
  const existing = await storage.getEnrollment(userId, courseId);
  if (existing) return res.status(400).json({ message: "Already enrolled" });
  await storage.createEnrollment({ userId, courseId, progress: 0 });
  await storage.createOrder({ userId, courseId, amount: amount ?? 0, couponId, status: "completed" });
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
  await storage.markLectureComplete(userId, req.params.courseId, req.params.lectureId);
  const modules = await storage.getCourseModules(req.params.courseId);
  const allLectures = (await Promise.all(modules.map(m => storage.getModuleLectures(m.id)))).flat();
  const completed = await storage.getCompletedLectures(userId, req.params.courseId);
  const progress = allLectures.length ? Math.round((completed.length / allLectures.length) * 100) : 0;
  await storage.updateEnrollmentProgress(userId, req.params.courseId, progress);
  res.json({ progress, completed });
}

export async function getCourseProgress(req: Request, res: Response) {
  const userId = (req as any).userId;
  const completed = await storage.getCompletedLectures(userId, req.params.courseId);
  res.json({ completed });
}
