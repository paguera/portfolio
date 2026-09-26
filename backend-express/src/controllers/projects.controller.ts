import type { Request, Response, NextFunction } from 'express'
import type ProjectData from '../types/projects.types.js'
import {
  getOne,
  getAll,
  getByCategory,
  create,
  update,
  deleteOne,
  reorder
} from '../services/projects.service.js'

const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user
    const onlyPublished = req.query.all !== 'true' && (!user || user.role !== 'admin')
    const allProjects = await getAll(onlyPublished)
    return res.json(allProjects)
  } catch (error) {
    next(error)
  }
}

const getProjectsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Slug invalide' })
    }
    const user = (req as any).user
    const onlyPublished = req.query.all !== 'true' && (!user || user.role !== 'admin')
    const data = await getByCategory(slug, onlyPublished)
    return res.json(data)
  } catch (error) {
    next(error)
  }
}

const getOneProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identifier = req.params.id as string
    if (!identifier) {
      return res.status(400).json({ message: 'Identifiant manquant' })
    }
    const data = await getOne(identifier)
    if (!data) {
      return res.status(404).json({ message: 'Projet non trouvé' })
    }
    return res.json(data)
  } catch (error) {
    next(error)
  }
}


const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = req.body as ProjectData
    const result = await create(p)
    return res.status(201).json({
      message: 'Projet créé avec succès',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const p = req.body as ProjectData
    const data = await update(id, p)
    if (!data) {
      return res.status(404).json({ message: 'Projet non trouvé' })
    }
    return res.json({ message: 'Projet modifié avec succès', data })
  } catch (error) {
    next(error)
  }
}

const deleteOneProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id as string)
    const result = await deleteOne(id)
    if (!result) {
      return res.status(404).json({ message: 'Projet non trouvé' })
    }
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

const reorderProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body
    await reorder(items)
    return res.json({ message: 'Ordre des projets mis à jour avec succès' })
  } catch (error) {
    next(error)
  }
}

export {
  getOneProject,
  getAllProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteOneProject,
  reorderProjects
}
