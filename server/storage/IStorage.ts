import type {
  User, InsertUser,
  Course, InsertCourse,
  Module, InsertModule,
  Lecture, InsertLecture,
  Enrollment, InsertEnrollment,
  Coupon, InsertCoupon,
  Order, InsertOrder,
} from "@shared/schema";
import type { ChatMessage, InsertChatMessage } from "../models/chat.model";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCoursesByCreator(creatorId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;

  getModule(id: string): Promise<Module | undefined>;
  getCourseModules(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, data: Partial<Module>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<void>;

  getLecture(id: string): Promise<Lecture | undefined>;
  getModuleLectures(moduleId: string): Promise<Lecture[]>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  updateLecture(id: string, data: Partial<Lecture>): Promise<Lecture | undefined>;
  deleteLecture(id: string): Promise<void>;

  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<void>;

  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  getActiveCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<void>;
  incrementCouponUsage(id: string): Promise<void>;

  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderStats(): Promise<{ totalRevenue: number; totalOrders: number }>;

  markLectureComplete(userId: string, courseId: string, lectureId: string): Promise<void>;
  getCompletedLectures(userId: string, courseId: string): Promise<string[]>;

  storeResetToken(email: string, code: string, expiresAt: Date): Promise<void>;
  getResetToken(email: string): Promise<{ code: string; expiresAt: Date } | undefined>;
  deleteResetToken(email: string): Promise<void>;

  getCourseEnrollmentCount(courseId: string): Promise<number>;
  getCourseLectureCount(courseId: string): Promise<number>;

  getLeaderboard(): Promise<Array<{ userId: string; userName: string; totalCompleted: number; coursesCompleted: number; points: number }>>;

  getChatMessages(userId?: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  getAllChatMessages(): Promise<ChatMessage[]>;
  markChatRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
