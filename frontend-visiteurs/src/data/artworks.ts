export interface Artwork {
  id: number;
  src: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
}

export const artworks: Artwork[] = [
  {
    id: 1,
    src: "/dessins-salepropre/01.webp",
    title: "Le Commencement du Chaos",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Encre et graphite sur papier d'art",
    dimensions: "21 x 29.7 cm",
    description: "Première esquisse d'une série explorant l'équilibre délicat entre la pureté du trait et la saleté de la tâche."
  },
  {
    id: 2,
    src: "/dessins-salepropre/06.webp",
    title: "Traversée Linéaire",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Encre de Chine",
    dimensions: "21 x 29.7 cm",
    description: "Une longue ligne ininterrompue qui dessine les contours d'une pensée invisible et mouvante."
  },
  {
    id: 3,
    src: "/dessins-salepropre/07.webp",
    title: "Vortex Spatial",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Encre et graphite",
    dimensions: "21 x 29.7 cm",
    description: "Exploration des dynamiques de rotation et de perspective."
  },
  {
    id: 4,
    src: "/dessins-salepropre/08.webp",
    title: "Structure Organique",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Technique mixte",
    dimensions: "21 x 29.7 cm",
    description: "Dessin texturé évoquant les formes de la vie microscopique."
  },
  {
    id: 5,
    src: "/dessins-salepropre/1.webp",
    title: "L'Empreinte Propre",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Encre et graphite",
    dimensions: "21 x 29.7 cm",
    description: "Laisser la marque de l'outil s'exprimer sans filtre. Un équilibre parfait entre propreté et rugosité."
  },
  {
    id: 6,
    src: "/dessins-salepropre/30.webp",
    title: "Érosion de Matière",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Encre diluée et fusain",
    dimensions: "21 x 29.7 cm",
    description: "Évocation du passage du temps sur la matière. Les noirs s'estompent et se dissolvent."
  },
  {
    id: 7,
    src: "/dessins-salepropre/sans-titre.webp",
    title: "Sans titre",
    artist: "GABRIEL VF",
    year: "2026",
    medium: "Technique mixte",
    dimensions: "21 x 29.7 cm",
    description: "Œuvre sans titre."
  }
];
