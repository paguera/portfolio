import AppError from '../errors/AppError.js'
import {
  findCategoryById,
  findAll,
  addCategory,
  deleteCategory
} from '../models/categories.model.js'

const getCategoryById = async (id: number) => {
  const category = await findCategoryById(id)
  if (!category) throw new AppError('Catégorie non trouvée', 404)
  return category
}

const removeCategory = async (id: number) => {
  const categoryExists = await findCategoryById(id)
  if (!categoryExists) throw new AppError('Catégorie non trouvée', 404)

  const deletedCategory = await deleteCategory(id)
  if (!deletedCategory)
    throw new AppError(
      'Erreur Serveur: impossible de supprimer la catégorie',
      500
    )

  return deletedCategory
}

const getAll = async () => {
  const categories = await findAll()
  if (!categories)
    throw new AppError(
      'Erreur serveur lors de la récupération des catégories',
      500
    )
  return categories
}

const createCategory = async (name: string) => {
  const createdCategory = await addCategory(name)
  if (!createdCategory)
    throw new AppError("Erreur d'insertion de catégorie", 500)
  return createdCategory
}

export { getCategoryById, getAll, createCategory, removeCategory }
