import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { getStats } from "../controllers/admin.controller";

const router = Router();

router.get("/stats", requireAdmin, getStats);

export default router;
