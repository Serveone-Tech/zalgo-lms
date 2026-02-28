import type { Request, Response } from "express";
import { storage } from "../storage";

export async function createLecture(req: Request, res: Response) {
  const existing = await storage.getModuleLectures(req.params.moduleId);
  const lecture = await storage.createLecture({
    moduleId: req.params.moduleId,
    title: req.body.title,
    videoUrl: req.body.videoUrl,
    duration: req.body.duration ?? 0,
    order: existing.length,
  });
  res.json({ lecture });
}

export async function updateLecture(req: Request, res: Response) {
  const updated = await storage.updateLecture(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Lecture not found" });
  res.json({ lecture: updated });
}

export async function deleteLecture(req: Request, res: Response) {
  await storage.deleteLecture(req.params.id);
  res.json({ success: true });
}
