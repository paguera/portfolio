import { Router, type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import AppError from '../errors/AppError.js'

const router = Router()

// Define and ensure upload folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const randomName = crypto.randomBytes(16).toString('hex')
    cb(null, `${Date.now()}-${randomName}${ext}`)
  }
})

// File filter for allowed image MIME types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/gif'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError('Format de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, AVIF, SVG, GIF', 400))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Max 10 Mo
  }
})

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Le fichier dépasse la taille maximale autorisée (10 Mo)', 400))
          }
          return next(new AppError(`Erreur d'upload: ${err.message}`, 400))
        }
        return next(err)
      }

      if (!req.file) {
        return next(new AppError('Aucun fichier fourni', 400))
      }

      const fileUrl = `/uploads/${req.file.filename}`
      return res.status(201).json({
        message: 'Fichier téléversé avec succès',
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      })
    })
  }
)

export default router
export { uploadsDir }
