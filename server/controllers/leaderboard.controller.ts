import type { Request, Response } from "express";
import { storage } from "../storage";

export async function getLeaderboard(_req: Request, res: Response) {
  const leaderboard = await storage.getLeaderboard();
  res.json({ leaderboard });
}
