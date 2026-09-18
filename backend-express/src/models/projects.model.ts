import db from '../config/database.js'
import type ProjectData from '../types/projects.types.js'

/**
 * Récupère tous les projets avec leurs technologies associées.
 * On utilise JSON_AGG et JSON_BUILD_OBJECT pour transformer les lignes de la table de jointure
 * en un beau tableau d'objets JSON directement depuis SQL.
 */
const findAll = async () => {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      (SELECT url FROM project_links WHERE project_id = p.id LIMIT 1) AS github_url,
      -- COALESCE gère le cas où un projet n'a aucune techno (retourne [] au lieu de null)
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name, 'icon_class', t.icon_class))
         FROM technologies t
         JOIN project_technologies pt ON t.id = pt.technology_id
         WHERE pt.project_id = p.id),
        '[]'
      ) AS technologies,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', pl.id, 'label', pl.label, 'url', pl.url))
         FROM project_links pl
         WHERE pl.project_id = p.id),
        '[]'
      ) AS github_links
    FROM projects p
    LEFT JOIN category c ON p.category_id = c.id
    ORDER BY p.created_at DESC`
  
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

/**
 * Récupère un projet spécifique par son ID, incluant ses technos.
 */
const findOne = async (id: number) => {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      (SELECT url FROM project_links WHERE project_id = p.id LIMIT 1) AS github_url,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name, 'icon_class', t.icon_class))
         FROM technologies t
         JOIN project_technologies pt ON t.id = pt.technology_id
         WHERE pt.project_id = p.id),
        '[]'
      ) AS technologies,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', pl.id, 'label', pl.label, 'url', pl.url))
         FROM project_links pl
         WHERE pl.project_id = p.id),
        '[]'
      ) AS github_links
    FROM projects p
    LEFT JOIN category c ON p.category_id = c.id
    WHERE p.id = $1`
    
  const result = await db.pool.query(sql, [id])
  return result.rows[0] ?? null
}

const addOne = async (projectData: ProjectData) => {
  const sql = `INSERT INTO projects (title, description, category_id, demo_url, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`
  const result = await db.pool.query(sql, [
    projectData.title,
    projectData.description,
    projectData.category_id,
    projectData.demo_url,
    projectData.image_url
  ])
  return result.rows[0]
}

const updateOne = async (id: number, projectData: ProjectData) => {
  const sql = `UPDATE projects SET title=$1, description=$2, category_id=$3, demo_url=$4, image_url=$5 WHERE id=$6 RETURNING *`
  const result = await db.pool.query(sql, [
    projectData.title,
    projectData.description,
    projectData.category_id,
    projectData.demo_url,
    projectData.image_url,
    id
  ])
  return result.rows[0]
}

const removeOne = async (id: number): Promise<boolean | null> => {
  // Grace à "ON DELETE CASCADE" dans le SQL, supprimer le projet supprimera ses liens technos automatiquement
  const sql = 'DELETE FROM projects WHERE id=$1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}

const findByCategorySlug = async (slug: string) => {
  const sql = `
    SELECT 
      p.*, 
      c.name as category_name,
      (SELECT url FROM project_links WHERE project_id = p.id LIMIT 1) AS github_url,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name, 'icon_class', t.icon_class))
         FROM technologies t
         JOIN project_technologies pt ON t.id = pt.technology_id
         WHERE pt.project_id = p.id),
        '[]'
      ) AS technologies,
      COALESCE(
        (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', pl.id, 'label', pl.label, 'url', pl.url))
         FROM project_links pl
         WHERE pl.project_id = p.id),
        '[]'
      ) AS github_links
    FROM projects p 
    JOIN category c ON p.category_id = c.id 
    WHERE LOWER(c.name) = LOWER($1) 
    ORDER BY p.created_at DESC`
    
  const result = await db.pool.query(sql, [slug])
  return result.rows ?? []
}

const linkToProjectLinks = async (projectId: number, links: Array<{ label: string; url: string }>) => {
  // Remplacement total (suppression puis réinsertion)
  await db.pool.query('DELETE FROM project_links WHERE project_id = $1', [projectId])
  
  if (links && links.length > 0) {
    for (const link of links) {
      if (link.label && link.url) {
        await db.pool.query(
          'INSERT INTO project_links (project_id, label, url) VALUES ($1, $2, $3)',
          [projectId, link.label.trim(), link.url.trim()]
        )
      }
    }
  }
}

export { findAll, findOne, addOne, updateOne, removeOne, findByCategorySlug, linkToProjectLinks }
