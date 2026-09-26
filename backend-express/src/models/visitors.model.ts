import db from "../config/database.js";

export interface VisitorStatsSummary {
  totalUniqueVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
}

export interface VisitorDailyHistory {
  date: string;
  uniqueVisitors: number;
  pageViews: number;
}

export interface VisitorTopPage {
  path: string;
  views: number;
}

export interface VisitorBreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentVisitItem {
  id: number;
  visitorUuid: string;
  path: string;
  browser: string;
  os: string;
  device: string;
  referrer: string | null;
  createdAt: string;
}

export interface VisitorAdvancedStats {
  summary: VisitorStatsSummary;
  history: VisitorDailyHistory[];
  topPages: VisitorTopPage[];
  devices: VisitorBreakdownItem[];
  browsers: VisitorBreakdownItem[];
  operatingSystems: VisitorBreakdownItem[];
  recentVisits: RecentVisitItem[];
}

export function parseUserAgent(ua: string = ""): { device: string; os: string; browser: string } {
  // Device detection
  let device = "Desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) {
    device = "Mobile";
  } else if (/android/i.test(ua)) {
    device = "Tablet";
  }

  // OS detection
  let os = "Autre";
  if (/windows phone/i.test(ua)) os = "Windows Phone";
  else if (/win(dows|98|nt|me|2000|xp)/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac(intosh|_powerpc|os)/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/cros/i.test(ua)) os = "Chrome OS";

  // Browser detection
  let browser = "Autre";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";

  return { device, os, browser };
}

// Ensure the visitors and page_views tables exist in PostgreSQL
export const initVisitorsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      visitor_uuid VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      last_visit_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      total_visits INT DEFAULT 1
    );

    ALTER TABLE visitors ADD COLUMN IF NOT EXISTS total_visits INT DEFAULT 1;

    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      visitor_uuid VARCHAR(255) NOT NULL,
      path VARCHAR(255) NOT NULL DEFAULT '/',
      referrer VARCHAR(500),
      browser VARCHAR(50),
      os VARCHAR(50),
      device VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
    CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
    CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views (visitor_uuid);
  `;
  await db.pool.query(sql);
};

export const recordVisitor = async (
  visitorUuid: string,
  details?: { path?: string; referrer?: string; userAgent?: string }
): Promise<number> => {
  // 1. Upsert visitor (insert if new, or update last_visit_at & increment total_visits)
  const upsertVisitorSql = `
    INSERT INTO visitors (visitor_uuid, last_visit_at, total_visits)
    VALUES ($1, NOW(), 1)
    ON CONFLICT (visitor_uuid) 
    DO UPDATE SET 
      last_visit_at = NOW(),
      total_visits = COALESCE(visitors.total_visits, 0) + 1;
  `;
  await db.pool.query(upsertVisitorSql, [visitorUuid]);

  // 2. Insert page view record
  const cleanPath = (details?.path && typeof details.path === "string" ? details.path.slice(0, 255) : "/");
  const cleanReferrer = (details?.referrer && typeof details.referrer === "string" ? details.referrer.slice(0, 500) : null);
  const { device, os, browser } = parseUserAgent(details?.userAgent || "");

  const insertPageViewSql = `
    INSERT INTO page_views (visitor_uuid, path, referrer, browser, os, device, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW());
  `;
  await db.pool.query(insertPageViewSql, [
    visitorUuid,
    cleanPath,
    cleanReferrer,
    browser,
    os,
    device,
  ]);

  return getVisitorCount();
};

export const getVisitorCount = async (): Promise<number> => {
  const sql = `SELECT COUNT(*)::int AS count FROM visitors;`;
  const result = await db.pool.query(sql);
  return result.rows[0]?.count ?? 0;
};

export const getVisitorStats = async (): Promise<VisitorAdvancedStats> => {
  // 1. Summary Metrics
  const summarySql = `
    SELECT 
      COUNT(*)::int AS total_unique_visitors,
      COALESCE((SELECT COUNT(*)::int FROM page_views), 0) AS total_page_views,
      COALESCE((SELECT SUM(total_visits)::int FROM visitors), COUNT(*)::int) AS total_recorded_visits,
      COUNT(*) FILTER (WHERE last_visit_at >= CURRENT_DATE)::int AS today_visitors,
      COUNT(*) FILTER (WHERE last_visit_at >= NOW() - INTERVAL '7 days')::int AS week_visitors,
      COUNT(*) FILTER (WHERE last_visit_at >= NOW() - INTERVAL '30 days')::int AS month_visitors
    FROM visitors;
  `;
  const summaryRes = await db.pool.query(summarySql);
  const summaryRow = summaryRes.rows[0] || {};
  const totalPageViewsRaw = summaryRow.total_page_views ?? 0;
  const totalRecordedVisits = summaryRow.total_recorded_visits ?? summaryRow.total_unique_visitors ?? 0;

  const summary: VisitorStatsSummary = {
    totalUniqueVisitors: summaryRow.total_unique_visitors ?? 0,
    totalPageViews: totalPageViewsRaw > 0 ? totalPageViewsRaw : totalRecordedVisits,
    todayVisitors: summaryRow.today_visitors ?? 0,
    weekVisitors: summaryRow.week_visitors ?? 0,
    monthVisitors: summaryRow.month_visitors ?? 0,
  };

  // 2. Daily history (Last 14 days)
  const historySql = `
    WITH date_series AS (
      SELECT generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day')::date AS day
    ),
    daily_unique AS (
      SELECT DATE(last_visit_at) AS day, COUNT(DISTINCT visitor_uuid)::int AS unique_count
      FROM visitors
      WHERE last_visit_at >= CURRENT_DATE - INTERVAL '13 days'
      GROUP BY DATE(last_visit_at)
    ),
    daily_views AS (
      SELECT DATE(created_at) AS day, COUNT(*)::int AS view_count
      FROM page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
      GROUP BY DATE(created_at)
    )
    SELECT 
      TO_CHAR(ds.day, 'YYYY-MM-DD') AS date,
      COALESCE(du.unique_count, 0)::int AS unique_visitors,
      COALESCE(dv.view_count, du.unique_count, 0)::int AS page_views
    FROM date_series ds
    LEFT JOIN daily_unique du ON du.day = ds.day
    LEFT JOIN daily_views dv ON dv.day = ds.day
    ORDER BY ds.day ASC;
  `;
  const historyRes = await db.pool.query(historySql);
  const history: VisitorDailyHistory[] = historyRes.rows.map((r: any) => ({
    date: r.date,
    uniqueVisitors: r.unique_visitors,
    pageViews: r.page_views,
  }));

  // 3. Top Pages
  const topPagesSql = `
    SELECT path, COUNT(*)::int AS views
    FROM page_views
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10;
  `;
  const topPagesRes = await db.pool.query(topPagesSql);
  let topPages: VisitorTopPage[] = topPagesRes.rows.map((r: any) => ({
    path: r.path,
    views: r.views,
  }));
  if (topPages.length === 0) {
    topPages = [{ path: "/", views: summary.totalPageViews }];
  }

  // 4. Devices breakdown
  const devicesSql = `
    SELECT 
      COALESCE(device, 'Desktop') AS name, 
      COUNT(*)::int AS count,
      ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM page_views), 0), 1)::float AS percentage
    FROM page_views
    GROUP BY device
    ORDER BY count DESC;
  `;
  const devicesRes = await db.pool.query(devicesSql);
  let devices: VisitorBreakdownItem[] = devicesRes.rows.map((r: any) => ({
    name: r.name,
    count: r.count,
    percentage: r.percentage ?? 100,
  }));
  if (devices.length === 0) {
    devices = [{ name: "Desktop", count: summary.totalUniqueVisitors, percentage: 100 }];
  }

  // 5. Browsers breakdown
  const browsersSql = `
    SELECT 
      COALESCE(browser, 'Autre') AS name, 
      COUNT(*)::int AS count,
      ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM page_views), 0), 1)::float AS percentage
    FROM page_views
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 6;
  `;
  const browsersRes = await db.pool.query(browsersSql);
  let browsers: VisitorBreakdownItem[] = browsersRes.rows.map((r: any) => ({
    name: r.name,
    count: r.count,
    percentage: r.percentage ?? 100,
  }));
  if (browsers.length === 0) {
    browsers = [{ name: "Navigateurs modernes", count: summary.totalUniqueVisitors, percentage: 100 }];
  }

  // 6. Operating Systems breakdown
  const osSql = `
    SELECT 
      COALESCE(os, 'Autre') AS name, 
      COUNT(*)::int AS count,
      ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM page_views), 0), 1)::float AS percentage
    FROM page_views
    GROUP BY os
    ORDER BY count DESC
    LIMIT 6;
  `;
  const osRes = await db.pool.query(osSql);
  let operatingSystems: VisitorBreakdownItem[] = osRes.rows.map((r: any) => ({
    name: r.name,
    count: r.count,
    percentage: r.percentage ?? 100,
  }));
  if (operatingSystems.length === 0) {
    operatingSystems = [{ name: "Linux / Windows", count: summary.totalUniqueVisitors, percentage: 100 }];
  }

  // 7. Recent visits
  const recentSql = `
    SELECT id, visitor_uuid, path, browser, os, device, referrer, created_at
    FROM page_views
    ORDER BY created_at DESC
    LIMIT 15;
  `;
  const recentRes = await db.pool.query(recentSql);
  let recentVisits: RecentVisitItem[] = recentRes.rows.map((r: any) => ({
    id: r.id,
    visitorUuid: r.visitor_uuid,
    path: r.path,
    browser: r.browser || "Unknown",
    os: r.os || "Unknown",
    device: r.device || "Desktop",
    referrer: r.referrer,
    createdAt: r.created_at,
  }));

  if (recentVisits.length === 0) {
    // Fallback to recent unique visitors from visitors table
    const fallbackVisitorsSql = `
      SELECT id, visitor_uuid, last_visit_at AS created_at
      FROM visitors
      ORDER BY last_visit_at DESC
      LIMIT 10;
    `;
    const fallbackRes = await db.pool.query(fallbackVisitorsSql);
    recentVisits = fallbackRes.rows.map((r: any) => ({
      id: r.id,
      visitorUuid: r.visitor_uuid,
      path: "/",
      browser: "Navigateur Web",
      os: "Système Détecté",
      device: "Desktop",
      referrer: "Direct",
      createdAt: r.created_at,
    }));
  }

  return {
    summary,
    history,
    topPages,
    devices,
    browsers,
    operatingSystems,
    recentVisits,
  };
};
