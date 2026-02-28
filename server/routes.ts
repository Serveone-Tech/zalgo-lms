import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCourseSchema, insertModuleSchema, insertLectureSchema, insertCouponSchema } from "@shared/schema";
import { z } from "zod";

const SESSION_USER_KEY = "userId";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // --- AUTH ---
  app.post("/api/auth/signup", async (req, res) => {
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
  });

  app.post("/api/auth/signin", async (req, res) => {
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
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found with this email" });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await storage.storeResetToken(email, code, expiresAt);
    res.json({
      message: "Password reset code generated",
      demoCode: code,
    });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
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
  });

  app.post("/api/auth/change-password", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== oldPassword) return res.status(400).json({ message: "Current password is incorrect" });
    if (oldPassword === newPassword) return res.status(400).json({ message: "New password must be different from current password" });
    await storage.updateUser(userId, { password: newPassword });
    res.json({ message: "Password changed successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  });

  // --- USERS ---
  app.get("/api/users/me", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safe } = user;
    res.json({ user: safe });
  });

  app.patch("/api/users/me", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { userName, description, photoUrl } = req.body;
    const updated = await storage.updateUser(userId, { userName, description, photoUrl });
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safe } = updated;
    res.json({ user: safe });
  });

  app.get("/api/admin/users", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const allUsers = await storage.getAllUsers();
    const allOrders = await Promise.all(allUsers.map(async u => {
      const orders = await storage.getUserOrders(u.id);
      return { userId: u.id, orders };
    }));
    const usersWithStats = allUsers.map(u => {
      const { password: _, ...safe } = u;
      const userOrders = allOrders.find(o => o.userId === u.id)?.orders ?? [];
      return {
        ...safe,
        ordersCount: userOrders.length,
        totalPaid: userOrders.reduce((s, o) => s + o.amount, 0),
      };
    });
    res.json({ users: usersWithStats });
  });

  // --- COURSES ---
  const courseMetadata: Record<string, { level: string; rating: number }> = {
    "course-001": { level: "Beginner to Advanced", rating: 4.8 },
    "course-002": { level: "Intermediate", rating: 4.7 },
    "course-003": { level: "All Levels", rating: 4.9 },
    "course-004": { level: "Advanced", rating: 4.6 },
  };

  async function enrichCourse(course: any) {
    const instructor = await storage.getUser(course.creatorId);
    const lectureCount = await storage.getCourseLectureCount(course.id);
    const studentCount = await storage.getCourseEnrollmentCount(course.id);
    const meta = courseMetadata[course.id] ?? { level: "All Levels", rating: 4.5 };
    return {
      ...course,
      instructorName: instructor?.userName ?? "Zalgo Edutech",
      lectureCount,
      studentCount,
      level: meta.level,
      rating: meta.rating,
    };
  }

  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getPublishedCourses();
    const enriched = await Promise.all(courses.map(enrichCourse));
    res.json({ courses: enriched });
  });

  app.get("/api/courses/admin", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const courses = await storage.getCoursesByCreator(userId);
    res.json({ courses });
  });

  app.get("/api/courses/enrolled", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const enrollments = await storage.getUserEnrollments(userId);
    const courses = await Promise.all(enrollments.map(async e => {
      const course = await storage.getCourse(e.courseId);
      if (!course) return null;
      const enriched = await enrichCourse(course);
      return { ...enriched, progress: e.progress, enrolledAt: e.enrolledAt };
    }));
    res.json({ courses: courses.filter(Boolean) });
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  });

  app.post("/api/courses", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
      const body = insertCourseSchema.parse({ ...req.body, creatorId: userId });
      const course = await storage.createCourse(body);
      res.json({ course });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const updated = await storage.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json({ course: updated });
  });

  app.delete("/api/courses/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    await storage.deleteCourse(req.params.id);
    res.json({ success: true });
  });

  // --- MODULES ---
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    const modules = await storage.getCourseModules(req.params.courseId);
    const modulesWithLectures = await Promise.all(modules.map(async m => {
      const lectures = await storage.getModuleLectures(m.id);
      return { ...m, lectures };
    }));
    res.json({ modules: modulesWithLectures });
  });

  app.post("/api/courses/:courseId/modules", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const modules = await storage.getCourseModules(req.params.courseId);
    const module = await storage.createModule({
      courseId: req.params.courseId,
      title: req.body.title,
      order: modules.length,
    });
    res.json({ module });
  });

  app.patch("/api/modules/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const updated = await storage.updateModule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Module not found" });
    res.json({ module: updated });
  });

  app.delete("/api/modules/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    await storage.deleteModule(req.params.id);
    res.json({ success: true });
  });

  // --- LECTURES ---
  app.post("/api/modules/:moduleId/lectures", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const existing = await storage.getModuleLectures(req.params.moduleId);
    const lecture = await storage.createLecture({
      moduleId: req.params.moduleId,
      title: req.body.title,
      videoUrl: req.body.videoUrl,
      duration: req.body.duration ?? 0,
      order: existing.length,
    });
    res.json({ lecture });
  });

  app.patch("/api/lectures/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const updated = await storage.updateLecture(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Lecture not found" });
    res.json({ lecture: updated });
  });

  app.delete("/api/lectures/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    await storage.deleteLecture(req.params.id);
    res.json({ success: true });
  });

  // --- ENROLLMENTS & PROGRESS ---
  app.post("/api/enroll", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { courseId, amount, couponId } = req.body;
    const existing = await storage.getEnrollment(userId, courseId);
    if (existing) return res.status(400).json({ message: "Already enrolled" });
    await storage.createEnrollment({ userId, courseId, progress: 0 });
    await storage.createOrder({ userId, courseId, amount: amount ?? 0, couponId, status: "completed" });
    if (couponId) await storage.incrementCouponUsage(couponId);
    res.json({ success: true });
  });

  app.get("/api/courses/:courseId/enrollment", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const enrollment = await storage.getEnrollment(userId, req.params.courseId);
    res.json({ enrolled: !!enrollment, enrollment });
  });

  app.get("/api/courses/:courseId/certificate", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const enrollment = await storage.getEnrollment(userId, req.params.courseId);
    if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });
    const modules = await storage.getCourseModules(req.params.courseId);
    const allLectures = (await Promise.all(modules.map((m: any) => storage.getModuleLectures(m.id)))).flat();
    const completedIds = await storage.getCompletedLectures(userId, req.params.courseId);
    const isCompleted = allLectures.length > 0 && completedIds.length >= allLectures.length;
    if (!isCompleted) return res.status(403).json({ message: "Course not yet completed" });
    const user = await storage.getUser(userId);
    const course = await storage.getCourse(req.params.courseId);
    if (!user || !course) return res.status(404).json({ message: "Not found" });
    const certId = `ZE-${userId.slice(-4).toUpperCase()}-${req.params.courseId.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    res.json({
      studentName: user.userName,
      courseName: course.title,
      category: course.category,
      completedAt: enrollment.enrolledAt,
      certId,
    });
  });

  app.post("/api/courses/:courseId/lectures/:lectureId/complete", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.markLectureComplete(userId, req.params.courseId, req.params.lectureId);
    const modules = await storage.getCourseModules(req.params.courseId);
    const allLectures = (await Promise.all(modules.map(m => storage.getModuleLectures(m.id)))).flat();
    const completed = await storage.getCompletedLectures(userId, req.params.courseId);
    const progress = allLectures.length ? Math.round((completed.length / allLectures.length) * 100) : 0;
    await storage.updateEnrollmentProgress(userId, req.params.courseId, progress);
    res.json({ progress, completed });
  });

  app.get("/api/courses/:courseId/progress", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const completed = await storage.getCompletedLectures(userId, req.params.courseId);
    res.json({ completed });
  });

  // --- COUPONS ---
  app.get("/api/coupons", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (user?.role === "admin") {
      const coupons = await storage.getAllCoupons();
      return res.json({ coupons });
    }
    const coupons = await storage.getActiveCoupons();
    res.json({ coupons });
  });

  app.post("/api/coupons/apply", async (req, res) => {
    const { code, coursePrice } = req.body;
    const coupon = await storage.getCouponByCode(code);
    if (!coupon || !coupon.isActive) return res.status(400).json({ message: "Invalid or expired coupon" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: "Coupon expired" });
    if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) return res.status(400).json({ message: "Coupon usage limit reached" });
    const discount = (coursePrice * coupon.discountPercent) / 100;
    const finalAmount = coursePrice - discount;
    res.json({ couponId: coupon.id, discount, finalAmount, discountPercent: coupon.discountPercent });
  });

  app.post("/api/coupons", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    try {
      const body = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(body);
      res.json({ coupon });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/coupons/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const updated = await storage.updateCoupon(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon: updated });
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    await storage.deleteCoupon(req.params.id);
    res.json({ success: true });
  });

  // --- LEADERBOARD ---
  app.get("/api/leaderboard", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const leaderboard = await storage.getLeaderboard();
    res.json({ leaderboard });
  });

  // --- CHAT ---
  app.get("/api/chat/messages", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if (user.role === "admin") {
      const messages = await storage.getAllChatMessages();
      return res.json({ messages });
    }
    await storage.markChatRead(userId);
    const messages = await storage.getChatMessages(userId);
    res.json({ messages });
  });

  app.get("/api/chat/unread", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const count = await storage.getUnreadCount(userId);
    res.json({ count });
  });

  app.post("/api/chat/messages", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
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
  });

  app.get("/api/chat/students", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const allMessages = await storage.getAllChatMessages();
    const studentMap = new Map<string, { studentId: string; studentName: string; lastMessage: string; lastTime: Date; unread: number }>();
    for (const msg of allMessages) {
      const entry = studentMap.get(msg.studentId);
      const unreadIncr = (!msg.isFromAdmin && !msg.isRead) ? 1 : 0;
      if (!entry || msg.timestamp > entry.lastTime) {
        studentMap.set(msg.studentId, {
          studentId: msg.studentId,
          studentName: msg.studentName,
          lastMessage: msg.content,
          lastTime: msg.timestamp,
          unread: (entry?.unread ?? 0) + unreadIncr,
        });
      } else {
        studentMap.set(msg.studentId, { ...entry, unread: entry.unread + unreadIncr });
      }
    }
    const students = Array.from(studentMap.values()).sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());
    res.json({ students });
  });

  // --- ADMIN STATS ---
  app.get("/api/admin/stats", async (req, res) => {
    const userId = (req.session as any)[SESSION_USER_KEY];
    const user = userId ? await storage.getUser(userId) : null;
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
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
  });

  return httpServer;
}
