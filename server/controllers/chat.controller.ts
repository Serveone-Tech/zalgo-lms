import type { Request, Response } from "express";
import { storage } from "../storage";

export async function getMessages(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await storage.getUser(userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  if (user.role === "admin") {
    const messages = await storage.getAllChatMessages();
    return res.json({ messages });
  }
  await storage.markChatRead(userId);
  const messages = await storage.getChatMessages(userId);
  res.json({ messages });
}

export async function getUnreadCount(req: Request, res: Response) {
  const userId = (req as any).userId;
  const count = await storage.getUnreadCount(userId);
  res.json({ count });
}

export async function sendMessage(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await storage.getUser(userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  const { content, studentId } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: "Message is required" });
  if (user.role === "admin") {
    if (!studentId) return res.status(400).json({ message: "studentId required for admin" });
    const targetUser = await storage.getUser(studentId);
    const msg = await storage.createChatMessage({ studentId, studentName: targetUser?.userName ?? "Student", content, isFromAdmin: true });
    return res.json({ message: msg });
  }
  const msg = await storage.createChatMessage({ studentId: userId, studentName: user.userName, content, isFromAdmin: false });
  res.json({ message: msg });
}

export async function getChatStudents(req: Request, res: Response) {
  const allMessages = await storage.getAllChatMessages();
  const studentMap = new Map<string, { studentId: string; studentName: string; lastMessage: string; lastTime: Date; unread: number }>();
  for (const msg of allMessages) {
    const entry = studentMap.get(msg.studentId);
    const unreadIncr = (!msg.isFromAdmin && !msg.isRead) ? 1 : 0;
    if (!entry || msg.timestamp > entry.lastTime) {
      studentMap.set(msg.studentId, { studentId: msg.studentId, studentName: msg.studentName, lastMessage: msg.content, lastTime: msg.timestamp, unread: (entry?.unread ?? 0) + unreadIncr });
    } else {
      studentMap.set(msg.studentId, { ...entry, unread: entry.unread + unreadIncr });
    }
  }
  const students = Array.from(studentMap.values()).sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());
  res.json({ students });
}
