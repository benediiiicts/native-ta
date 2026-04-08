import express, {Router} from 'express';
import { addNewTagRoad, addNewTagVersion, fetchAllTags } from '../Controllers/TagController.js';
import upload from '../Middleware/UploadMiddleware.js';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';

const router = Router()

router.post('/tag-roads', authenticateToken, upload.array('images', 5), addNewTagRoad)
router.post('/tag-version', authenticateToken, upload.array('images', 5), addNewTagVersion)
router.get('/fetch-all', fetchAllTags)

export default router