import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { SESSION_USER_KEY } from "../config/constants";
import { insertUserSchema } from "@shared/schema";
import { sendOtpEmail } from "../utils/email.utils";
import { isEmailConfigured } from "../config/email";

const SALT_ROUNDS = 12;

export async function signup(req: Request, res: Response) {
  try {
    const body = insertUserSchema.parse(req.body);
    const existing = await storage.getUserByEmail(body.email);
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);
    const user = await storage.createUser({ ...body, password: hashedPassword, role: "user" });
    (req.session as any)[SESSION_USER_KEY] = user.id;
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(400).json({ message: err.errors?.[0]?.message ?? err.message });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });
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

  const safeResponse = { message: "If that email exists, a reset code has been sent to your inbox." };

  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.json(safeResponse);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await storage.storeResetToken(email, code, expiresAt);

  if (isEmailConfigured) {
    try {
      await sendOtpEmail(email, code);
      console.log(`[email] OTP sent to ${email.replace(/(.{3}).*(@.*)/, "$1***$2")}`);
    } catch (err: any) {
      console.error("[email] Failed to send OTP email:", err.message);
      await storage.deleteResetToken(email);
      return res.status(503).json({
        message: "Failed to send OTP email. Please try again in a moment.",
      });
    }
  } else {
    console.warn("[email] Email not configured — OTP generated but NOT sent. Configure EMAIL_* env vars.");
    return res.status(503).json({
      message: "Email service is not configured. Please contact the administrator.",
    });
  }

  res.json(safeResponse);
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: "All fields are required" });
  if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  const tokenData = await storage.getResetToken(email);
  if (!tokenData) return res.status(400).json({ message: "No reset request found. Please request a new code." });

  if (tokenData.expiresAt < new Date()) {
    await storage.deleteResetToken(email);
    return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
  }

  if (tokenData.code !== code) return res.status(400).json({ message: "Invalid reset code. Please check your email." });

  const user = await storage.getUserByEmail(email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) return res.status(400).json({ message: "New password must be different from your current password" });

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await storage.updateUser(user.id, { password: hashedPassword });
  await storage.deleteResetToken(email);

  res.json({ message: "Password reset successfully. You can now sign in." });
}

export async function changePassword(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });
  if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
  const user = await storage.getUser(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const isOldValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldValid) return res.status(400).json({ message: "Current password is incorrect" });
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) return res.status(400).json({ message: "New password must be different from current password" });
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await storage.updateUser(userId, { password: hashedPassword });
  res.json({ message: "Password changed successfully" });
}

export async function getMe(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await storage.getUser(userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
}
