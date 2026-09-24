import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../src/config/database.js'
import { colorize } from '../src/utils/Colorize.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runSeed() {
  try {
    const sqlPath = path.join(__dirname, 'seed_devops_project.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log(colorize('🔄 Exécution du seed DevOps & portfolio_deploy...').cyan)
    await db.pool.query(sql)
    console.log(colorize('✅ Catégorie DevOps et projet portfolio_deploy insérés avec succès !').green)
  } catch (error) {
    console.error(colorize('❌ Erreur lors du seed :').red, error)
  } finally {
    await db.pool.end()
  }
}

runSeed()
