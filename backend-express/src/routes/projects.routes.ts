import { Router } from 'express'
import {
  getOneProject,
  getAllProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteOneProject,
  reorderProjects
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
router.get('/slug/:id', getOneProject) // Peut être slug ou id
router.get('/:id', getOneProject) // Accepte id numérique ou slug
router.patch(
  '/reorder',
  authenticate,
  authorize(['admin']),
  reorderProjects
)
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
