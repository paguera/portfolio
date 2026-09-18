import type { Request, Response, NextFunction } from 'express' // Types pour les objets Request, Response et NextFunction d'Express
import AppError from '../errors/AppError.js' // Importation de la classe AppError pour gérer les erreurs personnalisées

/**
 * Middleware d'autorisation basique.
 *
 * @param {string[]} role - Tableau des rôles autorisés à accéder à cette route.
 * @returns {function} Middleware Express qui vérifie le rôle de l'utilisateur.
 */
const authorize =
  (role: string[]) =>
  (req: Request, res: Response, next: NextFunction): any => {
    // Ici, on pourrait ajouter la logique pour vérifier si l'utilisateur actuel possède un rôle dans `role`.
    // Par exemple :
    // if (!role.includes(req.user.role)) throw new AppError('Accès refusé', 403);
    next() // Passe à la route suivante
  }

export default authorize // Exportation du middleware pour utilisation dans d'autres parties de l'application
