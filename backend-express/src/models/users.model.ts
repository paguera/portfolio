import db from '../config/database.js'

const findUserByEmail = async (email: string) => {
  const sql = `SELECT * FROM users WHERE LOWER(email)=LOWER($1)`
  const result = await db.pool.query(sql, [email])
  return result.rows[0] ?? null
}

export { findUserByEmail }
