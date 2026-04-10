import express, {Router} from 'express';
import { addNewTagRoad, addNewTagVersion, fetchAllTags, fetchTagDetails, handleVote } from '../Controllers/TagController.js';
import upload from '../Middleware/UploadMiddleware.js';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';

const router = Router()

router.post('/tag-roads', authenticateToken, upload.array('images', 3), addNewTagRoad)
router.get('/tag-roads/:id/detail', fetchTagDetails)

router.post('/tag-version', authenticateToken, upload.array('images', 3), addNewTagVersion)
router.post('/tag-version/:id/vote', authenticateToken, handleVote)

router.get('/fetch-all', fetchAllTags)

export default router