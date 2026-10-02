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
  category_name?: string
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
  src?: string
  image_url?: string
  is_published?: boolean
  display_order?: number
  average_rating?: number
  rating_count?: number
}

export interface ArtworkComment {
  id: number
  artwork_id: number
  author_name: string
  comment: string
  is_approved?: boolean
  created_at: string
}

export interface RatingStats {
  average_rating: number
  rating_count: number
}

export type SiteSettings = Record<string, string>

export interface AuthResponse {
  token: string
}

