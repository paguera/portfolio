import { Router } from 'express'
import {
  getAllArtworks,
  getOneArtwork,
  createNewArtwork,
  updateExistingArtwork,
  deleteExistingArtwork,
  reorderArtworks
} from '../controllers/artworks.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

router.get('/', getAllArtworks)
router.get('/:id', getOneArtwork)
router.patch('/reorder', authenticate, authorize(['admin']), reorderArtworks)
router.post('/', authenticate, authorize(['admin']), createNewArtwork)
router.put('/:id', authenticate, authorize(['admin']), updateExistingArtwork)
router.delete('/:id', authenticate, authorize(['admin']), deleteExistingArtwork)

export default router
