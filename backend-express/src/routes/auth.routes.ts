import { Router } from 'express'
import { login, logout, getMe } from '../controllers/auth.controller.js'
import validateAuth from '../validators/auth.validator.js'
import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'

const router = Router()

router.post('/login', validateAuth, validate, login)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)

export default router
