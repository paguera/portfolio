import pkg from 'pg'
import dotenv from 'dotenv'
import AppError from '../errors/AppError.js'
import { colorize } from '../utils/Colorize.js'
const { Pool } = pkg

/**
 * Configuration des variables d'environnement.
 */
dotenv.config()
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env

if (!DB_HOST || !DB_USER || !DB_NAME || !DB_PORT) {
  console.error(
    colorize('Missing required environment variables for database connection.')
      .red
  )
  process.exit(1)
}

/**
 * Configuration du pool de connexions PostgreSQL.
 */
const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

// Gestion des erreurs lors de la connexion au pool
const connect = async () => {
  try {
    const client = await pool.connect()
    console.log(
      colorize(
        `Connexion réussie à la base PostgreSQL sur ${DB_HOST} : ${DB_NAME}`
      ).green
    )
    client.release()
  } catch (error) {
    console.error(error)
    throw new AppError('Échec de la connexion au pool PostgreSQL', 500)
  }
}

export default { pool, connect }
