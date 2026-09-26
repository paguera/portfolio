import db from '../config/database.js'

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  is_archived: boolean
  ip: string | null
  created_at: string
}

export const saveContactMessage = async (data: {
  name: string
  email: string
  subject?: string
  message: string
  ip?: string
}): Promise<ContactMessage> => {
  const sql = `
    INSERT INTO contact_messages (name, email, subject, message, ip)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const result = await db.pool.query(sql, [
    data.name,
    data.email,
    data.subject || null,
    data.message,
    data.ip || null
  ])
  return result.rows[0]
}

export const findAllMessages = async (status?: 'all' | 'unread' | 'archived') => {
  let whereClause = ''
  if (status === 'unread') {
    whereClause = 'WHERE is_read = false AND is_archived = false'
  } else if (status === 'archived') {
    whereClause = 'WHERE is_archived = true'
  } else {
    // Par défaut, tous les non-archivés
    whereClause = 'WHERE is_archived = false'
  }

  const sql = `
    SELECT * FROM contact_messages
    ${whereClause}
    ORDER BY created_at DESC
  `
  const result = await db.pool.query(sql)
  return result.rows ?? []
}

export const getMessageCounts = async () => {
  const sql = `
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false) as total,
      COUNT(*) FILTER (WHERE is_read = false AND is_archived = false) as unread,
      COUNT(*) FILTER (WHERE is_archived = true) as archived
    FROM contact_messages
  `
  const result = await db.pool.query(sql)
  const row = result.rows[0]
  return {
    total: parseInt(row.total, 10) || 0,
    unread: parseInt(row.unread, 10) || 0,
    archived: parseInt(row.archived, 10) || 0
  }
}

export const updateMessageStatus = async (
  id: number,
  updates: { is_read?: boolean; is_archived?: boolean }
) => {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.is_read !== undefined) {
    fields.push(`is_read = $${paramIndex++}`)
    values.push(updates.is_read)
  }

  if (updates.is_archived !== undefined) {
    fields.push(`is_archived = $${paramIndex++}`)
    values.push(updates.is_archived)
  }

  if (fields.length === 0) return null

  values.push(id)
  const sql = `
    UPDATE contact_messages
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `
  const result = await db.pool.query(sql, values)
  return result.rows[0] ?? null
}

export const deleteMessageById = async (id: number) => {
  const sql = 'DELETE FROM contact_messages WHERE id = $1'
  const result = await db.pool.query(sql, [id])
  return (result.rowCount ?? 0) > 0
}
