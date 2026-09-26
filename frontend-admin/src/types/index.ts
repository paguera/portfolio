export interface User {
  userId: number
  role: string
}

export interface Category {
  id: number
  name: string
}

export interface Technology {
  id: number
  name: string
  icon_class?: string
}

export interface Project {
  id: number
  title: string
  description?: string
  content_markdown?: string
  slug?: string
  category_id: number
  github_url?: string
  demo_url?: string
  image_url?: string
  is_published?: boolean
  is_featured?: boolean
  display_order?: number
  created_at: Date
  updated_at: Date
  technologies?: Technology[]
  github_links?: Array<{
    id?: number
    label: string
    url: string
  }>
}

export interface Artwork {
  id: number
  title: string
  artist: string
  year: string
  medium: string
  dimensions: string
  description: string
  image_url: string
  is_published: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

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

export interface ContactMessagesResponse {
  messages: ContactMessage[]
  counts: {
    total: number
    unread: number
    archived: number
  }
}

export type SiteSettings = Record<string, string>

export interface AuthResponse {
  token: string
}

export interface VisitorStatsSummary {
  totalUniqueVisitors: number
  totalPageViews: number
  totalAudioPlays: number
  todayVisitors: number
  weekVisitors: number
  monthVisitors: number
}

export interface VisitorDailyHistory {
  date: string
  uniqueVisitors: number
  pageViews: number
  audioPlays: number
}

export interface VisitorTopPage {
  path: string
  views: number
  percentage: number
}

export interface TopAudioTrack {
  title: string
  artist: string
  playlist: string
  plays: number
  percentage: number
  lastPlayedAt: string
}

export interface RecentAudioPlayItem {
  id: number
  visitorUuid: string
  ip: string
  title: string
  artist: string
  playlist: string
  createdAt: string
}

export interface VisitorBreakdownItem {
  name: string
  count: number
  percentage: number
}

export interface RecentVisitItem {
  id: number
  visitorUuid: string
  ip: string
  path: string
  browser: string
  os: string
  device: string
  referrer: string | null
  createdAt: string
}

export interface VisitorAdvancedStats {
  summary: VisitorStatsSummary
  history: VisitorDailyHistory[]
  topPages: VisitorTopPage[]
  topTracks: TopAudioTrack[]
  recentAudioPlays: RecentAudioPlayItem[]
  devices: VisitorBreakdownItem[]
  browsers: VisitorBreakdownItem[]
  operatingSystems: VisitorBreakdownItem[]
  recentVisits: RecentVisitItem[]
}
