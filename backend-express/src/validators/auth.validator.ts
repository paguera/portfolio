import { body } from 'express-validator'

const validateAuth = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide")
    .isLength({ max: 255 })
    .withMessage("L'email est trop long"),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
  // .isLength({ min: 6 })
  // .withMessage('Le mot de passe doit faire au moins 6 caractères')
  // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  // .withMessage(
  //   'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial')
]

export default validateAuth
