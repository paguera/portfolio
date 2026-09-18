import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import AppError from '../errors/AppError.js'

/**
 * Middleware d'authentification par Cookie HttpOnly
 */
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // 1. On récupère le token directement dans les cookies (merci cookie-parser)
  const token = req.cookies.auth_token

  // 2. Vérifier si le cookie existe
  if (!token) {
    return next(new AppError('Accès refusé : Session expirée ou inexistante', 401))
  }

  // 3. Vérifier le token avec la clé secrète
  jwt.verify(
    token,
    process.env.JWT_SECRET?.trim() as string,
    (err: any, decoded: any) => {
       if (err) {
            // Logge l'erreur JWT spécifique pour le débogage
            console.error("JWT Error during authentication:", err.message);
            return next(new AppError(`Accès refusé : ${err.name || 'Session invalide'}`, 403));
       }
      
      // 4. Stocker les infos de l'utilisateur dans la requête
      ;(req as any).user = decoded

      next()
    }
  )
}

export default authenticate
