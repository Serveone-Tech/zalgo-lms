import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";
import { enroll, getEnrollment, completeLecture, getCourseProgress } from "../controllers/enrollment.controller";

const router = Router();

router.post("/enroll", requireAuth, paymentLimiter, enroll);
router.get("/courses/:courseId/enrollment", requireAuth, getEnrollment);
router.post("/courses/:courseId/lectures/:lectureId/complete", requireAuth, completeLecture);
router.get("/courses/:courseId/progress", requireAuth, getCourseProgress);

export default router;
