import express, { Router } from "express";
import { manageTagAdmin } from "../Controllers/AdminController.js";
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import upload from "../Middleware/UploadMiddleware.js";

const router = Router()

router.put('/tags/manage', authenticateToken, manageTagAdmin)

export default router;