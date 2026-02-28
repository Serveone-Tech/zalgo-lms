import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type {
  User, InsertUser,
  Course, InsertCourse,
  Module, InsertModule,
  Lecture, InsertLecture,
  Enrollment, InsertEnrollment,
  Coupon, InsertCoupon,
  Order, InsertOrder,
  CourseProgress,
} from "@shared/schema";
import type { ChatMessage, InsertChatMessage } from "../models/chat.model";
import type { IStorage } from "./IStorage";

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private courses = new Map<string, Course>();
  private modules = new Map<string, Module>();
  private lectures = new Map<string, Lecture>();
  private enrollments = new Map<string, Enrollment>();
  private coupons = new Map<string, Coupon>();
  private orders = new Map<string, Order>();
  private progressRecords = new Map<string, CourseProgress>();
  private resetTokens = new Map<string, { code: string; expiresAt: Date }>();
  private chatMessages = new Map<string, ChatMessage>();

  constructor() {
    this.seed();
  }

  private seed() {
    const adminId = "admin-001";
    const user1Id = "user-001";
    const user2Id = "user-002";
    const user3Id = "user-003";

    const adminHash = bcrypt.hashSync("admin123", 12);
    const userHash = bcrypt.hashSync("password123", 12);

    this.users.set(adminId, { id: adminId, userName: "Admin User", email: "admin@lms.com", password: adminHash, role: "admin", photoUrl: "", description: "LMS Platform Administrator", createdAt: new Date("2024-01-01") });
    this.users.set(user1Id, { id: user1Id, userName: "Rahul Sharma", email: "rahul@example.com", password: userHash, role: "user", photoUrl: "", description: "Passionate about web development", createdAt: new Date("2024-02-15") });
    this.users.set(user2Id, { id: user2Id, userName: "Priya Patel", email: "priya@example.com", password: userHash, role: "user", photoUrl: "", description: "Full-stack developer in progress", createdAt: new Date("2024-03-10") });
    this.users.set(user3Id, { id: user3Id, userName: "Amit Kumar", email: "amit@example.com", password: userHash, role: "user", photoUrl: "", description: "Learning React and Node.js", createdAt: new Date("2024-04-01") });

    const c1 = "course-001", c2 = "course-002", c3 = "course-003", c4 = "course-004";
    this.courses.set(c1, { id: c1, title: "Complete React & Node.js Bootcamp", shortDescription: "Master full-stack development with React and Node.js from scratch", category: "Web Development", price: 1999, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop", isPublished: true, creatorId: adminId, createdAt: new Date("2024-01-15") });
    this.courses.set(c2, { id: c2, title: "Python for Data Science & ML", shortDescription: "Learn Python programming and dive into machine learning fundamentals", category: "Data Science", price: 2499, thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop", isPublished: true, creatorId: adminId, createdAt: new Date("2024-02-01") });
    this.courses.set(c3, { id: c3, title: "UI/UX Design Masterclass", shortDescription: "Learn Figma and design thinking to create stunning user experiences", category: "Design", price: 1499, thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop", isPublished: true, creatorId: adminId, createdAt: new Date("2024-03-01") });
    this.courses.set(c4, { id: c4, title: "DevOps & Cloud with AWS", shortDescription: "From Docker to Kubernetes — master modern DevOps practices", category: "DevOps", price: 2999, thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop", isPublished: true, creatorId: adminId, createdAt: new Date("2024-04-01") });

    const m1 = "mod-001", m2 = "mod-002", m3 = "mod-003", m4 = "mod-004", m5 = "mod-005", m6 = "mod-006";
    [
      { id: m1, courseId: c1, title: "Getting Started with React", order: 0 },
      { id: m2, courseId: c1, title: "Node.js & Express Fundamentals", order: 1 },
      { id: m3, courseId: c1, title: "Building REST APIs", order: 2 },
      { id: m4, courseId: c2, title: "Python Basics", order: 0 },
      { id: m5, courseId: c2, title: "Data Analysis with Pandas", order: 1 },
      { id: m6, courseId: c3, title: "Design Fundamentals", order: 0 },
    ].forEach(m => this.modules.set(m.id, { ...m, createdAt: new Date() }));

    [
      { id: "lec-001", moduleId: m1, title: "What is React?", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 600, order: 0 },
      { id: "lec-002", moduleId: m1, title: "JSX & Components", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 900, order: 1 },
      { id: "lec-003", moduleId: m1, title: "State & Props", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 1200, order: 2 },
      { id: "lec-004", moduleId: m2, title: "Node.js Introduction", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 720, order: 0 },
      { id: "lec-005", moduleId: m2, title: "Express.js Setup", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 840, order: 1 },
      { id: "lec-006", moduleId: m3, title: "REST API Concepts", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 660, order: 0 },
      { id: "lec-007", moduleId: m4, title: "Python Syntax Basics", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 540, order: 0 },
      { id: "lec-008", moduleId: m4, title: "Data Types & Variables", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 480, order: 1 },
      { id: "lec-009", moduleId: m5, title: "Intro to Pandas", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 900, order: 0 },
      { id: "lec-010", moduleId: m6, title: "Color Theory", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 600, order: 0 },
    ].forEach(l => this.lectures.set(l.id, { ...l, createdAt: new Date() }));

    [
      { id: "enroll-001", userId: user1Id, courseId: c1, progress: 65, enrolledAt: new Date("2024-03-01") },
      { id: "enroll-002", userId: user1Id, courseId: c2, progress: 30, enrolledAt: new Date("2024-03-15") },
      { id: "enroll-003", userId: user2Id, courseId: c1, progress: 100, enrolledAt: new Date("2024-02-20") },
      { id: "enroll-004", userId: user2Id, courseId: c3, progress: 45, enrolledAt: new Date("2024-04-01") },
      { id: "enroll-005", userId: user3Id, courseId: c2, progress: 80, enrolledAt: new Date("2024-04-10") },
    ].forEach(e => this.enrollments.set(e.id, e));

    [
      { id: "coupon-001", code: "WELCOME20", title: "Welcome Offer", description: "20% off on your first course purchase", discountPercent: 20, isActive: true, expiresAt: new Date("2026-12-31"), usageLimit: 100, usedCount: 23, createdAt: new Date() },
      { id: "coupon-002", code: "SUMMER30", title: "Summer Sale", description: "Flat 30% off - Limited time offer!", discountPercent: 30, isActive: true, expiresAt: new Date("2026-06-30"), usageLimit: 50, usedCount: 18, createdAt: new Date() },
      { id: "coupon-003", code: "LEARN50", title: "Learning Special", description: "50% off for dedicated learners", discountPercent: 50, isActive: false, expiresAt: new Date("2025-01-01"), usageLimit: 20, usedCount: 20, createdAt: new Date() },
    ].forEach(c => this.coupons.set(c.id, c));

    [
      { id: "order-001", userId: user1Id, courseId: c1, amount: 1599, couponId: "coupon-001", status: "completed", createdAt: new Date("2024-03-01") },
      { id: "order-002", userId: user1Id, courseId: c2, amount: 2499, couponId: null, status: "completed", createdAt: new Date("2024-03-15") },
      { id: "order-003", userId: user2Id, courseId: c1, amount: 1399, couponId: "coupon-002", status: "completed", createdAt: new Date("2024-02-20") },
      { id: "order-004", userId: user2Id, courseId: c3, amount: 1499, couponId: null, status: "completed", createdAt: new Date("2024-04-01") },
      { id: "order-005", userId: user3Id, courseId: c2, amount: 1749, couponId: "coupon-001", status: "completed", createdAt: new Date("2024-04-10") },
    ].forEach(o => this.orders.set(o.id, o as Order));

    [
      { id: "chat-001", studentId: user1Id, studentName: "Rahul Sharma", content: "Sir, React hooks mein useEffect aur useLayoutEffect ka kya difference hai?", isFromAdmin: false, timestamp: new Date("2024-03-10T10:00:00"), isRead: true },
      { id: "chat-002", studentId: user1Id, studentName: "Admin User", content: "Great question! useEffect runs after paint (asynchronous), while useLayoutEffect runs before paint (synchronous). Use useLayoutEffect when you need to measure DOM elements.", isFromAdmin: true, timestamp: new Date("2024-03-10T10:30:00"), isRead: true },
      { id: "chat-003", studentId: user2Id, studentName: "Priya Patel", content: "Node.js module system samajh nahi aa raha - CommonJS vs ES Modules?", isFromAdmin: false, timestamp: new Date("2024-03-11T14:00:00"), isRead: true },
      { id: "chat-004", studentId: user2Id, studentName: "Admin User", content: "CommonJS uses require() and module.exports (older style). ES Modules use import/export (modern standard). Node.js now supports both. For new projects, prefer ES Modules!", isFromAdmin: true, timestamp: new Date("2024-03-11T14:45:00"), isRead: true },
    ].forEach(c => this.chatMessages.set(c.id, c));

    [
      { id: "prog-001", userId: user1Id, courseId: c1, lectureId: "lec-001", completedAt: new Date() },
      { id: "prog-002", userId: user1Id, courseId: c1, lectureId: "lec-002", completedAt: new Date() },
      { id: "prog-003", userId: user1Id, courseId: c1, lectureId: "lec-003", completedAt: new Date() },
    ].forEach(p => this.progressRecords.set(p.id, p));
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByEmail(email: string) { return Array.from(this.users.values()).find(u => u.email === email); }
  async createUser(data: InsertUser): Promise<User> {
    const user: User = { ...data, id: randomUUID(), photoUrl: data.photoUrl ?? "", description: data.description ?? "", createdAt: new Date() };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id: string, data: Partial<User>) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }
  async getAllUsers() { return Array.from(this.users.values()); }

  async getCourse(id: string) { return this.courses.get(id); }
  async getAllCourses() { return Array.from(this.courses.values()); }
  async getPublishedCourses() { return Array.from(this.courses.values()).filter(c => c.isPublished); }
  async getCoursesByCreator(creatorId: string) { return Array.from(this.courses.values()).filter(c => c.creatorId === creatorId); }
  async createCourse(data: InsertCourse): Promise<Course> {
    const course: Course = { ...data, id: randomUUID(), isPublished: data.isPublished ?? false, price: data.price ?? 0, thumbnail: data.thumbnail ?? null, shortDescription: data.shortDescription ?? null, createdAt: new Date() };
    this.courses.set(course.id, course);
    return course;
  }
  async updateCourse(id: string, data: Partial<Course>) {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updated = { ...course, ...data };
    this.courses.set(id, updated);
    return updated;
  }
  async deleteCourse(id: string) { this.courses.delete(id); }

  async getModule(id: string) { return this.modules.get(id); }
  async getCourseModules(courseId: string) { return Array.from(this.modules.values()).filter(m => m.courseId === courseId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); }
  async createModule(data: InsertModule): Promise<Module> {
    const module: Module = { ...data, id: randomUUID(), order: data.order ?? 0, createdAt: new Date() };
    this.modules.set(module.id, module);
    return module;
  }
  async updateModule(id: string, data: Partial<Module>) {
    const module = this.modules.get(id);
    if (!module) return undefined;
    const updated = { ...module, ...data };
    this.modules.set(id, updated);
    return updated;
  }
  async deleteModule(id: string) {
    this.modules.delete(id);
    Array.from(this.lectures.values()).filter(l => l.moduleId === id).forEach(l => this.lectures.delete(l.id));
  }

  async getLecture(id: string) { return this.lectures.get(id); }
  async getModuleLectures(moduleId: string) { return Array.from(this.lectures.values()).filter(l => l.moduleId === moduleId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); }
  async createLecture(data: InsertLecture): Promise<Lecture> {
    const lecture: Lecture = { ...data, id: randomUUID(), videoUrl: data.videoUrl ?? null, duration: data.duration ?? 0, order: data.order ?? 0, createdAt: new Date() };
    this.lectures.set(lecture.id, lecture);
    return lecture;
  }
  async updateLecture(id: string, data: Partial<Lecture>) {
    const lecture = this.lectures.get(id);
    if (!lecture) return undefined;
    const updated = { ...lecture, ...data };
    this.lectures.set(id, updated);
    return updated;
  }
  async deleteLecture(id: string) { this.lectures.delete(id); }

  async getEnrollment(userId: string, courseId: string) {
    return Array.from(this.enrollments.values()).find(e => e.userId === userId && e.courseId === courseId);
  }
  async getUserEnrollments(userId: string) { return Array.from(this.enrollments.values()).filter(e => e.userId === userId); }
  async createEnrollment(data: InsertEnrollment): Promise<Enrollment> {
    const enrollment: Enrollment = { ...data, id: randomUUID(), progress: data.progress ?? 0, enrolledAt: new Date() };
    this.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }
  async updateEnrollmentProgress(userId: string, courseId: string, progress: number) {
    const enrollment = await this.getEnrollment(userId, courseId);
    if (enrollment) this.enrollments.set(enrollment.id, { ...enrollment, progress });
  }

  async getCoupon(id: string) { return this.coupons.get(id); }
  async getCouponByCode(code: string) { return Array.from(this.coupons.values()).find(c => c.code.toUpperCase() === code.toUpperCase()); }
  async getAllCoupons() { return Array.from(this.coupons.values()); }
  async getActiveCoupons() {
    const now = new Date();
    return Array.from(this.coupons.values()).filter(c => c.isActive && (!c.expiresAt || c.expiresAt > now) && (!c.usageLimit || (c.usedCount ?? 0) < c.usageLimit));
  }
  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const coupon: Coupon = { ...data, id: randomUUID(), usedCount: 0, isActive: data.isActive ?? true, expiresAt: data.expiresAt ?? null, usageLimit: data.usageLimit ?? null, description: data.description ?? null, createdAt: new Date() };
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }
  async updateCoupon(id: string, data: Partial<Coupon>) {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;
    const updated = { ...coupon, ...data };
    this.coupons.set(id, updated);
    return updated;
  }
  async deleteCoupon(id: string) { this.coupons.delete(id); }
  async incrementCouponUsage(id: string) {
    const coupon = this.coupons.get(id);
    if (coupon) this.coupons.set(id, { ...coupon, usedCount: (coupon.usedCount ?? 0) + 1 });
  }

  async getOrder(id: string) { return this.orders.get(id); }
  async getUserOrders(userId: string) { return Array.from(this.orders.values()).filter(o => o.userId === userId); }
  async createOrder(data: InsertOrder): Promise<Order> {
    const order: Order = { ...data, id: randomUUID(), couponId: data.couponId ?? null, status: data.status ?? "completed", createdAt: new Date() };
    this.orders.set(order.id, order);
    return order;
  }
  async getOrderStats() {
    const all = Array.from(this.orders.values());
    return { totalRevenue: all.reduce((s, o) => s + o.amount, 0), totalOrders: all.length };
  }

  async markLectureComplete(userId: string, courseId: string, lectureId: string) {
    const key = `${userId}-${courseId}-${lectureId}`;
    if (!this.progressRecords.has(key)) {
      this.progressRecords.set(key, { id: key, userId, courseId, lectureId, completedAt: new Date() });
    }
  }
  async getCompletedLectures(userId: string, courseId: string): Promise<string[]> {
    return Array.from(this.progressRecords.values()).filter(p => p.userId === userId && p.courseId === courseId).map(p => p.lectureId);
  }

  async storeResetToken(email: string, code: string, expiresAt: Date) { this.resetTokens.set(email.toLowerCase(), { code, expiresAt }); }
  async getResetToken(email: string) { return this.resetTokens.get(email.toLowerCase()); }
  async deleteResetToken(email: string) { this.resetTokens.delete(email.toLowerCase()); }

  async getCourseEnrollmentCount(courseId: string) { return Array.from(this.enrollments.values()).filter(e => e.courseId === courseId).length; }
  async getCourseLectureCount(courseId: string) {
    const mods = Array.from(this.modules.values()).filter(m => m.courseId === courseId);
    return mods.reduce((count, m) => count + Array.from(this.lectures.values()).filter(l => l.moduleId === m.id).length, 0);
  }

  async getLeaderboard() {
    const users = Array.from(this.users.values()).filter(u => u.role === "user");
    return Promise.all(users.map(async u => {
      const completedRecs = Array.from(this.progressRecords.values()).filter(p => p.userId === u.id);
      const totalCompleted = completedRecs.length;
      const enrollments = Array.from(this.enrollments.values()).filter(e => e.userId === u.id);
      const coursesCompleted = enrollments.filter(e => (e.progress ?? 0) >= 100).length;
      const points = totalCompleted * 10 + coursesCompleted * 100;
      return { userId: u.id, userName: u.userName, totalCompleted, coursesCompleted, points };
    }));
  }

  async getChatMessages(userId?: string): Promise<ChatMessage[]> {
    const all = Array.from(this.chatMessages.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return userId ? all.filter(m => m.studentId === userId) : all;
  }
  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = { ...msg, id: randomUUID(), timestamp: new Date(), isRead: false };
    this.chatMessages.set(message.id, message);
    return message;
  }
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  async markChatRead(userId: string) {
    Array.from(this.chatMessages.values()).filter(m => m.studentId === userId && !m.isFromAdmin).forEach(m => {
      this.chatMessages.set(m.id, { ...m, isRead: true });
    });
  }
  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.chatMessages.values()).filter(m => m.studentId === userId && m.isFromAdmin && !m.isRead).length;
  }
}
