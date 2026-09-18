import type { Request, Response, NextFunction } from 'express'
import { findAll, addOne } from '../models/technologies.model.js'

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await findAll()
    return res.json(data)
  } catch (error) {
    next(error)
  }
}

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon_class } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Le nom est requis' })
    }
    const newTech = await addOne(name, icon_class)
    return res.status(201).json(newTech)
  } catch (error) {
    next(error)
  }
}

export { getAll, create }
