import AppError from '../errors/AppError.js'
import type ProjectData from '../types/projects.types.js'
import {
  findOne,
  findAll,
  addOne,
  updateOne,
  removeOne,
  findByCategorySlug,
  linkToProjectLinks,
  updateDisplayOrders
} from '../models/projects.model.js'
import { linkToProject } from '../models/technologies.model.js'

// CRUD
const getOne = async (identifier: number | string): Promise<ProjectData | null> => {
  const p = await findOne(identifier)
  if (!p) throw new AppError('Projet non trouvé', 404)
  return p
}

const getByCategory = async (slug: string, onlyPublished = false): Promise<ProjectData[]> => {
  return await findByCategorySlug(slug, onlyPublished)
}

const getAll = async (onlyPublished = false): Promise<ProjectData[] | null> => {
  return await findAll(onlyPublished)
}

/**
 * Création d'un projet avec ses technos et liens.
 */
const create = async (project: ProjectData) => {
  const newProject = await addOne(project)
  
  if (project.technology_ids && project.technology_ids.length > 0) {
    await linkToProject(newProject.id, project.technology_ids)
  }

  if (project.github_links) {
    await linkToProjectLinks(newProject.id, project.github_links)
  }
  
  return await findOne(newProject.id)
}

/**
 * Mise à jour d'un projet et de ses technos.
 */
const update = async (id: number, project: ProjectData) => {
  const existing = await findOne(id)
  if (!existing) throw new AppError('Projet non trouvé', 404)
  
  await updateOne(id, project)
  
  if (project.technology_ids) {
    await linkToProject(id, project.technology_ids)
  }

  if (project.github_links) {
    await linkToProjectLinks(id, project.github_links)
  }
  
  return await findOne(id)
}

const deleteOne = async (id: number) => {
  const result = await removeOne(id)
  if (!result) throw new AppError('Projet non trouvé', 404)
  return result
}

const reorder = async (items: Array<{ id: number; display_order: number }>) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Liste de réordonnancement invalide', 400)
  }
  return await updateDisplayOrders(items)
}

export { getOne, getAll, getByCategory, create, update, deleteOne, reorder }
