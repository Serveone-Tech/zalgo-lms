import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { enroll, getEnrollment, completeLecture, getCourseProgress } from "../controllers/enrollment.controller";

const router = Router();

router.post("/enroll", requireAuth, enroll);
router.get("/courses/:courseId/enrollment", requireAuth, getEnrollment);
router.post("/courses/:courseId/lectures/:lectureId/complete", requireAuth, completeLecture);
router.get("/courses/:courseId/progress", requireAuth, getCourseProgress);

export default router;
