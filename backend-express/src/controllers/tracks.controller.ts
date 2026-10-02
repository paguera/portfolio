import type { Request, Response, NextFunction } from 'express'
import {
  upsertTrackRating,
  getTrackRatingStats,
  getAllTrackRatingStats,
  findCommentsByTrackId,
  addCommentToTrack,
  findAllTrackCommentsForAdmin,
  toggleTrackCommentApproval,
  deleteTrackComment
} from '../models/tracks.model.js'

export const rateTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackId = String(req.params.id)
    const { rating, visitor_uuid } = req.body

    const parsedRating = Number(rating)
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'La note doit être un entier compris entre 1 et 5' })
    }

    const visitorUuid = (visitor_uuid && typeof visitor_uuid === 'string')
      ? visitor_uuid.slice(0, 255)
      : (req.ip || 'anonymous')

    const ip = req.ip || ''

    const stats = await upsertTrackRating(trackId, parsedRating, visitorUuid, ip)
    return res.json({ message: 'Note enregistrée avec succès', stats })
  } catch (error) {
    next(error)
  }
}

export const getTrackRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackId = String(req.params.id)
    const stats = await getTrackRatingStats(trackId)
    return res.json(stats)
  } catch (error) {
    next(error)
  }
}

export const getAllTrackRatings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getAllTrackRatingStats()
    return res.json(stats)
  } catch (error) {
    next(error)
  }
}

export const getTrackComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackId = String(req.params.id)
    const comments = await findCommentsByTrackId(trackId, true)
    return res.json(comments)
  } catch (error) {
    next(error)
  }
}

export const postTrackComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackId = String(req.params.id)
    const { author_name, comment, visitor_uuid } = req.body

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Le commentaire ne peut pas être vide' })
    }

    if (comment.length > 2000) {
      return res.status(400).json({ message: 'Le commentaire est trop long (maximum 2000 caractères)' })
    }

    const authorName = (author_name && typeof author_name === 'string') ? author_name : 'Visiteur'
    const visitorUuid = (visitor_uuid && typeof visitor_uuid === 'string') ? visitor_uuid : (req.ip || 'anonymous')
    const ip = req.ip || ''

    const created = await addCommentToTrack(trackId, authorName, comment, visitorUuid, ip)
    return res.status(201).json({ message: 'Commentaire publié avec succès', data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllTrackCommentsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await findAllTrackCommentsForAdmin()
    return res.json(comments)
  } catch (error) {
    next(error)
  }
}

export const setTrackCommentApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const { is_approved } = req.body
    const updated = await toggleTrackCommentApproval(id, Boolean(is_approved))
    if (!updated) {
      return res.status(404).json({ message: 'Commentaire non trouvé' })
    }
    return res.json({ message: 'Statut du commentaire mis à jour', data: updated })
  } catch (error) {
    next(error)
  }
}

export const removeTrackComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const deleted = await deleteTrackComment(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Commentaire non trouvé' })
    }
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
