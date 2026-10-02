import db from '../config/database.js'

export interface TrackRatingStats {
  track_id: string
  average_rating: number
  rating_count: number
}

export interface TrackComment {
  id?: number
  track_id: string
  author_name: string
  comment: string
  is_approved?: boolean
  visitor_uuid?: string
  ip?: string
  created_at?: string
}

export const upsertTrackRating = async (
  trackId: string,
  rating: number,
  visitorUuid: string,
  ip: string
) => {
  const sql = `
    INSERT INTO track_ratings (track_id, rating, visitor_uuid, ip)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (track_id, visitor_uuid)
    DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  await db.pool.query(sql, [trackId, rating, visitorUuid, ip])

  const statsSql = `
    SELECT 
      $1::varchar AS track_id,
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(id)::int AS rating_count
    FROM track_ratings
    WHERE track_id = $1
  `
  const statsRes = await db.pool.query(statsSql, [trackId])
  return statsRes.rows[0]
}

export const getTrackRatingStats = async (trackId: string) => {
  const sql = `
    SELECT 
      $1::varchar AS track_id,
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(id)::int AS rating_count
    FROM track_ratings
    WHERE track_id = $1
  `
  const result = await db.pool.query(sql, [trackId])
  return result.rows[0] ?? { track_id: trackId, average_rating: 0, rating_count: 0 }
}

export const getAllTrackRatingStats = async () => {
  const sql = `
    SELECT 
      track_id,
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
      COUNT(id)::int AS rating_count
    FROM track_ratings
    GROUP BY track_id
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const findCommentsByTrackId = async (trackId: string, onlyApproved = true) => {
  const whereClause = onlyApproved
    ? 'WHERE track_id = $1 AND is_approved = true'
    : 'WHERE track_id = $1'
  const sql = `
    SELECT id, track_id, author_name, comment, is_approved, created_at
    FROM track_comments
    ${whereClause}
    ORDER BY created_at DESC
  `
  const result = await db.pool.query(sql, [trackId])
  return result.rows ?? []
}

export const addCommentToTrack = async (
  trackId: string,
  authorName: string,
  comment: string,
  visitorUuid: string,
  ip: string
) => {
  const sql = `
    INSERT INTO track_comments (track_id, author_name, comment, visitor_uuid, ip, is_approved)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, track_id, author_name, comment, is_approved, created_at
  `
  const result = await db.pool.query(sql, [
    trackId,
    authorName.trim().slice(0, 100) || 'Visiteur',
    comment.trim(),
    visitorUuid,
    ip
  ])
  return result.rows[0]
}

export const findAllTrackCommentsForAdmin = async () => {
  const sql = `
    SELECT *
    FROM track_comments
    ORDER BY created_at DESC
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const toggleTrackCommentApproval = async (id: number, isApproved: boolean) => {
  const sql = `
    UPDATE track_comments
    SET is_approved = $1
    WHERE id = $2
    RETURNING *
  `
  const result = await db.pool.query(sql, [isApproved, id])
  return result.rows[0] ?? null
}

export const deleteTrackComment = async (id: number) => {
  const sql = 'DELETE FROM track_comments WHERE id = $1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}
