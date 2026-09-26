import { Router } from 'express'
import {
  contact,
  getAdminMessages,
  patchAdminMessage,
  deleteAdminMessage
} from '../controllers/contact.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

// Route publique de soumission de message
router.post('/contact', contact)

// Routes protégées pour l'administration
router.get('/contact/messages', authenticate, authorize(['admin']), getAdminMessages)
router.patch('/contact/messages/:id', authenticate, authorize(['admin']), patchAdminMessage)
router.delete('/contact/messages/:id', authenticate, authorize(['admin']), deleteAdminMessage)

export default router
