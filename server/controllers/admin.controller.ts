import type { Request, Response } from "express";
import { storage } from "../storage";

export async function getStats(_req: Request, res: Response) {
  const [allCourses, allUsers, stats, activeCoupons] = await Promise.all([
    storage.getAllCourses(),
    storage.getAllUsers(),
    storage.getOrderStats(),
    storage.getActiveCoupons(),
  ]);
  res.json({
    totalCourses: allCourses.length,
    publishedCourses: allCourses.filter(c => c.isPublished).length,
    totalUsers: allUsers.filter(u => u.role === "user").length,
    totalRevenue: stats.totalRevenue,
    totalOrders: stats.totalOrders,
    activeCoupons: activeCoupons.length,
  });
}
