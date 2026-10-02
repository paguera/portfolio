import db from '../config/database.js'
import { colorize } from '../utils/Colorize.js'

export const initSchema = async () => {
  const client = await db.pool.connect()
  try {
    // 1. Projects columns migration
    await client.query(`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS content_markdown TEXT DEFAULT '';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
    `)

    // 2. Artworks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) DEFAULT 'GABRIEL VF',
        year VARCHAR(50) DEFAULT '2026',
        medium VARCHAR(255) DEFAULT 'Technique mixte',
        dimensions VARCHAR(100) DEFAULT '21 x 29.7 cm',
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        is_published BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_artworks_display_order ON artworks(display_order);
      CREATE INDEX IF NOT EXISTS idx_artworks_published ON artworks(is_published);
    `)

    // Seed default artworks if artworks table is empty
    const artworkCountRes = await client.query('SELECT COUNT(*) FROM artworks')
    if (parseInt(artworkCountRes.rows[0].count, 10) === 0) {
      console.log(colorize('Seeding default artworks...').yellow)
      const defaultArtworks = [
        {
          title: "Le Commencement du Chaos",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Encre et graphite sur papier d'art",
          dimensions: "21 x 29.7 cm",
          description: "Première esquisse d'une série explorant l'équilibre délicat entre la pureté du trait et la saleté de la tâche.",
          image_url: "/dessins-salepropre/01.webp",
          display_order: 1
        },
        {
          title: "Traversée Linéaire",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Encre de Chine",
          dimensions: "21 x 29.7 cm",
          description: "Une longue ligne ininterrompue qui dessine les contours d'une pensée invisible et mouvante.",
          image_url: "/dessins-salepropre/06.webp",
          display_order: 2
        },
        {
          title: "Vortex Spatial",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Encre et graphite",
          dimensions: "21 x 29.7 cm",
          description: "Exploration des dynamiques de rotation et de perspective.",
          image_url: "/dessins-salepropre/07.webp",
          display_order: 3
        },
        {
          title: "Structure Organique",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Technique mixte",
          dimensions: "21 x 29.7 cm",
          description: "Dessin texturé évoquant les formes de la vie microscopique.",
          image_url: "/dessins-salepropre/08.webp",
          display_order: 4
        },
        {
          title: "L'Empreinte Propre",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Encre et graphite",
          dimensions: "21 x 29.7 cm",
          description: "Laisser la marque de l'outil s'exprimer sans filtre. Un équilibre parfait entre propreté et rugosité.",
          image_url: "/dessins-salepropre/1.webp",
          display_order: 5
        },
        {
          title: "Érosion de Matière",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Encre diluée et fusain",
          dimensions: "21 x 29.7 cm",
          description: "Évocation du passage du temps sur la matière. Les noirs s'estompent et se dissolvent.",
          image_url: "/dessins-salepropre/30.webp",
          display_order: 6
        },
        {
          title: "Sans titre",
          artist: "GABRIEL VF",
          year: "2026",
          medium: "Technique mixte",
          dimensions: "21 x 29.7 cm",
          description: "Œuvre sans titre.",
          image_url: "/dessins-salepropre/sans-titre.webp",
          display_order: 7
        }
      ]

      for (const art of defaultArtworks) {
        await client.query(
          `INSERT INTO artworks (title, artist, year, medium, dimensions, description, image_url, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [art.title, art.artist, art.year, art.medium, art.dimensions, art.description, art.image_url, art.display_order]
        )
      }
    }

    // 3. Contact messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_is_archived ON contact_messages(is_archived);
    `)

    // 4. Site Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Seed default settings if empty
    const settingsCountRes = await client.query('SELECT COUNT(*) FROM site_settings')
    if (parseInt(settingsCountRes.rows[0].count, 10) === 0) {
      console.log(colorize('Seeding default site settings...').yellow)
      const defaultSettings = [
        { key: 'availability_status', value: 'Disponible pour de nouvelles opportunités' },
        { key: 'is_available', value: 'true' },
        { key: 'hero_title_accent', value: 'Développeur Full-Stack & futur DevOps' },
        { key: 'hero_bio', value: "Passionné par la conception d'applications web robustes, l'architecture logicielle et l'automatisation des déploiements. Je construis des solutions complètes de la base de données jusqu'à l'infrastructure." }
      ]

      for (const s of defaultSettings) {
        await client.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
          [s.key, s.value]
        )
      }
    }

    // 5. Artwork Ratings & Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS artwork_ratings (
        id SERIAL PRIMARY KEY,
        artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
        rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        visitor_uuid VARCHAR(255) NOT NULL,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_visitor_artwork_rating UNIQUE (artwork_id, visitor_uuid)
      );

      CREATE INDEX IF NOT EXISTS idx_artwork_ratings_artwork_id ON artwork_ratings(artwork_id);

      CREATE TABLE IF NOT EXISTS artwork_comments (
        id SERIAL PRIMARY KEY,
        artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
        author_name VARCHAR(100) NOT NULL DEFAULT 'Visiteur',
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT true,
        visitor_uuid VARCHAR(255) NOT NULL,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_artwork_comments_artwork_id ON artwork_comments(artwork_id);
      CREATE INDEX IF NOT EXISTS idx_artwork_comments_approved ON artwork_comments(is_approved);
    `)

    // 6. Track Ratings & Comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS track_ratings (
        id SERIAL PRIMARY KEY,
        track_id VARCHAR(255) NOT NULL,
        rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        visitor_uuid VARCHAR(255) NOT NULL,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_visitor_track_rating UNIQUE (track_id, visitor_uuid)
      );

      CREATE INDEX IF NOT EXISTS idx_track_ratings_track_id ON track_ratings(track_id);

      CREATE TABLE IF NOT EXISTS track_comments (
        id SERIAL PRIMARY KEY,
        track_id VARCHAR(255) NOT NULL,
        author_name VARCHAR(100) NOT NULL DEFAULT 'Visiteur',
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT true,
        visitor_uuid VARCHAR(255) NOT NULL,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_track_comments_track_id ON track_comments(track_id);
      CREATE INDEX IF NOT EXISTS idx_track_comments_approved ON track_comments(is_approved);
    `)

    console.log(colorize('Database schema & tables initialized successfully').green)
  } catch (error) {
    console.error('Error during schema initialization:', error)
  } finally {
    client.release()
  }
}

