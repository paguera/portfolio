import { body, param } from 'express-validator'

const validateCategory = [
  body('name')
    .isLength({ min: 2, max: 25 })
    .withMessage(
      'Le nom de catégorie doit être compris entre 2 et 25 caractères.'
    )
]

const validateId = param('id')
  .isInt({ min: 1 })
  .withMessage('id doit être un nombre entier positif')

export { validateCategory, validateId }
