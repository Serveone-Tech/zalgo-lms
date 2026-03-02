import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userName: text("user_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  role: text("role").notNull().default("user"),
  photoUrl: text("photo_url").default(""),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  category: text("category").notNull(),
  price: real("price").default(0),
  thumbnail: text("thumbnail"),
  isPublished: boolean("is_published").default(false),
  creatorId: varchar("creator_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: varchar("id", { length: 36 }).primaryKey(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lectures = pgTable("lectures", {
  id: varchar("id", { length: 36 }).primaryKey(),
  moduleId: varchar("module_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  duration: integer("duration").default(0),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  progress: real("progress").default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  discountPercent: real("discount_percent").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  amount: real("amount").notNull(),
  couponId: varchar("coupon_id", { length: 36 }),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseProgress = pgTable("course_progress", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  lectureId: varchar("lecture_id", { length: 36 }).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  studentId: varchar("student_id", { length: 36 }).notNull(),
  studentName: text("student_name").notNull(),
  content: text("content").notNull(),
  isFromAdmin: boolean("is_from_admin").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  email: text("email").primaryKey(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});
export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});
export const insertLectureSchema = createInsertSchema(lectures).omit({
  id: true,
  createdAt: true,
});
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});
export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lectures.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type CourseProgress = typeof courseProgress.$inferSelect;
