import db from '../config/database.js'

const findAll = async () => {
  const sql = 'SELECT * FROM technologies ORDER BY name ASC'
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

const findByProjectId = async (projectId: number) => {
  const sql = `
    SELECT t.* 
    FROM technologies t
    JOIN project_technologies pt ON t.id = pt.technology_id
    WHERE pt.project_id = $1`
  const result = await db.pool.query(sql, [projectId])
  return result.rows ?? []
}

const addOne = async (name: string, iconClass?: string) => {
  const sql = 'INSERT INTO technologies (name, icon_class) VALUES ($1, $2) RETURNING *'
  const result = await db.pool.query(sql, [name, iconClass])
  return result.rows[0]
}

const linkToProject = async (projectId: number, technologyIds: number[]) => {
  // Supprimer les anciens liens pour ce projet
  await db.pool.query('DELETE FROM project_technologies WHERE project_id = $1', [projectId])
  
  if (technologyIds.length === 0) return

  // Insérer les nouveaux liens
  const values = technologyIds.map((_, i) => `($1, $${i + 2})`).join(', ')
  const sql = `INSERT INTO project_technologies (project_id, technology_id) VALUES ${values}`
  await db.pool.query(sql, [projectId, ...technologyIds])
}

export { findAll, findByProjectId, addOne, linkToProject }
