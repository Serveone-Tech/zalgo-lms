import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter";
import { signup, signin, signout, forgotPassword, resetPassword, changePassword, getMe } from "../controllers/auth.controller";
import passport from "../config/passport";
import { isGoogleConfigured } from "../config/passport";
import { SESSION_USER_KEY } from "../config/constants";

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);
router.post("/signout", signout);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/change-password", requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

router.get("/google/status", (_req, res) => {
  res.json({ enabled: isGoogleConfigured });
});

if (isGoogleConfigured) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/sign-in?error=google_failed" }),
    (req, res) => {
      const user = req.user as any;
      if (user) (req.session as any)[SESSION_USER_KEY] = user.id;
      res.redirect(user?.role === "admin" ? "/admin" : "/dashboard");
    }
  );
} else {
  router.get("/google", (_req, res) => res.status(503).json({ message: "Google login not configured." }));
}

export default router;
