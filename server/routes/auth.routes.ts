import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { signup, signin, signout, forgotPassword, resetPassword, changePassword, getMe } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

export default router;
