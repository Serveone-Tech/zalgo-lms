import type { Request, Response, NextFunction } from "express";
import { SESSION_USER_KEY } from "../config/constants";
import { storage } from "../storage";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)[SESSION_USER_KEY];
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  (req as any).userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)[SESSION_USER_KEY];
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  (req as any).userId = userId;
  (req as any).adminUser = user;
  next();
}
