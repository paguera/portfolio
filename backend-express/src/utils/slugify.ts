export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères non alphanumériques
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets consécutifs
    .replace(/^-+/, '') // Supprime les tirets au début
    .replace(/-+$/, '') // Supprime les tirets à la fin
}
