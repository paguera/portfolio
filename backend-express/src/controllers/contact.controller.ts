import sendEmail from '../services/contact.service.js'
import type { Request, Response, NextFunction } from 'express'
import sanitizeHtml from 'sanitize-html'
import AppError from '../errors/AppError.js'
import {
  saveContactMessage,
  findAllMessages,
  getMessageCounts,
  updateMessageStatus,
  deleteMessageById
} from '../models/contact.model.js'

export const contact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sender, object, message, html } = req.body

    if (!name || !sender || !message) {
      throw new AppError('Veuillez remplir tous les champs obligatoires (nom, email, message)', 400)
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sender)) {
      throw new AppError('Adresse email invalide', 400)
    }

    // Sanitize all inputs
    const cleanName = sanitizeHtml(String(name).trim(), { allowedTags: [], allowedAttributes: {} })
    const cleanSender = sanitizeHtml(String(sender).trim(), { allowedTags: [], allowedAttributes: {} })
    const cleanObject = sanitizeHtml(String(object || 'Nouveau message depuis le portfolio').trim(), {
      allowedTags: [],
      allowedAttributes: {}
    })
    const cleanMessage = sanitizeHtml(String(message).trim(), { allowedTags: [], allowedAttributes: {} })
    const cleanHtml = html
      ? sanitizeHtml(String(html), {
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'u', 'span'],
          allowedAttributes: {
            a: ['href', 'target', 'rel'],
            span: ['style']
          }
        })
      : cleanMessage.replace(/\n/g, '<br>')

    // 1. Save in PostgreSQL database
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || ''
    await saveContactMessage({
      name: cleanName,
      email: cleanSender,
      subject: cleanObject,
      message: cleanMessage,
      ip
    })

    // 2. Try sending SMTP email if configured
    try {
      if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        await sendEmail({
          name: cleanName,
          email: process.env.MAIL_TO,
          sender: cleanSender,
          object: cleanObject,
          message: cleanMessage,
          html: cleanHtml
        })
      }
    } catch (mailErr) {
      console.error('Notification email SMTP non envoyée (message toutefois sauvegardé en BDD):', mailErr)
    }

    res.status(200).json({ message: 'Message enregistré et envoyé avec succès' })
  } catch (error) {
    next(error)
  }
}

export const getAdminMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as 'all' | 'unread' | 'archived') || 'all'
    const messages = await findAllMessages(status)
    const counts = await getMessageCounts()
    return res.json({ messages, counts })
  } catch (error) {
    next(error)
  }
}

export const patchAdminMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const { is_read, is_archived } = req.body
    const updated = await updateMessageStatus(id, { is_read, is_archived })
    if (!updated) {
      return res.status(404).json({ message: 'Message non trouvé' })
    }
    return res.json({ message: 'Statut du message mis à jour', data: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteAdminMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const deleted = await deleteMessageById(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Message non trouvé' })
    }
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export default contact
