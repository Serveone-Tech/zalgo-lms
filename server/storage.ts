import { randomUUID } from "crypto";
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

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCoursesByCreator(creatorId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;

  // Modules
  getModule(id: string): Promise<Module | undefined>;
  getCourseModules(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, data: Partial<Module>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<void>;

  // Lectures
  getLecture(id: string): Promise<Lecture | undefined>;
  getModuleLectures(moduleId: string): Promise<Lecture[]>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  updateLecture(id: string, data: Partial<Lecture>): Promise<Lecture | undefined>;
  deleteLecture(id: string): Promise<void>;

  // Enrollments
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<void>;

  // Coupons
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  getActiveCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<void>;
  incrementCouponUsage(id: string): Promise<void>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderStats(): Promise<{ totalRevenue: number; totalOrders: number }>;

  // Course Progress
  markLectureComplete(userId: string, courseId: string, lectureId: string): Promise<void>;
  getCompletedLectures(userId: string, courseId: string): Promise<string[]>;

  // Password Reset
  storeResetToken(email: string, code: string, expiresAt: Date): Promise<void>;
  getResetToken(email: string): Promise<{ code: string; expiresAt: Date } | undefined>;
  deleteResetToken(email: string): Promise<void>;

  // Course extra stats
  getCourseEnrollmentCount(courseId: string): Promise<number>;
  getCourseLectureCount(courseId: string): Promise<number>;
}

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

  constructor() {
    this.seed();
  }

  private seed() {
    const adminId = "admin-001";
    const user1Id = "user-001";
    const user2Id = "user-002";
    const user3Id = "user-003";

    const admin: User = {
      id: adminId,
      userName: "Admin User",
      email: "admin@lms.com",
      password: "admin123",
      role: "admin",
      photoUrl: "",
      description: "LMS Platform Administrator",
      createdAt: new Date("2024-01-01"),
    };

    const user1: User = {
      id: user1Id,
      userName: "Rahul Sharma",
      email: "rahul@example.com",
      password: "password123",
      role: "user",
      photoUrl: "",
      description: "Passionate about web development",
      createdAt: new Date("2024-02-15"),
    };

    const user2: User = {
      id: user2Id,
      userName: "Priya Patel",
      email: "priya@example.com",
      password: "password123",
      role: "user",
      photoUrl: "",
      description: "Full-stack developer in progress",
      createdAt: new Date("2024-03-10"),
    };

    const user3: User = {
      id: user3Id,
      userName: "Amit Kumar",
      email: "amit@example.com",
      password: "password123",
      role: "user",
      photoUrl: "",
      description: "Learning React and Node.js",
      createdAt: new Date("2024-04-01"),
    };

    this.users.set(adminId, admin);
    this.users.set(user1Id, user1);
    this.users.set(user2Id, user2);
    this.users.set(user3Id, user3);

    const course1Id = "course-001";
    const course2Id = "course-002";
    const course3Id = "course-003";
    const course4Id = "course-004";

    const course1: Course = {
      id: course1Id,
      title: "Complete React & Node.js Bootcamp",
      shortDescription: "Master full-stack development with React and Node.js from scratch",
      category: "Web Development",
      price: 1999,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
      isPublished: true,
      creatorId: adminId,
      createdAt: new Date("2024-01-15"),
    };

    const course2: Course = {
      id: course2Id,
      title: "Python for Data Science & ML",
      shortDescription: "Learn Python programming and dive into machine learning fundamentals",
      category: "Data Science",
      price: 2499,
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
      isPublished: true,
      creatorId: adminId,
      createdAt: new Date("2024-02-01"),
    };

    const course3: Course = {
      id: course3Id,
      title: "UI/UX Design Masterclass",
      shortDescription: "Learn Figma and design thinking to create stunning user experiences",
      category: "Design",
      price: 1499,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
      isPublished: true,
      creatorId: adminId,
      createdAt: new Date("2024-03-01"),
    };

    const course4: Course = {
      id: course4Id,
      title: "DevOps & Cloud with AWS",
      shortDescription: "From Docker to Kubernetes — master modern DevOps practices",
      category: "DevOps",
      price: 2999,
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
      isPublished: true,
      creatorId: adminId,
      createdAt: new Date("2024-04-01"),
    };

    this.courses.set(course1Id, course1);
    this.courses.set(course2Id, course2);
    this.courses.set(course3Id, course3);
    this.courses.set(course4Id, course4);

    const mod1Id = "mod-001";
    const mod2Id = "mod-002";
    const mod3Id = "mod-003";
    const mod4Id = "mod-004";
    const mod5Id = "mod-005";
    const mod6Id = "mod-006";

    const module1: Module = { id: mod1Id, courseId: course1Id, title: "Getting Started with React", order: 0, createdAt: new Date() };
    const module2: Module = { id: mod2Id, courseId: course1Id, title: "Node.js & Express Fundamentals", order: 1, createdAt: new Date() };
    const module3: Module = { id: mod3Id, courseId: course1Id, title: "Building REST APIs", order: 2, createdAt: new Date() };
    const module4: Module = { id: mod4Id, courseId: course2Id, title: "Python Basics", order: 0, createdAt: new Date() };
    const module5: Module = { id: mod5Id, courseId: course2Id, title: "Data Analysis with Pandas", order: 1, createdAt: new Date() };
    const module6: Module = { id: mod6Id, courseId: course3Id, title: "Design Fundamentals", order: 0, createdAt: new Date() };

    [module1, module2, module3, module4, module5, module6].forEach(m => this.modules.set(m.id, m));

    const lec1: Lecture = { id: "lec-001", moduleId: mod1Id, title: "What is React?", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 600, order: 0, createdAt: new Date() };
    const lec2: Lecture = { id: "lec-002", moduleId: mod1Id, title: "JSX & Components", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 900, order: 1, createdAt: new Date() };
    const lec3: Lecture = { id: "lec-003", moduleId: mod1Id, title: "State & Props", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 1200, order: 2, createdAt: new Date() };
    const lec4: Lecture = { id: "lec-004", moduleId: mod2Id, title: "Node.js Introduction", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 720, order: 0, createdAt: new Date() };
    const lec5: Lecture = { id: "lec-005", moduleId: mod2Id, title: "Express.js Setup", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 840, order: 1, createdAt: new Date() };
    const lec6: Lecture = { id: "lec-006", moduleId: mod3Id, title: "REST API Concepts", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 660, order: 0, createdAt: new Date() };
    const lec7: Lecture = { id: "lec-007", moduleId: mod4Id, title: "Python Syntax Basics", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 540, order: 0, createdAt: new Date() };
    const lec8: Lecture = { id: "lec-008", moduleId: mod4Id, title: "Data Types & Variables", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 480, order: 1, createdAt: new Date() };
    const lec9: Lecture = { id: "lec-009", moduleId: mod5Id, title: "Intro to Pandas", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 900, order: 0, createdAt: new Date() };
    const lec10: Lecture = { id: "lec-010", moduleId: mod6Id, title: "Color Theory", videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk", duration: 600, order: 0, createdAt: new Date() };

    [lec1, lec2, lec3, lec4, lec5, lec6, lec7, lec8, lec9, lec10].forEach(l => this.lectures.set(l.id, l));

    const enroll1: Enrollment = { id: "enroll-001", userId: user1Id, courseId: course1Id, progress: 65, enrolledAt: new Date("2024-03-01") };
    const enroll2: Enrollment = { id: "enroll-002", userId: user1Id, courseId: course2Id, progress: 30, enrolledAt: new Date("2024-03-15") };
    const enroll3: Enrollment = { id: "enroll-003", userId: user2Id, courseId: course1Id, progress: 100, enrolledAt: new Date("2024-02-20") };
    const enroll4: Enrollment = { id: "enroll-004", userId: user2Id, courseId: course3Id, progress: 45, enrolledAt: new Date("2024-04-01") };
    const enroll5: Enrollment = { id: "enroll-005", userId: user3Id, courseId: course2Id, progress: 80, enrolledAt: new Date("2024-04-10") };

    [enroll1, enroll2, enroll3, enroll4, enroll5].forEach(e => this.enrollments.set(e.id, e));

    const coupon1: Coupon = {
      id: "coupon-001", code: "WELCOME20", title: "Welcome Offer", description: "20% off on your first course purchase",
      discountPercent: 20, isActive: true, expiresAt: new Date("2026-12-31"), usageLimit: 100, usedCount: 23, createdAt: new Date(),
    };
    const coupon2: Coupon = {
      id: "coupon-002", code: "SUMMER30", title: "Summer Sale", description: "Flat 30% off - Limited time offer!",
      discountPercent: 30, isActive: true, expiresAt: new Date("2026-06-30"), usageLimit: 50, usedCount: 18, createdAt: new Date(),
    };
    const coupon3: Coupon = {
      id: "coupon-003", code: "LEARN50", title: "Learning Special", description: "50% off for dedicated learners",
      discountPercent: 50, isActive: false, expiresAt: new Date("2025-01-01"), usageLimit: 20, usedCount: 20, createdAt: new Date(),
    };

    [coupon1, coupon2, coupon3].forEach(c => this.coupons.set(c.id, c));

    const order1: Order = { id: "order-001", userId: user1Id, courseId: course1Id, amount: 1599, couponId: "coupon-001", status: "completed", createdAt: new Date("2024-03-01") };
    const order2: Order = { id: "order-002", userId: user1Id, courseId: course2Id, amount: 2499, couponId: null, status: "completed", createdAt: new Date("2024-03-15") };
    const order3: Order = { id: "order-003", userId: user2Id, courseId: course1Id, amount: 1399, couponId: "coupon-002", status: "completed", createdAt: new Date("2024-02-20") };
    const order4: Order = { id: "order-004", userId: user2Id, courseId: course3Id, amount: 1499, couponId: null, status: "completed", createdAt: new Date("2024-04-01") };
    const order5: Order = { id: "order-005", userId: user3Id, courseId: course2Id, amount: 1749, couponId: "coupon-001", status: "completed", createdAt: new Date("2024-04-10") };

    [order1, order2, order3, order4, order5].forEach(o => this.orders.set(o.id, o));

    const progress1: CourseProgress = { id: "prog-001", userId: user1Id, courseId: course1Id, lectureId: "lec-001", completedAt: new Date() };
    const progress2: CourseProgress = { id: "prog-002", userId: user1Id, courseId: course1Id, lectureId: "lec-002", completedAt: new Date() };
    const progress3: CourseProgress = { id: "prog-003", userId: user1Id, courseId: course1Id, lectureId: "lec-003", completedAt: new Date() };

    [progress1, progress2, progress3].forEach(p => this.progressRecords.set(p.id, p));
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
  async getAllUsers(): Promise<User[]> { return Array.from(this.users.values()); }

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
  async getUserEnrollments(userId: string) {
    return Array.from(this.enrollments.values()).filter(e => e.userId === userId);
  }
  async createEnrollment(data: InsertEnrollment): Promise<Enrollment> {
    const enrollment: Enrollment = { ...data, id: randomUUID(), progress: data.progress ?? 0, enrolledAt: new Date() };
    this.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }
  async updateEnrollmentProgress(userId: string, courseId: string, progress: number) {
    const enrollment = await this.getEnrollment(userId, courseId);
    if (enrollment) {
      this.enrollments.set(enrollment.id, { ...enrollment, progress });
    }
  }

  async getCoupon(id: string) { return this.coupons.get(id); }
  async getCouponByCode(code: string) { return Array.from(this.coupons.values()).find(c => c.code.toUpperCase() === code.toUpperCase()); }
  async getAllCoupons() { return Array.from(this.coupons.values()); }
  async getActiveCoupons() {
    const now = new Date();
    return Array.from(this.coupons.values()).filter(c =>
      c.isActive && (!c.expiresAt || c.expiresAt > now) && (!c.usageLimit || (c.usedCount ?? 0) < c.usageLimit)
    );
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
    const allOrders = Array.from(this.orders.values());
    return {
      totalRevenue: allOrders.reduce((sum, o) => sum + o.amount, 0),
      totalOrders: allOrders.length,
    };
  }

  async markLectureComplete(userId: string, courseId: string, lectureId: string) {
    const key = `${userId}-${courseId}-${lectureId}`;
    if (!this.progressRecords.has(key)) {
      const progress: CourseProgress = { id: key, userId, courseId, lectureId, completedAt: new Date() };
      this.progressRecords.set(key, progress);
    }
  }
  async getCompletedLectures(userId: string, courseId: string): Promise<string[]> {
    return Array.from(this.progressRecords.values())
      .filter(p => p.userId === userId && p.courseId === courseId)
      .map(p => p.lectureId);
  }

  async storeResetToken(email: string, code: string, expiresAt: Date) {
    this.resetTokens.set(email.toLowerCase(), { code, expiresAt });
  }
  async getResetToken(email: string) { return this.resetTokens.get(email.toLowerCase()); }
  async deleteResetToken(email: string) { this.resetTokens.delete(email.toLowerCase()); }

  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    return Array.from(this.enrollments.values()).filter(e => e.courseId === courseId).length;
  }
  async getCourseLectureCount(courseId: string): Promise<number> {
    const mods = Array.from(this.modules.values()).filter(m => m.courseId === courseId);
    let count = 0;
    for (const m of mods) {
      count += Array.from(this.lectures.values()).filter(l => l.moduleId === m.id).length;
    }
    return count;
  }
}

export const storage = new MemStorage();
