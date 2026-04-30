import express, { Router } from "express";
import { manageTagAdmin, manageUserAdmin, getUsersAdmin, getReportsAdmin, manageReportAdmin, getStatisticAdmin } from "../Controllers/AdminController.js";
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import upload from "../Middleware/UploadMiddleware.js";

const router = Router()

router.put('/tags/manage', authenticateToken, manageTagAdmin)
router.put('/users/:id/manage', authenticateToken, manageUserAdmin)
router.put('/reports/:id/manage', authenticateToken, manageReportAdmin)

router.get('/reports', authenticateToken, getReportsAdmin)
router.get('/users', authenticateToken, getUsersAdmin)
router.get('/statistics', authenticateToken, getStatisticAdmin);

export default router;