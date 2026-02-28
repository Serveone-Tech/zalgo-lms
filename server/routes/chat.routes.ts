import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getMessages, getUnreadCount, sendMessage, getChatStudents } from "../controllers/chat.controller";

const router = Router();

router.get("/messages", requireAuth, getMessages);
router.get("/unread", requireAuth, getUnreadCount);
router.post("/messages", requireAuth, sendMessage);
router.get("/students", requireAdmin, getChatStudents);

export default router;
