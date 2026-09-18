import { Router } from 'express'
import { getAll, create } from '../controllers/technologies.controller.js'
import authenticate from '../middlewares/authenticate.js'

const router = Router()

// Route publique pour récupérer toutes les technologies
router.get('/', getAll)

// Route protégée pour ajouter une technologie
router.post('/', authenticate, create)

export default router
