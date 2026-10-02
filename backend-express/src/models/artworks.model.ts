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
  average_rating?: number
  rating_count?: number
  created_at?: string
  updated_at?: string
}

export interface ArtworkComment {
  id?: number
  artwork_id: number
  author_name: string
  comment: string
  is_approved?: boolean
  visitor_uuid?: string
  ip?: string
  created_at?: string
  artwork_title?: string
}

export const findAllArtworks = async (onlyPublished = false) => {
  const whereClause = onlyPublished ? 'WHERE a.is_published = true' : ''
  const sql = `
    SELECT 
      a.*,
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(r.id)::int AS rating_count
    FROM artworks a
    LEFT JOIN artwork_ratings r ON a.id = r.artwork_id
    ${whereClause}
    GROUP BY a.id
    ORDER BY a.display_order ASC, a.id ASC
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const findArtworkById = async (id: number) => {
  const sql = `
    SELECT 
      a.*,
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(r.id)::int AS rating_count
    FROM artworks a
    LEFT JOIN artwork_ratings r ON a.id = r.artwork_id
    WHERE a.id = $1
    GROUP BY a.id
  `
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

// -----------------------------------------------------------------------------
// NOTATIONS (RATINGS)
// -----------------------------------------------------------------------------
export const upsertArtworkRating = async (
  artworkId: number,
  rating: number,
  visitorUuid: string,
  ip: string
) => {
  const sql = `
    INSERT INTO artwork_ratings (artwork_id, rating, visitor_uuid, ip)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (artwork_id, visitor_uuid)
    DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  await db.pool.query(sql, [artworkId, rating, visitorUuid, ip])

  const statsSql = `
    SELECT 
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(id)::int AS rating_count
    FROM artwork_ratings
    WHERE artwork_id = $1
  `
  const statsRes = await db.pool.query(statsSql, [artworkId])
  return statsRes.rows[0]
}

export const getArtworkRatingStats = async (artworkId: number) => {
  const sql = `
    SELECT 
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(id)::int AS rating_count
    FROM artwork_ratings
    WHERE artwork_id = $1
  `
  const result = await db.pool.query(sql, [artworkId])
  return result.rows[0] ?? { average_rating: 0, rating_count: 0 }
}

// -----------------------------------------------------------------------------
// COMMENTAIRES (COMMENTS)
// -----------------------------------------------------------------------------
export const findCommentsByArtworkId = async (artworkId: number, onlyApproved = true) => {
  const whereClause = onlyApproved
    ? 'WHERE artwork_id = $1 AND is_approved = true'
    : 'WHERE artwork_id = $1'
  const sql = `
    SELECT id, artwork_id, author_name, comment, is_approved, created_at
    FROM artwork_comments
    ${whereClause}
    ORDER BY created_at DESC
  `
  const result = await db.pool.query(sql, [artworkId])
  return result.rows ?? []
}

export const addCommentToArtwork = async (
  artworkId: number,
  authorName: string,
  comment: string,
  visitorUuid: string,
  ip: string
) => {
  const sql = `
    INSERT INTO artwork_comments (artwork_id, author_name, comment, visitor_uuid, ip, is_approved)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, artwork_id, author_name, comment, is_approved, created_at
  `
  const result = await db.pool.query(sql, [
    artworkId,
    authorName.trim().slice(0, 100) || 'Visiteur',
    comment.trim(),
    visitorUuid,
    ip
  ])
  return result.rows[0]
}

export const findAllCommentsForAdmin = async () => {
  const sql = `
    SELECT 
      c.*,
      a.title AS artwork_title
    FROM artwork_comments c
    LEFT JOIN artworks a ON c.artwork_id = a.id
    ORDER BY c.created_at DESC
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const toggleCommentApproval = async (id: number, isApproved: boolean) => {
  const sql = `
    UPDATE artwork_comments
    SET is_approved = $1
    WHERE id = $2
    RETURNING *
  `
  const result = await db.pool.query(sql, [isApproved, id])
  return result.rows[0] ?? null
}

export const deleteArtworkComment = async (id: number) => {
  const sql = 'DELETE FROM artwork_comments WHERE id = $1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}

