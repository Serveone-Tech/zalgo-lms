import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";

const createModuleSchema = z.object({
  title: z.string().min(1, "Module title is required").max(200, "Title too long"),
});

const updateModuleSchema = z.object({
  title: z.string().min(1, "Module title is required").max(200).optional(),
  order: z.number().int().min(0).optional(),
});

export async function getCourseModules(req: Request, res: Response) {
  const modules = await storage.getCourseModules(req.params.courseId);
  const modulesWithLectures = await Promise.all(modules.map(async m => {
    const lectures = await storage.getModuleLectures(m.id);
    return { ...m, lectures };
  }));
  res.json({ modules: modulesWithLectures });
}

export async function createModule(req: Request, res: Response) {
  const parsed = createModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const course = await storage.getCourse(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const modules = await storage.getCourseModules(req.params.courseId);
  const module = await storage.createModule({
    courseId: req.params.courseId,
    title: parsed.data.title,
    order: modules.length,
  });
  res.status(201).json({ module });
}

export async function updateModule(req: Request, res: Response) {
  const parsed = updateModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const updated = await storage.updateModule(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ message: "Module not found" });
  res.json({ module: updated });
}

export async function deleteModule(req: Request, res: Response) {
  const module = await storage.getModule(req.params.id);
  if (!module) return res.status(404).json({ message: "Module not found" });
  await storage.deleteModule(req.params.id);
  res.json({ success: true });
}
