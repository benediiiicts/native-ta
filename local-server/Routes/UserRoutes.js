import express, { Router } from 'express'
import { userLogin, userRegister, getUserByEmail, fetchUserProfile } from '../Controllers/UserController.js'

const router = Router()

//post
router.post('/login', userLogin)
router.post('/register', userRegister)

//get
router.get('/user/:email', getUserByEmail)
router.get('/:id/profile', fetchUserProfile)

export default router