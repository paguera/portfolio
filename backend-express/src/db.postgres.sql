-- =============================================================================
-- SCHÉMA POSTGRESQL - PORTFOLIO (Version DWWM avec Relation Many-to-Many)
-- =============================================================================

-- 1. NETTOYAGE (Optionnel : à n'utiliser qu'en développement pour repartir de zéro)
-- Le "CASCADE" permet de supprimer les tables même si elles ont des liens entre elles.
DROP TABLE IF EXISTS project_links CASCADE;
DROP TABLE IF EXISTS project_technologies CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 2. TABLE DES UTILISATEURS (Admin)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    -- SERIAL : C'est l'équivalent de AUTO_INCREMENT en MySQL. 
    -- Il gère automatiquement la création d'une séquence de nombres.
    id SERIAL PRIMARY KEY,
    
    -- VARCHAR(n) : Limite la chaîne à n caractères.
    -- UNIQUE : Empêche d'avoir deux fois le même email.
    email VARCHAR(255) NOT NULL UNIQUE,
    
    password VARCHAR(255) NOT NULL,
    
    -- DEFAULT : Donne une valeur par défaut si rien n'est précisé.
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    
    -- TIMESTAMPTZ : "Timestamp with time zone". 
    -- C'est la recommandation Postgres pour stocker des dates précises avec fuseau horaire.
    -- CURRENT_TIMESTAMP : Insère la date et l'heure actuelles au moment de la création.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. TABLE DES CATÉGORIES (Relation 1-N avec Projects)
-- -----------------------------------------------------------------------------
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 4. TABLE DES PROJETS
-- -----------------------------------------------------------------------------
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL, -- TEXT : Pour de longs textes sans limite arbitraire.
    
    -- REFERENCES : Définit une Clé Étrangère (FK).
    -- ON DELETE SET NULL : Si on supprime une catégorie, le projet reste mais sa catégorie devient NULL.
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    
    -- Note : On a supprimé la colonne "tech_stack" car elle est remplacée par la table de jointure.
    
    demo_url VARCHAR(500),
    image_url VARCHAR(500) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. TABLE DES TECHNOLOGIES (Le "Dictionnaire" des outils)
-- -----------------------------------------------------------------------------
CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_class VARCHAR(100) -- Exemple : 'devicon-react-original'
);

-- -----------------------------------------------------------------------------
-- 6. TABLE DE JOINTURE (Relation Many-to-Many : Projet <-> Technologie)
-- -----------------------------------------------------------------------------
CREATE TABLE project_technologies (
    -- INTEGER REFERENCES : Relie cette colonne à l'ID de la table correspondante.
    -- ON DELETE CASCADE : Si on supprime un projet, les liens dans cette table sont supprimés automatiquement.
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
    
    -- PRIMARY KEY (a, b) : Crée une clé primaire composite. 
    -- Cela garantit qu'on ne peut pas lier deux fois la même techno au même projet.
    PRIMARY KEY (project_id, technology_id)
);

-- -----------------------------------------------------------------------------
-- 7. TABLE DES LIENS DE PROJETS (Relation 1-N : Projet <-> Liens)
-- -----------------------------------------------------------------------------
CREATE TABLE project_links (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL, -- Ex: 'GitHub Front', 'GitHub Back'
    url VARCHAR(500) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 8. AUTOMATISATION DU CHAMP "updated_at"
-- -----------------------------------------------------------------------------
-- Contrairement à MySQL (ON UPDATE CURRENT_TIMESTAMP), Postgres utilise des Triggers (déclencheurs).

-- On crée d'abord une fonction réutilisable :
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- On attache ensuite cette fonction à la table projects :
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON projects -- Avant chaque modification (UPDATE)
FOR EACH ROW              -- Pour chaque ligne concernée
EXECUTE FUNCTION trigger_set_timestamp();

-- -----------------------------------------------------------------------------
-- 9. INDEX (Optimisation des performances)
-- -----------------------------------------------------------------------------
-- Les index accélèrent les recherches (SELECT) sur ces colonnes.
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_category ON projects(category_id);

-- -----------------------------------------------------------------------------
-- 10. TABLES DES MÉTRIQUES ET VISITEURS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    visitor_uuid VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_visit_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_visits INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    path VARCHAR(255) NOT NULL DEFAULT '/',
    referrer VARCHAR(500),
    browser VARCHAR(50),
    os VARCHAR(50),
    device VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_plays (
    id SERIAL PRIMARY KEY,
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    track_id VARCHAR(255) NOT NULL,
    track_title VARCHAR(255) NOT NULL,
    track_artist VARCHAR(255) DEFAULT 'Paguera',
    playlist VARCHAR(100) DEFAULT 'Général',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views (visitor_uuid);
CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views (ip);
CREATE INDEX IF NOT EXISTS idx_audio_plays_created_at ON audio_plays (created_at);
CREATE INDEX IF NOT EXISTS idx_audio_plays_track_title ON audio_plays (track_title);


