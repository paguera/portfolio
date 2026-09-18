import { body, param } from 'express-validator'
import { findCategoryById } from '../models/categories.model.js'

const validateProjects = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Titre requis')
    .isLength({ min: 2, max: 150 }),

  body('description').isString().isLength({ max: 2000 }),

  body('category_id')
    .custom(async value => {
      const exists = await findCategoryById(Number(value))
      if (!exists) {
        throw new Error(`Catégorie avec l'ID ${value} n'existe pas.`)
      }
      return true
    })
    .isInt({ min: 1 })
    .withMessage('category_id doit être un nombre entier positif'),

  body('technology_ids')
    .optional()
    .isArray()
    .withMessage('technology_ids doit être un tableau')
    .custom((value) => {
      if (value && !value.every(Number.isInteger)) {
        throw new Error('Chaque technologie_id doit être un nombre entier');
      }
      return true;
    }),

  body('github_links')
    .optional()
    .isArray()
    .withMessage('github_links doit être un tableau'),
  body('github_links.*.label')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Le libellé du lien est requis'),
  body('github_links.*.url')
    .isURL({ require_protocol: false, require_tld: false })
    .withMessage('L\'URL du lien est invalide'),
  body('demo_url').optional({ checkFalsy: true }).isURL({ require_protocol: false, require_tld: false }).withMessage('URL Démo invalide'),
  body('image_url').isString().trim().notEmpty().withMessage('URL Image invalide')
]

const validateId = param('id')
  .isInt({ min: 1 })
  .withMessage('id doit être un nombre entier positif')

export { validateProjects, validateId }
