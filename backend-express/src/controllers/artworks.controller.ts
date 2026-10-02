import type { Request, Response, NextFunction } from 'express'
import {
  findAllArtworks,
  findArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  updateArtworkOrders,
  upsertArtworkRating,
  getArtworkRatingStats,
  findCommentsByArtworkId,
  addCommentToArtwork,
  findAllCommentsForAdmin,
  toggleCommentApproval,
  deleteArtworkComment,
  type ArtworkData
} from '../models/artworks.model.js'

export const getAllArtworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user
    const onlyPublished = req.query.all !== 'true' && (!user || user.role !== 'admin')
    const artworks = await findAllArtworks(onlyPublished)
    return res.json(artworks)
  } catch (error) {
    next(error)
  }
}

export const getOneArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const artwork = await findArtworkById(id)
    if (!artwork) {
      return res.status(404).json({ message: 'Œuvre non trouvée' })
    }
    return res.json(artwork)
  } catch (error) {
    next(error)
  }
}

export const createNewArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as ArtworkData
    if (!data.title || !data.image_url) {
      return res.status(400).json({ message: 'Le titre et l\'image sont requis' })
    }
    const newArtwork = await createArtwork(data)
    return res.status(201).json({ message: 'Œuvre créée avec succès', data: newArtwork })
  } catch (error) {
    next(error)
  }
}

export const updateExistingArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const data = req.body as ArtworkData
    const updated = await updateArtwork(id, data)
    if (!updated) {
      return res.status(404).json({ message: 'Œuvre non trouvée' })
    }
    return res.json({ message: 'Œuvre mise à jour avec succès', data: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteExistingArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const deleted = await deleteArtwork(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Œuvre non trouvée' })
    }
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const reorderArtworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Liste de réordonnancement invalide' })
    }
    await updateArtworkOrders(items)
    return res.json({ message: 'Ordre des œuvres mis à jour avec succès' })
  } catch (error) {
    next(error)
  }
}

// -----------------------------------------------------------------------------
// NOTATIONS (RATINGS)
// -----------------------------------------------------------------------------
export const rateArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artworkId = Number(req.params.id)
    const { rating, visitor_uuid } = req.body

    const parsedRating = Number(rating)
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'La note doit être un entier compris entre 1 et 5' })
    }

    const visitorUuid = (visitor_uuid && typeof visitor_uuid === 'string') 
      ? visitor_uuid.slice(0, 255) 
      : (req.ip || 'anonymous')

    const ip = req.ip || ''

    const stats = await upsertArtworkRating(artworkId, parsedRating, visitorUuid, ip)
    return res.json({ message: 'Note enregistrée avec succès', stats })
  } catch (error) {
    next(error)
  }
}

export const getArtworkRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artworkId = Number(req.params.id)
    const stats = await getArtworkRatingStats(artworkId)
    return res.json(stats)
  } catch (error) {
    next(error)
  }
}

// -----------------------------------------------------------------------------
// COMMENTAIRES (COMMENTS)
// -----------------------------------------------------------------------------
export const getArtworkComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artworkId = Number(req.params.id)
    const comments = await findCommentsByArtworkId(artworkId, true)
    return res.json(comments)
  } catch (error) {
    next(error)
  }
}

export const postArtworkComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artworkId = Number(req.params.id)
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

    const created = await addCommentToArtwork(artworkId, authorName, comment, visitorUuid, ip)
    return res.status(201).json({ message: 'Commentaire publié avec succès', data: created })
  } catch (error) {
    next(error)
  }
}

export const getAllCommentsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await findAllCommentsForAdmin()
    return res.json(comments)
  } catch (error) {
    next(error)
  }
}

export const setCommentApprovalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const { is_approved } = req.body
    const updated = await toggleCommentApproval(id, Boolean(is_approved))
    if (!updated) {
      return res.status(404).json({ message: 'Commentaire non trouvé' })
    }
    return res.json({ message: 'Statut du commentaire mis à jour', data: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const deleted = await deleteArtworkComment(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Commentaire non trouvé' })
    }
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

