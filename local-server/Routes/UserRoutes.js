import express from 'express'
import { Router } from 'express'
import { userLogin, userRegister, getUserByEmail } from '../Controllers/UserController'

const router = Router()

//post
router.post('/login', userLogin)
router.post('/register', userRegister)

//get
router.get('/user/:email', getUserByEmail)

export default router