import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { getCourseModules, createModule, updateModule, deleteModule } from "../controllers/module.controller";

const router = Router();

router.get("/courses/:courseId/modules", getCourseModules);
router.post("/courses/:courseId/modules", requireAdmin, createModule);
router.patch("/modules/:id", requireAdmin, updateModule);
router.delete("/modules/:id", requireAdmin, deleteModule);

export default router;
