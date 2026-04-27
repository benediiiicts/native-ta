import express, { Router } from "express";
import { manageTagAdmin, manageUserAdmin, getUsersAdmin } from "../Controllers/AdminController.js";
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import upload from "../Middleware/UploadMiddleware.js";

const router = Router()

router.put('/tags/manage', authenticateToken, manageTagAdmin)
router.put('/users/:id/manage', authenticateToken, manageUserAdmin)

router.get('/users', authenticateToken, getUsersAdmin)

export default router;