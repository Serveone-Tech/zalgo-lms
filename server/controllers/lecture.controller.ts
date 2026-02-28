import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";

const createLectureSchema = z.object({
  title: z.string().min(1, "Lecture title is required").max(200, "Title too long"),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")).transform(v => v || undefined),
  duration: z.number().int().min(0).optional().default(0),
});

const updateLectureSchema = z.object({
  title: z.string().min(1, "Lecture title is required").max(200).optional(),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")).transform(v => v || undefined),
  duration: z.number().int().min(0).optional(),
});

export async function createLecture(req: Request, res: Response) {
  const parsed = createLectureSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const module = await storage.getModule(req.params.moduleId);
  if (!module) return res.status(404).json({ message: "Module not found" });

  const existing = await storage.getModuleLectures(req.params.moduleId);
  const lecture = await storage.createLecture({
    moduleId: req.params.moduleId,
    title: parsed.data.title,
    videoUrl: parsed.data.videoUrl,
    duration: parsed.data.duration ?? 0,
    order: existing.length,
  });
  res.status(201).json({ lecture });
}

export async function updateLecture(req: Request, res: Response) {
  const parsed = updateLectureSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const updated = await storage.updateLecture(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ message: "Lecture not found" });
  res.json({ lecture: updated });
}

export async function deleteLecture(req: Request, res: Response) {
  const lecture = await storage.getLecture(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });
  await storage.deleteLecture(req.params.id);
  res.json({ success: true });
}
