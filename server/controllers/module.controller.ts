import type { Request, Response } from "express";
import { storage } from "../storage";

export async function getCourseModules(req: Request, res: Response) {
  const modules = await storage.getCourseModules(req.params.courseId);
  const modulesWithLectures = await Promise.all(modules.map(async m => {
    const lectures = await storage.getModuleLectures(m.id);
    return { ...m, lectures };
  }));
  res.json({ modules: modulesWithLectures });
}

export async function createModule(req: Request, res: Response) {
  const modules = await storage.getCourseModules(req.params.courseId);
  const module = await storage.createModule({
    courseId: req.params.courseId,
    title: req.body.title,
    order: modules.length,
  });
  res.json({ module });
}

export async function updateModule(req: Request, res: Response) {
  const updated = await storage.updateModule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Module not found" });
  res.json({ module: updated });
}

export async function deleteModule(req: Request, res: Response) {
  await storage.deleteModule(req.params.id);
  res.json({ success: true });
}
