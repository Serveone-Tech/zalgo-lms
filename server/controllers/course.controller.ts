import type { Request, Response } from "express";
import { storage } from "../storage";
import { insertCourseSchema } from "@shared/schema";
import { enrichCourse } from "../utils/course.utils";

export async function getPublishedCourses(_req: Request, res: Response) {
  const courses = await storage.getPublishedCourses();
  const enriched = await Promise.all(courses.map(enrichCourse));
  res.json({ courses: enriched });
}

export async function getAdminCourses(req: Request, res: Response) {
  const userId = (req as any).userId;
  const courses = await storage.getCoursesByCreator(userId);
  res.json({ courses });
}

export async function getEnrolledCourses(req: Request, res: Response) {
  const userId = (req as any).userId;
  const enrollments = await storage.getUserEnrollments(userId);
  const courses = await Promise.all(enrollments.map(async e => {
    const course = await storage.getCourse(e.courseId);
    if (!course) return null;
    const enriched = await enrichCourse(course);
    return { ...enriched, progress: e.progress, enrolledAt: e.enrolledAt };
  }));
  res.json({ courses: courses.filter(Boolean) });
}

export async function getCourseById(req: Request, res: Response) {
  const course = await storage.getCourse(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ course });
}

export async function createCourse(req: Request, res: Response) {
  const userId = (req as any).userId;
  try {
    const body = insertCourseSchema.parse({ ...req.body, creatorId: userId });
    const course = await storage.createCourse(body);
    res.json({ course });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateCourse(req: Request, res: Response) {
  const updated = await storage.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Course not found" });
  res.json({ course: updated });
}

export async function deleteCourse(req: Request, res: Response) {
  await storage.deleteCourse(req.params.id);
  res.json({ success: true });
}

export async function getCourseCertificate(req: Request, res: Response) {
  const userId = (req as any).userId;
  const enrollment = await storage.getEnrollment(userId, req.params.courseId);
  if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });
  const modules = await storage.getCourseModules(req.params.courseId);
  const allLectures = (await Promise.all(modules.map((m: any) => storage.getModuleLectures(m.id)))).flat();
  const completedIds = await storage.getCompletedLectures(userId, req.params.courseId);
  const isCompleted = allLectures.length > 0 && completedIds.length >= allLectures.length;
  if (!isCompleted) return res.status(403).json({ message: "Course not yet completed" });
  const user = await storage.getUser(userId);
  const course = await storage.getCourse(req.params.courseId);
  if (!user || !course) return res.status(404).json({ message: "Not found" });
  const certId = `ZE-${userId.slice(-4).toUpperCase()}-${req.params.courseId.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  res.json({ studentName: user.userName, courseName: course.title, category: course.category, completedAt: enrollment.enrolledAt, certId });
}
