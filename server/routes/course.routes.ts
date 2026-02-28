import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getPublishedCourses, getAdminCourses, getEnrolledCourses, getCourseById, createCourse, updateCourse, deleteCourse, getCourseCertificate } from "../controllers/course.controller";

const router = Router();

router.get("/", getPublishedCourses);
router.get("/admin", requireAdmin, getAdminCourses);
router.get("/enrolled", requireAuth, getEnrolledCourses);
router.get("/:id", getCourseById);
router.post("/", requireAdmin, createCourse);
router.patch("/:id", requireAdmin, updateCourse);
router.delete("/:id", requireAdmin, deleteCourse);
router.get("/:courseId/certificate", requireAuth, getCourseCertificate);

export default router;
