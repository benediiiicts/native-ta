import express, { Router } from 'express'
import { userLogin, userRegister, getUserByEmail, fetchUserProfile, changeUsername, googleAuth } from '../Controllers/UserController.js'
import { authenticateToken } from '../Middleware/AuthMiddleware.js';

const router = Router()

//post
router.post('/login', userLogin)
router.post('/register', userRegister)
router.post('/google-login', googleAuth);

//get
router.get('/user/:email', getUserByEmail)
router.get('/:id/profile', fetchUserProfile)

//put
router.put('/update-username', authenticateToken, changeUsername)

export default router