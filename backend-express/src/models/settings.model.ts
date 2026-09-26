import db from '../config/database.js'

export const getSiteSettings = async () => {
  const sql = 'SELECT key, value FROM site_settings'
  const result = await db.pool.query(sql)
  const settings: Record<string, string> = {}
  for (const row of result.rows) {
    settings[row.key] = row.value
  }
  return settings
}

export const updateSiteSetting = async (key: string, value: string) => {
  const sql = `
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  const result = await db.pool.query(sql, [key, value])
  return result.rows[0]
}

export const updateBulkSiteSettings = async (settings: Record<string, string>) => {
  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')
    for (const [key, value] of Object.entries(settings)) {
      await client.query(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      `, [key, value])
    }
    await client.query('COMMIT')
    return await getSiteSettings()
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
