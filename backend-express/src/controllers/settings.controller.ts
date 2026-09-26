import type { Request, Response, NextFunction } from 'express'
import {
  getSiteSettings,
  updateBulkSiteSettings
} from '../models/settings.model.js'

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getSiteSettings()
    return res.json(settings)
  } catch (error) {
    next(error)
  }
}

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body as Record<string, string>
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Données de paramètres invalides' })
    }
    const updated = await updateBulkSiteSettings(settings)
    return res.json({ message: 'Paramètres mis à jour avec succès', data: updated })
  } catch (error) {
    next(error)
  }
}
