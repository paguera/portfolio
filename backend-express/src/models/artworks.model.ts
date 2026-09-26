import db from '../config/database.js'

export interface ArtworkData {
  id?: number
  title: string
  artist?: string
  year?: string
  medium?: string
  dimensions?: string
  description?: string
  image_url: string
  is_published?: boolean
  display_order?: number
  created_at?: string
  updated_at?: string
}

export const findAllArtworks = async (onlyPublished = false) => {
  const whereClause = onlyPublished ? 'WHERE is_published = true' : ''
  const sql = `
    SELECT * FROM artworks
    ${whereClause}
    ORDER BY display_order ASC, id ASC
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const findArtworkById = async (id: number) => {
  const sql = 'SELECT * FROM artworks WHERE id = $1'
  const result = await db.pool.query(sql, [id])
  return result.rows[0] ?? null
}

export const createArtwork = async (data: ArtworkData) => {
  const isPublished = data.is_published !== undefined ? data.is_published : true
  const maxOrderRes = await db.pool.query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM artworks')
  const displayOrder = data.display_order !== undefined ? data.display_order : (maxOrderRes.rows[0].max_order + 1)

  const sql = `
    INSERT INTO artworks (
      title, artist, year, medium, dimensions, description, image_url, is_published, display_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `
  const result = await db.pool.query(sql, [
    data.title,
    data.artist || 'GABRIEL VF',
    data.year || '2026',
    data.medium || 'Technique mixte',
    data.dimensions || '21 x 29.7 cm',
    data.description || '',
    data.image_url,
    isPublished,
    displayOrder
  ])
  return result.rows[0]
}

export const updateArtwork = async (id: number, data: ArtworkData) => {
  const isPublished = data.is_published !== undefined ? data.is_published : true
  const sql = `
    UPDATE artworks
    SET 
      title = $1,
      artist = $2,
      year = $3,
      medium = $4,
      dimensions = $5,
      description = $6,
      image_url = $7,
      is_published = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `
  const result = await db.pool.query(sql, [
    data.title,
    data.artist || 'GABRIEL VF',
    data.year || '2026',
    data.medium || 'Technique mixte',
    data.dimensions || '21 x 29.7 cm',
    data.description || '',
    data.image_url,
    isPublished,
    id
  ])
  return result.rows[0] ?? null
}

export const deleteArtwork = async (id: number) => {
  const sql = 'DELETE FROM artworks WHERE id = $1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}

export const updateArtworkOrders = async (items: Array<{ id: number; display_order: number }>) => {
  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')
    for (const item of items) {
      await client.query('UPDATE artworks SET display_order = $1 WHERE id = $2', [item.display_order, item.id])
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
