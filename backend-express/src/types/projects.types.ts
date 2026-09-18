export default interface ProjectData {
  id?: number
  title: string
  description: string
  category_id: number
  github_url?: string
  demo_url: string
  image_url: string
  // Liste des IDs des technologies associées (pour l'insertion/modification)
  technology_ids?: number[]
  // Les objets technologies complets (pour l'affichage, retournés par le modèle)
  technologies?: Array<{
    id: number
    name: string
    icon_class: string
  }>
  // Liste des liens de dépôts (GitHub Front, GitHub Back, etc.)
  github_links?: Array<{
    id?: number
    label: string
    url: string
  }>
}
