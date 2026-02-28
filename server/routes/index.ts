import type { Express } from "express";
import type { Server } from "http";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import moduleRoutes from "./module.routes";
import lectureRoutes from "./lecture.routes";
import enrollmentRoutes from "./enrollment.routes";
import couponRoutes from "./coupon.routes";
import leaderboardRoutes from "./leaderboard.routes";
import chatRoutes from "./chat.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";

export function applyRoutes(httpServer: Server, app: Express): Server {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api", moduleRoutes);
  app.use("/api", lectureRoutes);
  app.use("/api", enrollmentRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/upload", uploadRoutes);
  return httpServer;
}
