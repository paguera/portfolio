import { Router } from 'express'
import {
  getAllArtworks,
  getOneArtwork,
  createNewArtwork,
  updateExistingArtwork,
  deleteExistingArtwork,
  reorderArtworks,
  rateArtwork,
  getArtworkRating,
  getArtworkComments,
  postArtworkComment,
  getAllCommentsAdmin,
  setCommentApprovalStatus,
  deleteComment
} from '../controllers/artworks.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

// Public Artworks
router.get('/', getAllArtworks)
router.get('/:id', getOneArtwork)

// Ratings & Comments (Public)
router.get('/:id/ratings', getArtworkRating)
router.post('/:id/rate', rateArtwork)
router.get('/:id/comments', getArtworkComments)
router.post('/:id/comments', postArtworkComment)

// Admin Artworks & Moderation
router.patch('/reorder', authenticate, authorize(['admin']), reorderArtworks)
router.post('/', authenticate, authorize(['admin']), createNewArtwork)
router.put('/:id', authenticate, authorize(['admin']), updateExistingArtwork)
router.delete('/:id', authenticate, authorize(['admin']), deleteExistingArtwork)

// Admin Comments Moderation
router.get('/admin/comments', authenticate, authorize(['admin']), getAllCommentsAdmin)
router.patch('/admin/comments/:id/approve', authenticate, authorize(['admin']), setCommentApprovalStatus)
router.delete('/admin/comments/:id', authenticate, authorize(['admin']), deleteComment)

export default router

