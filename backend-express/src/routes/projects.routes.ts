import { Router } from 'express'
import {
  getOneProject,
  getAllProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteOneProject
} from '../controllers/projects.controller.js'
import {
  validateProjects,
  validateId
} from '../validators/projects.validator.js'
import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'

const router = Router()

router.get('/', getAllProjects)
router.get('/category/:slug', getProjectsByCategory)
router.get('/:id', validateId, validate, getOneProject)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateProjects,
  validate,
  createProject
)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateId,
  validateProjects,
  validate,
  updateProject
)
router.delete(
  '/:id',
  validateId,
  validate,
  authenticate,
  authorize(['admin']),
  deleteOneProject
)
export default router
