import express, {Router} from 'express';
import { 
    addNewTagRoad, 
    addNewTagVersion, 
    fetchAllTags, 
    fetchTagDetails, 
    handleVote,
    fetchVersionHistory,
    checkUpdates} from '../Controllers/TagController.js';
import {handleComment, handleLoadComment} from '../Controllers/CommentController.js';
import { authenticateToken, optionalAuth } from '../Middleware/AuthMiddleware.js';
import upload from '../Middleware/UploadMiddleware.js';

const router = Router()

router.post('/tag-roads', authenticateToken, upload.array('images', 3), addNewTagRoad)
router.get('/tag-roads/:id/detail', optionalAuth, fetchTagDetails)

router.post('/tag-version', authenticateToken, upload.array('images', 3), addNewTagVersion)
router.post('/tag-version/:id/vote', authenticateToken, handleVote)
router.post('/tag-version/:id/comment', authenticateToken, upload.array('images', 1), handleComment)
router.get('/tag-version/:id/comment', handleLoadComment)
router.get('/tag-roads/:id/versions', fetchVersionHistory);

router.get('/fetch-all', fetchAllTags)
router.get('/check-updates', fetchUpdatesStatus);

export default router