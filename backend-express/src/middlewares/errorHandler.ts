import type { Request, Response, NextFunction } from 'express'
import { colorize } from '../utils/Colorize.js'

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Afficher l'erreur dans la console
  console.error(colorize(`[${err.name || 'Error'}] ${message}`).red)

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message
  })
}

export default errorHandler
