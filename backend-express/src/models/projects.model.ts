import db from '../config/database.js'
import type ProjectData from '../types/projects.types.js'
import { slugify } from '../utils/slugify.js'

/**
 * Récupère tous les projets avec leurs technologies et liens associés.
 * Permet de filtrer uniquement les projets publiés si demandé (visiteurs).
 */
const findAll = async (onlyPublished = false) => {
  const whereClause = onlyPublished ? 'WHERE p.is_published = true' : ''
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
    ${whereClause}
    ORDER BY p.display_order ASC, p.created_at DESC`
  
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

/**
 * Récupère un projet spécifique par son ID ou son slug, incluant ses technos et liens.
 */
const findOne = async (identifier: number | string) => {
  const isNumeric = typeof identifier === 'number' || /^\d+$/.test(identifier.toString())
  const whereClause = isNumeric ? 'p.id = $1' : 'p.slug = $1'
  const param = isNumeric ? Number(identifier) : identifier

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
    WHERE ${whereClause}`
    
  const result = await db.pool.query(sql, [param])
  return result.rows[0] ?? null
}

const addOne = async (projectData: ProjectData) => {
  const slug = projectData.slug || slugify(projectData.title)
  const isPublished = projectData.is_published !== undefined ? projectData.is_published : true
  const isFeatured = projectData.is_featured !== undefined ? projectData.is_featured : false
  const contentMarkdown = projectData.content_markdown || ''
  
  // Find highest display_order to append at the end
  const maxOrderRes = await db.pool.query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM projects')
  const displayOrder = projectData.display_order !== undefined ? projectData.display_order : (maxOrderRes.rows[0].max_order + 1)

  const sql = `
    INSERT INTO projects (
      title, description, category_id, demo_url, image_url,
      is_published, is_featured, content_markdown, slug, display_order
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *`
    
  const result = await db.pool.query(sql, [
    projectData.title,
    projectData.description,
    projectData.category_id,
    projectData.demo_url,
    projectData.image_url,
    isPublished,
    isFeatured,
    contentMarkdown,
    slug,
    displayOrder
  ])
  return result.rows[0]
}

const updateOne = async (id: number, projectData: ProjectData) => {
  const slug = projectData.slug || slugify(projectData.title)
  const isPublished = projectData.is_published !== undefined ? projectData.is_published : true
  const isFeatured = projectData.is_featured !== undefined ? projectData.is_featured : false
  const contentMarkdown = projectData.content_markdown || ''

  const sql = `
    UPDATE projects 
    SET 
      title=$1, description=$2, category_id=$3, demo_url=$4, image_url=$5,
      is_published=$6, is_featured=$7, content_markdown=$8, slug=$9
    WHERE id=$10 
    RETURNING *`
    
  const result = await db.pool.query(sql, [
    projectData.title,
    projectData.description,
    projectData.category_id,
    projectData.demo_url,
    projectData.image_url,
    isPublished,
    isFeatured,
    contentMarkdown,
    slug,
    id
  ])
  return result.rows[0]
}

const removeOne = async (id: number): Promise<boolean | null> => {
  const sql = 'DELETE FROM projects WHERE id=$1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}

const findByCategorySlug = async (slug: string, onlyPublished = false) => {
  const publishedCondition = onlyPublished ? 'AND p.is_published = true' : ''
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
    WHERE LOWER(c.name) = LOWER($1) ${publishedCondition}
    ORDER BY p.display_order ASC, p.created_at DESC`
    
  const result = await db.pool.query(sql, [slug])
  return result.rows ?? []
}

const linkToProjectLinks = async (projectId: number, links: Array<{ label: string; url: string }>) => {
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

const updateDisplayOrders = async (items: Array<{ id: number; display_order: number }>) => {
  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')
    for (const item of items) {
      await client.query('UPDATE projects SET display_order = $1 WHERE id = $2', [item.display_order, item.id])
    }
    await client.query('COMMIT')
    return true
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export { 
  findAll, 
  findOne, 
  addOne, 
  updateOne, 
  removeOne, 
  findByCategorySlug, 
  linkToProjectLinks,
  updateDisplayOrders
}
