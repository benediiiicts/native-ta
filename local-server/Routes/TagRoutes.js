import express, {Router} from 'express';
import { addNewTagRoad, addNewTagVersion } from '../Controllers/TagController.js';
import upload from '../Middleware/UploadMiddleware.js';

const router = Router()

router.post('/tag-roads', upload.array('images', 5), addNewTagRoad)
router.post('/tag-version', upload.array('images', 5), addNewTagVersion)

export default router