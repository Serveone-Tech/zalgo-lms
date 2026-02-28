import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter";
import { signup, signin, signout, forgotPassword, resetPassword, changePassword, getMe } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);
router.post("/signout", signout);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/change-password", requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

export default router;
