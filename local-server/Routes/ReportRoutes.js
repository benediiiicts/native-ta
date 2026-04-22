import express, { Router } from "express";
import { submitReport } from "../Controllers/ReportController.js";
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import upload from "../Middleware/UploadMiddleware.js";

const router = Router()

router.post('/', authenticateToken, upload.array('images', 3), submitReport)

export default router