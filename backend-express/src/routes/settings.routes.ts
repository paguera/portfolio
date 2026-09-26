import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settings.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

router.get('/', getSettings)
router.put('/', authenticate, authorize(['admin']), updateSettings)

export default router
