import express, {Router} from 'express';
import { addNewTagRoad, addNewTagVersion, fetchAllTags, fetchTagDetails } from '../Controllers/TagController.js';
import upload from '../Middleware/UploadMiddleware.js';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';

const router = Router()

router.post('/tag-roads', authenticateToken, upload.array('images', 3), addNewTagRoad)
router.post('/tag-version', authenticateToken, upload.array('images', 3), addNewTagVersion)
router.get('/fetch-all', fetchAllTags)
router.get('/tag-roads/:id/detail', fetchTagDetails)

export default router