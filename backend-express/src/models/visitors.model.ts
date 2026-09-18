import db from "../config/database.js";

// Ensure the visitors table exists in PostgreSQL
export const initVisitorsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      visitor_uuid VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      last_visit_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.pool.query(sql);
};

export const recordVisitor = async (visitorUuid: string) => {
  // Upsert visitor (insert if new, or update last_visit_at if already exists)
  const sql = `
    INSERT INTO visitors (visitor_uuid, last_visit_at)
    VALUES ($1, NOW())
    ON CONFLICT (visitor_uuid) 
    DO UPDATE SET last_visit_at = NOW();
  `;
  await db.pool.query(sql, [visitorUuid]);

  // Return total count of unique visitors
  return getVisitorCount();
};

export const getVisitorCount = async (): Promise<number> => {
  const sql = `SELECT COUNT(*)::int AS count FROM visitors;`;
  const result = await db.pool.query(sql);
  return result.rows[0]?.count ?? 0;
};
