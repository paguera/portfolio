import { Router } from 'express'
import {
  rateTrack,
  getTrackRating,
  getAllTrackRatings,
  getTrackComments,
  postTrackComment,
  getAllTrackCommentsAdmin,
  setTrackCommentApproval,
  removeTrackComment
} from '../controllers/tracks.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

// Public Track Ratings & Comments
router.get('/ratings/all', getAllTrackRatings)
router.get('/:id/ratings', getTrackRating)
router.post('/:id/rate', rateTrack)
router.get('/:id/comments', getTrackComments)
router.post('/:id/comments', postTrackComment)

// Admin Track Comments Moderation
router.get('/admin/comments', authenticate, authorize(['admin']), getAllTrackCommentsAdmin)
router.patch('/admin/comments/:id/approve', authenticate, authorize(['admin']), setTrackCommentApproval)
router.delete('/admin/comments/:id', authenticate, authorize(['admin']), removeTrackComment)

export default router
