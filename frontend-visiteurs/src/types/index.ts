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
  category_id: number
  category_name?: string
  github_url?: string
  demo_url?: string
  image_url?: string
  created_at: Date
  updated_at: Date
  technologies?: Technology[]
  github_links?: Array<{
    id?: number
    label: string
    url: string
  }>
}

export interface AuthResponse {
  token: string
}
