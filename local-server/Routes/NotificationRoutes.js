import { Router } from "express";
import { getNotifications, readNotification, readAllNotifications } from "../Controllers/NotificationController.js";
import { authenticateToken } from "../Middleware/AuthMiddleware.js";

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/read-all', authenticateToken, readAllNotifications);
router.put('/:id/read', authenticateToken, readNotification);

export default router;