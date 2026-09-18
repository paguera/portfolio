import db from '../config/database.js'
import AppError from '../errors/AppError.js'

const findCategoryById = async (id: number) => {
  const sql = `SELECT * FROM category WHERE id=$1`
  const result = await db.pool.query(sql, [id])
  return result.rows[0] ?? null
}

const findAll = async () => {
  const sql = `SELECT * FROM category`
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

const addCategory = async (name: string) => {
  const sql = `INSERT INTO category (name) VALUES ($1) RETURNING *`
  const result = await db.pool.query(sql, [name])
  return result.rows[0]
}

const deleteCategory = async (id: number) => {
  const result = await db.pool.query(`DELETE FROM category WHERE id=$1`, [id])
  if (result.rowCount === 0) {
    return null
  }
  return result
}

export { findCategoryById, findAll, addCategory, deleteCategory }
