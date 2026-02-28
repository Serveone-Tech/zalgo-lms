import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getProfile, updateProfile, getAllUsers } from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);
router.get("/admin/users", requireAdmin, getAllUsers);

export default router;
