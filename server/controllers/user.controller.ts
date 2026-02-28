import type { Request, Response } from "express";
import { storage } from "../storage";

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).userId;
  const user = await storage.getUser(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
}

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { userName, description, photoUrl } = req.body;
  const updated = await storage.updateUser(userId, { userName, description, photoUrl });
  if (!updated) return res.status(404).json({ message: "User not found" });
  const { password: _, ...safe } = updated;
  res.json({ user: safe });
}

export async function getAllUsers(req: Request, res: Response) {
  const allUsers = await storage.getAllUsers();
  const allOrders = await Promise.all(allUsers.map(async u => {
    const orders = await storage.getUserOrders(u.id);
    return { userId: u.id, orders };
  }));
  const usersWithStats = allUsers.map(u => {
    const { password: _, ...safe } = u;
    const userOrders = allOrders.find(o => o.userId === u.id)?.orders ?? [];
    return { ...safe, ordersCount: userOrders.length, totalPaid: userOrders.reduce((s, o) => s + o.amount, 0) };
  });
  res.json({ users: usersWithStats });
}
