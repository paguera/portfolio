import type { Request, Response, NextFunction } from 'express'
import {
  findAllArtworks,
  findArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  updateArtworkOrders,
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
