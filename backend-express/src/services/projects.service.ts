import AppError from '../errors/AppError.js'
import type ProjectData from '../types/projects.types.js'
import {
  findOne,
  findAll,
  addOne,
  updateOne,
  removeOne,
  findByCategorySlug,
  linkToProjectLinks
} from '../models/projects.model.js'
import { linkToProject } from '../models/technologies.model.js'

// CRUD
const getOne = async (id: number): Promise<ProjectData | null> => {
  const p = await findOne(id)
  if (!p) throw new AppError('Projet non trouvé', 404)
  return p
}

const getByCategory = async (slug: string): Promise<ProjectData[]> => {
  return await findByCategorySlug(slug)
}

const getAll = async (): Promise<ProjectData[] | null> => {
  return await findAll()
}

/**
 * Création d'un projet avec ses technos.
 */
const create = async (project: ProjectData) => {
  // 1. On crée le projet
  const newProject = await addOne(project)
  
  // 2. Si on a des technos, on crée les liens
  if (project.technology_ids && project.technology_ids.length > 0) {
    await linkToProject(newProject.id, project.technology_ids)
  }

  // 3. Si on a des liens github/dépôt, on les enregistre
  if (project.github_links) {
    await linkToProjectLinks(newProject.id, project.github_links)
  }
  
  // On retourne le projet complet (avec technos et liens) en le relisant
  return await findOne(newProject.id)
}

/**
 * Mise à jour d'un projet et de ses technos.
 */
const update = async (id: number, project: ProjectData) => {
  const existing = await findOne(id)
  if (!existing) throw new AppError('Projet non trouvé', 404)
  
  // 1. Mise à jour des infos de base
  const updatedProject = await updateOne(id, project)
  
  // 2. Mise à jour des liens technos (remplacement total)
  if (project.technology_ids) {
    await linkToProject(id, project.technology_ids)
  }

  // 3. Mise à jour des liens de dépôts (remplacement total)
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

export { getOne, getAll, getByCategory, create, update, deleteOne }
