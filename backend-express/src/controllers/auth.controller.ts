import type { Request, Response, NextFunction } from 'express'
import { loginUser } from '../services/auth.service.js'

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const token = await loginUser(email, password)
  
  if (!token) return next()

  // Envoi du token dans un cookie sécurisé (HttpOnly)
  res.cookie('auth_token', token, {
    httpOnly: true, // Empêche le JavaScript de lire le cookie (Protection XSS)
    secure: true,   // Requis pour les connexions HTTPS (Cloudflare)
    sameSite: 'none', // Requis pour le partage de cookies cross-domain (Tailscale -> Cloudflare)
    partitioned: true, // Permet de conserver le cookie tiers dans un bac à sable (CHIPS)
    maxAge: 24 * 60 * 60 * 1000 // Expire après 24h (identique au JWT)
  })

  // On renvoie les infos publiques de l'utilisateur mais PLUS le token
  return res.json({ message: 'Login successful' })
}

/**
 * Logout : On supprime le cookie côté serveur
 */
const logout = async (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
  })
  return res.json({ message: 'Logout successful' })
}

/**
 * Me : Retourne les infos de l'utilisateur actuellement connecté
 * (Utilisé par le front au chargement pour vérifier si on a toujours une session valide)
 */
const getMe = async (req: Request, res: Response) => {
  // Les infos de l'utilisateur sont injectées par le middleware "authenticate"
  return res.json({ user: (req as any).user })
}

export { login, logout, getMe }
