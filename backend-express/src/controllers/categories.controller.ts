import type { Request, Response } from 'express'
import {
  getCategoryById,
  getAll,
  createCategory,
  removeCategory
} from '../services/categories.service.js'

const sendOneCategory = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const category = await getCategoryById(Number(id))
  return res.status(200).send(category)
}

const sendAllCategories = async (req: Request, res: Response) => {
  const categories = await getAll()
  return res.status(200).send(categories)
}

const createOneCategory = async (req: Request, res: Response) => {
  const c = req.body as { name: string }
  const result = await createCategory(c.name)
  return res.status(201).send({ message: 'Catégorie ajoutée', data: result })
}

const removeOneCategory = async (req: Request, res: Response) => {
  const { id } = req.params
  const deleted = await removeCategory(Number(id))
  if (!deleted)
    return res.status(500).send({
      message:
        "Une erreur s'est produite lors de la suppression de cette catégorie: ID=" +
        id
    })
  return res.status(204).send({ message: 'Catégorie supprimée !' })
}

export {
  sendOneCategory,
  sendAllCategories,
  createOneCategory,
  removeOneCategory
}
