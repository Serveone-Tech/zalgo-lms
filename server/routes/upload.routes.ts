import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";
import { getUploadSignature, deleteVideo } from "../controllers/upload.controller";

const router = Router();

router.get("/signature", requireAdmin, getUploadSignature);
router.delete("/video", requireAdmin, paymentLimiter, deleteVideo);

export default router;
