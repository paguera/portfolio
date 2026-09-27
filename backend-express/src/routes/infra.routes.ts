import { Router } from 'express'
import * as infraController from '../controllers/infra.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

// Routes réservées à l'administrateur
router.get('/telemetry', authenticate, authorize(['admin']), infraController.getTelemetry)
router.get('/health', authenticate, authorize(['admin']), infraController.getServicesHealth)

export default router
