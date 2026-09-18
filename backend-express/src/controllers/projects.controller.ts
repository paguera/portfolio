import type { Request, Response } from 'express'
import type ProjectData from '../types/projects.types.js'
import {
  getOne,
  getAll,
  getByCategory,
  create,
  update,
  deleteOne
} from '../services/projects.service.js'

const getAllProjects = async (req: Request, res: Response) => {
  const allProjects = await getAll()
  return res.json(allProjects)
}

const getProjectsByCategory = async (req: Request, res: Response) => {
  const { slug } = req.params
  if (typeof slug !== 'string') {
    return res.status(400).json({ message: 'Slug invalide' })
  }
  const data = await getByCategory(slug)
  return res.json(data)
}

const getOneProject = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const data = await getOne(id)
  if (!data) {
    return res.status(404).json({ message: 'Projet non trouvé' })
  }
  return res.json(data)
}

const createProject = async (req: Request, res: Response) => {
  const p = req.body as ProjectData
  const result = await create(p)
  return res.status(201).json({
    message: 'Project created successfully',
    data: result
  })
}

const updateProject = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const p = req.body as ProjectData

  const data = await update(id, p)
  if (!data) {
    return res.status(404).json({ message: 'Projet non trouvé' })
  }
  return res.json({ message: 'Projet modifié', data })
}

const deleteOneProject = async (req: Request, res: Response) => {
  const id = Number(req.params.id as string)
  const result = await deleteOne(id)
  if (!result) {
    return res.status(404).json({ message: 'Projet non trouvé' })
  }
  return res.status(204).send({ message: 'Projet supprimé' })
}

export {
  getOneProject,
  getAllProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteOneProject
}
