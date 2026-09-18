import { body } from 'express-validator'

const validateContact = [
  body('name')
    .notEmpty()
    .withMessage('Indiquez votre nom')
    .isLength({ min: 2, max: 255 }),
  body('email').isEmail().withMessage("Format d'email invalide"),
  body('message')
    .notEmpty()
    .withMessage('Message nécéssaire')
    .isLength({ min: 20, max: 2000 })
]

export default validateContact
