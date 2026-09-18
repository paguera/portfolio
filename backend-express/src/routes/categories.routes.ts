import { Router } from 'express'
import * as categoriesController from '../controllers/categories.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import {
  validateCategory,
  validateId
} from '../validators/categories.validator.js'
import validate from '../middlewares/validate.js'
const router = Router()

router.get('/', categoriesController.sendAllCategories)
router.get('/:id', validateId, validate, categoriesController.sendOneCategory)
router.post(
  '/',
  validateCategory,
  validate,
  authenticate,
  authorize(['admin']),
  categoriesController.createOneCategory
)
router.delete(
  '/:id',
  validateId,
  validate,
  authenticate,
  authorize(['admin']),
  categoriesController.removeOneCategory
)
export default router
