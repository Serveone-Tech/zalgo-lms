import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, sql } from "drizzle-orm";
import {
  users,
  courses,
  modules,
  lectures,
  enrollments,
  coupons,
  orders,
  courseProgress,
  chatMessages,
  passwordResetTokens,
} from "@shared/schema";
import type {
  User,
  InsertUser,
  Course,
  InsertCourse,
  Module,
  InsertModule,
  Lecture,
  InsertLecture,
  Enrollment,
  InsertEnrollment,
  Coupon,
  InsertCoupon,
  Order,
  InsertOrder,
  CourseProgress,
} from "@shared/schema";
import type { IStorage } from "./IStorage";
import type { ChatMessage, InsertChatMessage } from "../models/chat.model";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

export class DbStorage implements IStorage {
  constructor() {
    this.seed().catch((err) => console.error("[DbStorage] Seed error:", err));
  }

  private async seed() {
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    if (existing.length > 0) return;

    console.log("[DbStorage] Seeding initial data...");
    const adminId = "admin-001";
    const user1Id = "user-001";
    const user2Id = "user-002";
    const user3Id = "user-003";

    const adminHash = await bcrypt.hash("admin123", 12);
    const userHash = await bcrypt.hash("password123", 12);

    await db.insert(users).values([
      {
        id: adminId,
        userName: "Admin User",
        email: "admin@lms.com",
        password: adminHash,
        role: "admin",
        photoUrl: "",
        description: "LMS Platform Administrator",
      },
      {
        id: user1Id,
        userName: "Rahul Sharma",
        email: "rahul@example.com",
        password: userHash,
        role: "user",
        photoUrl: "",
        description: "Passionate about web development",
      },
      {
        id: user2Id,
        userName: "Priya Patel",
        email: "priya@example.com",
        password: userHash,
        role: "user",
        photoUrl: "",
        description: "Full-stack developer in progress",
      },
      {
        id: user3Id,
        userName: "Amit Kumar",
        email: "amit@example.com",
        password: userHash,
        role: "user",
        photoUrl: "",
        description: "Learning React and Node.js",
      },
    ]);

    const c1 = "course-001",
      c2 = "course-002",
      c3 = "course-003",
      c4 = "course-004";
    await db.insert(courses).values([
      {
        id: c1,
        title: "Complete React & Node.js Bootcamp",
        shortDescription:
          "Master full-stack development with React and Node.js from scratch",
        category: "Web Development",
        price: 1999,
        thumbnail:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
        isPublished: true,
        creatorId: adminId,
      },
      {
        id: c2,
        title: "Python for Data Science & ML",
        shortDescription:
          "Learn Python programming and dive into machine learning fundamentals",
        category: "Data Science",
        price: 2499,
        thumbnail:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
        isPublished: true,
        creatorId: adminId,
      },
      {
        id: c3,
        title: "UI/UX Design Masterclass",
        shortDescription:
          "Learn Figma and design thinking to create stunning user experiences",
        category: "Design",
        price: 1499,
        thumbnail:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
        isPublished: true,
        creatorId: adminId,
      },
      {
        id: c4,
        title: "DevOps & Cloud with AWS",
        shortDescription:
          "From Docker to Kubernetes — master modern DevOps practices",
        category: "DevOps",
        price: 2999,
        thumbnail:
          "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
        isPublished: true,
        creatorId: adminId,
      },
    ]);

    const m1 = "mod-001",
      m2 = "mod-002",
      m3 = "mod-003",
      m4 = "mod-004",
      m5 = "mod-005",
      m6 = "mod-006";
    await db.insert(modules).values([
      { id: m1, courseId: c1, title: "Getting Started with React", order: 0 },
      {
        id: m2,
        courseId: c1,
        title: "Node.js & Express Fundamentals",
        order: 1,
      },
      { id: m3, courseId: c1, title: "Building REST APIs", order: 2 },
      { id: m4, courseId: c2, title: "Python Basics", order: 0 },
      { id: m5, courseId: c2, title: "Data Analysis with Pandas", order: 1 },
      { id: m6, courseId: c3, title: "Design Fundamentals", order: 0 },
    ]);

    await db.insert(lectures).values([
      {
        id: "lec-001",
        moduleId: m1,
        title: "What is React?",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 600,
        order: 0,
      },
      {
        id: "lec-002",
        moduleId: m1,
        title: "JSX & Components",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 900,
        order: 1,
      },
      {
        id: "lec-003",
        moduleId: m1,
        title: "State & Props",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 1200,
        order: 2,
      },
      {
        id: "lec-004",
        moduleId: m2,
        title: "Node.js Introduction",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 720,
        order: 0,
      },
      {
        id: "lec-005",
        moduleId: m2,
        title: "Express.js Setup",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 840,
        order: 1,
      },
      {
        id: "lec-006",
        moduleId: m3,
        title: "REST API Concepts",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 660,
        order: 0,
      },
      {
        id: "lec-007",
        moduleId: m4,
        title: "Python Syntax Basics",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 540,
        order: 0,
      },
      {
        id: "lec-008",
        moduleId: m4,
        title: "Data Types & Variables",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 480,
        order: 1,
      },
      {
        id: "lec-009",
        moduleId: m5,
        title: "Intro to Pandas",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 900,
        order: 0,
      },
      {
        id: "lec-010",
        moduleId: m6,
        title: "Color Theory",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        duration: 600,
        order: 0,
      },
    ]);

    await db.insert(enrollments).values([
      { id: "enroll-001", userId: user1Id, courseId: c1, progress: 65 },
      { id: "enroll-002", userId: user1Id, courseId: c2, progress: 30 },
      { id: "enroll-003", userId: user2Id, courseId: c1, progress: 100 },
      { id: "enroll-004", userId: user2Id, courseId: c3, progress: 45 },
      { id: "enroll-005", userId: user3Id, courseId: c2, progress: 80 },
    ]);

    await db.insert(coupons).values([
      {
        id: "coupon-001",
        code: "WELCOME20",
        title: "Welcome Offer",
        description: "20% off on your first course purchase",
        discountPercent: 20,
        isActive: true,
        usageLimit: 100,
        usedCount: 23,
      },
      {
        id: "coupon-002",
        code: "SUMMER30",
        title: "Summer Sale",
        description: "Flat 30% off - Limited time offer!",
        discountPercent: 30,
        isActive: true,
        usageLimit: 50,
        usedCount: 18,
      },
      {
        id: "coupon-003",
        code: "LEARN50",
        title: "Learning Special",
        description: "50% off for dedicated learners",
        discountPercent: 50,
        isActive: false,
        usageLimit: 20,
        usedCount: 20,
      },
    ]);

    await db.insert(orders).values([
      {
        id: "order-001",
        userId: user1Id,
        courseId: c1,
        amount: 1599,
        couponId: "coupon-001",
        status: "completed",
      },
      {
        id: "order-002",
        userId: user1Id,
        courseId: c2,
        amount: 2499,
        status: "completed",
      },
      {
        id: "order-003",
        userId: user2Id,
        courseId: c1,
        amount: 1399,
        couponId: "coupon-002",
        status: "completed",
      },
      {
        id: "order-004",
        userId: user2Id,
        courseId: c3,
        amount: 1499,
        status: "completed",
      },
      {
        id: "order-005",
        userId: user3Id,
        courseId: c2,
        amount: 1749,
        couponId: "coupon-001",
        status: "completed",
      },
    ]);

    await db.insert(courseProgress).values([
      { id: "prog-001", userId: user1Id, courseId: c1, lectureId: "lec-001" },
      { id: "prog-002", userId: user1Id, courseId: c1, lectureId: "lec-002" },
      { id: "prog-003", userId: user1Id, courseId: c1, lectureId: "lec-003" },
    ]);

    console.log("[DbStorage] Seed complete.");
  }

  async getUser(id: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return row;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return row;
  }
  async createUser(data: InsertUser): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [row] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return row;
  }
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [row] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return row;
  }
  async getAllCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }
  async getPublishedCourses(): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.isPublished, true));
  }
  async getCoursesByCreator(creatorId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.creatorId, creatorId));
  }
  async createCourse(data: InsertCourse): Promise<Course> {
    const [row] = await db
      .insert(courses)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async updateCourse(
    id: string,
    data: Partial<Course>,
  ): Promise<Course | undefined> {
    const [row] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return row;
  }
  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [row] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id))
      .limit(1);
    return row;
  }
  async getCourseModules(courseId: string): Promise<Module[]> {
    return db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.order);
  }
  async createModule(data: InsertModule): Promise<Module> {
    const [row] = await db
      .insert(modules)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async updateModule(
    id: string,
    data: Partial<Module>,
  ): Promise<Module | undefined> {
    const [row] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();
    return row;
  }
  async deleteModule(id: string): Promise<void> {
    await db.delete(lectures).where(eq(lectures.moduleId, id));
    await db.delete(modules).where(eq(modules.id, id));
  }

  async getLecture(id: string): Promise<Lecture | undefined> {
    const [row] = await db
      .select()
      .from(lectures)
      .where(eq(lectures.id, id))
      .limit(1);
    return row;
  }
  async getModuleLectures(moduleId: string): Promise<Lecture[]> {
    return db
      .select()
      .from(lectures)
      .where(eq(lectures.moduleId, moduleId))
      .orderBy(lectures.order);
  }
  async createLecture(data: InsertLecture): Promise<Lecture> {
    const [row] = await db
      .insert(lectures)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async updateLecture(
    id: string,
    data: Partial<Lecture>,
  ): Promise<Lecture | undefined> {
    const [row] = await db
      .update(lectures)
      .set(data)
      .where(eq(lectures.id, id))
      .returning();
    return row;
  }
  async deleteLecture(id: string): Promise<void> {
    await db.delete(lectures).where(eq(lectures.id, id));
  }

  async getEnrollment(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | undefined> {
    const [row] = await db
      .select()
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      )
      .limit(1);
    return row;
  }
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }
  async createEnrollment(data: InsertEnrollment): Promise<Enrollment> {
    const [row] = await db
      .insert(enrollments)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async updateEnrollmentProgress(
    userId: string,
    courseId: string,
    progress: number,
  ): Promise<void> {
    await db
      .update(enrollments)
      .set({ progress })
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      );
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [row] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);
    return row;
  }
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [row] = await db
      .select()
      .from(coupons)
      .where(eq(sql`UPPER(${coupons.code})`, code.toUpperCase()))
      .limit(1);
    return row;
  }
  async getAllCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons);
  }
  async getActiveCoupons(): Promise<Coupon[]> {
    return db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.isActive, true),
          sql`(${coupons.expiresAt} IS NULL OR ${coupons.expiresAt} > NOW())`,
        ),
      );
  }
  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const [row] = await db
      .insert(coupons)
      .values({ ...data, id: randomUUID(), usedCount: 0 })
      .returning();
    return row;
  }
  async updateCoupon(
    id: string,
    data: Partial<Coupon>,
  ): Promise<Coupon | undefined> {
    const [row] = await db
      .update(coupons)
      .set(data)
      .where(eq(coupons.id, id))
      .returning();
    return row;
  }
  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }
  async incrementCouponUsage(id: string): Promise<void> {
    await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.id, id));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return row;
  }
  async getUserOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }
  async createOrder(data: InsertOrder): Promise<Order> {
    const [row] = await db
      .insert(orders)
      .values({ ...data, id: randomUUID() })
      .returning();
    return row;
  }
  async getOrderStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
  }> {
    const [result] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orders.amount}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
      })
      .from(orders);
    return {
      totalRevenue: Number(result.totalRevenue),
      totalOrders: Number(result.totalOrders),
    };
  }

  async markLectureComplete(
    userId: string,
    courseId: string,
    lectureId: string,
  ): Promise<void> {
    const key = `${userId}-${courseId}-${lectureId}`;
    const existing = await db
      .select({ id: courseProgress.id })
      .from(courseProgress)
      .where(eq(courseProgress.id, key))
      .limit(1);
    if (existing.length === 0) {
      await db
        .insert(courseProgress)
        .values({ id: key, userId, courseId, lectureId });
    }
  }
  async getCompletedLectures(
    userId: string,
    courseId: string,
  ): Promise<string[]> {
    const rows = await db
      .select({ lectureId: courseProgress.lectureId })
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.courseId, courseId),
        ),
      );
    return rows.map((r) => r.lectureId);
  }

  async storeResetToken(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    await db
      .insert(passwordResetTokens)
      .values({ email: email.toLowerCase(), code, expiresAt })
      .onConflictDoUpdate({
        target: passwordResetTokens.email,
        set: { code, expiresAt },
      });
  }
  async getResetToken(
    email: string,
  ): Promise<{ code: string; expiresAt: Date } | undefined> {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.email, email.toLowerCase()))
      .limit(1);
    return row;
  }
  async deleteResetToken(email: string): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.email, email.toLowerCase()));
  }

  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    const [r] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    return Number(r.count);
  }
  async getCourseLectureCount(courseId: string): Promise<number> {
    const [r] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lectures)
      .innerJoin(modules, eq(lectures.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
    return Number(r.count);
  }

  async getLeaderboard(): Promise<
    Array<{
      userId: string;
      userName: string;
      totalCompleted: number;
      coursesCompleted: number;
      points: number;
    }>
  > {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "user"));
    return Promise.all(
      allUsers.map(async (u) => {
        const [prog] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(courseProgress)
          .where(eq(courseProgress.userId, u.id));
        const [comp] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(enrollments)
          .where(
            and(
              eq(enrollments.userId, u.id),
              sql`${enrollments.progress} >= 100`,
            ),
          );
        const totalCompleted = Number(prog.count);
        const coursesCompleted = Number(comp.count);
        return {
          userId: u.id,
          userName: u.userName,
          totalCompleted,
          coursesCompleted,
          points: totalCompleted * 10 + coursesCompleted * 100,
        };
      }),
    );
  }

  async getChatMessages(userId?: string): Promise<ChatMessage[]> {
    const rows = userId
      ? await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.studentId, userId))
          .orderBy(chatMessages.timestamp)
      : await db.select().from(chatMessages).orderBy(chatMessages.timestamp);
    return rows.map((r) => ({
      ...r,
      timestamp: r.timestamp!,
      isRead: r.isRead!,
      isFromAdmin: r.isFromAdmin!,
    }));
  }
  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const [row] = await db
      .insert(chatMessages)
      .values({ ...msg, id: randomUUID() })
      .returning();
    return {
      ...row,
      timestamp: row.timestamp!,
      isRead: row.isRead!,
      isFromAdmin: row.isFromAdmin!,
    };
  }
  async getAllChatMessages(): Promise<ChatMessage[]> {
    const rows = await db
      .select()
      .from(chatMessages)
      .orderBy(chatMessages.timestamp);
    return rows.map((r) => ({
      ...r,
      timestamp: r.timestamp!,
      isRead: r.isRead!,
      isFromAdmin: r.isFromAdmin!,
    }));
  }
  async markChatRead(userId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.studentId, userId),
          eq(chatMessages.isFromAdmin, false),
        ),
      );
  }
  async getUnreadCount(userId: string): Promise<number> {
    const [r] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.studentId, userId),
          eq(chatMessages.isFromAdmin, true),
          eq(chatMessages.isRead, false),
        ),
      );
    return Number(r.count);
  }
}
