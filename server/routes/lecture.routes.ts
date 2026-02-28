import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { createLecture, updateLecture, deleteLecture } from "../controllers/lecture.controller";

const router = Router();

router.post("/modules/:moduleId/lectures", requireAdmin, createLecture);
router.patch("/lectures/:id", requireAdmin, updateLecture);
router.delete("/lectures/:id", requireAdmin, deleteLecture);

export default router;
