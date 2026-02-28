import type { Request, Response } from "express";
import { storage } from "../storage";
import { SESSION_USER_KEY } from "../config/constants";
import { insertUserSchema } from "@shared/schema";

export async function signup(req: Request, res: Response) {
  try {
    const body = insertUserSchema.parse(req.body);
    const existing = await storage.getUserByEmail(body.email);
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const user = await storage.createUser({ ...body, role: "user" });
    (req.session as any)[SESSION_USER_KEY] = user.id;
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
    (req.session as any)[SESSION_USER_KEY] = user.id;
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export function signout(req: Request, res: Response) {
  req.session.destroy(() => res.json({ success: true }));
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const user = await storage.getUserByEmail(email);
  if (!user) return res.status(404).json({ message: "No account found with this email" });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await storage.storeResetToken(email, code, expiresAt);
  res.json({ message: "Password reset code generated", demoCode: code });
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: "All fields are required" });
  if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  const tokenData = await storage.getResetToken(email);
  if (!tokenData) return res.status(400).json({ message: "No reset request found. Please request a new code." });
  if (tokenData.expiresAt < new Date()) {
    await storage.deleteResetToken(email);
    return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
  }
  if (tokenData.code !== code) return res.status(400).json({ message: "Invalid reset code" });
  const user = await storage.getUserByEmail(email);
  if (!user) return res.status(404).json({ message: "User not found" });
  await storage.updateUser(user.id, { password: newPassword });
  await storage.deleteResetToken(email);
  res.json({ message: "Password reset successfully. You can now sign in." });
}

export async function changePassword(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });
  if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
  const user = await storage.getUser(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.password !== oldPassword) return res.status(400).json({ message: "Current password is incorrect" });
  if (oldPassword === newPassword) return res.status(400).json({ message: "New password must be different from current password" });
  await storage.updateUser(userId, { password: newPassword });
  res.json({ message: "Password changed successfully" });
}

export async function getMe(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await storage.getUser(userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
}
