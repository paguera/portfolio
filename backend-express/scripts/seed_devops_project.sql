-- =============================================================================
-- SEED SCRIPT : Catégorie DevOps & Projet 'portfolio_deploy'
-- =============================================================================

-- 1. Insérer la catégorie DevOps si elle n'existe pas
INSERT INTO category (name)
VALUES ('DevOps')
ON CONFLICT (name) DO NOTHING;

-- 2. Insérer les technologies associées
INSERT INTO technologies (name, icon_class) VALUES
('Docker', 'devicon-docker-plain'),
('Docker Compose', 'devicon-docker-plain'),
('Nginx', 'devicon-nginx-original'),
('Linux', 'devicon-linux-plain'),
('PostgreSQL', 'devicon-postgresql-plain'),
('Express', 'devicon-express-original'),
('TypeScript', 'devicon-typescript-plain'),
('React', 'devicon-react-original'),
('GitHub Actions', 'devicon-githubactions-plain')
ON CONFLICT (name) DO NOTHING;

-- 3. Insérer le projet portfolio_deploy
DO $$
DECLARE
    v_category_id INTEGER;
    v_project_id INTEGER;
BEGIN
    -- Récupérer l'ID de la catégorie DevOps
    SELECT id INTO v_category_id FROM category WHERE name = 'DevOps' LIMIT 1;

    -- Vérifier si le projet existe déjà pour éviter les doublons
    IF NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Architecture & Déploiement Portfolio (Docker Compose)') THEN
        INSERT INTO projects (title, description, category_id, demo_url, image_url)
        VALUES (
            'Architecture & Déploiement Portfolio (Docker Compose)',
            'Architecture multi-conteneurs conteneurisée pour le déploiement en production : Reverse Proxy Nginx, API REST Express 5 TypeScript, Base de données PostgreSQL 15 avec persistance des volumes et séparation stricte des environnements Frontend Visiteurs / Admin.',
            v_category_id,
            NULL,
            '/architecture-portfolio.svg'
        )
        RETURNING id INTO v_project_id;

        -- 4. Associer les technologies au projet
        INSERT INTO project_technologies (project_id, technology_id)
        SELECT v_project_id, id FROM technologies 
        WHERE name IN ('Docker', 'Docker Compose', 'Nginx', 'Linux', 'PostgreSQL', 'Express', 'TypeScript', 'React');

        -- 5. Ajouter les liens du projet
        INSERT INTO project_links (project_id, label, url) VALUES
        (v_project_id, 'Schéma d''Architecture', '/architecture-portfolio.svg'),
        (v_project_id, 'Configuration Docker Compose', 'https://github.com/paguera/portfolio/blob/main/docker-compose.yml'),
        (v_project_id, 'Documentation & Setup', 'https://github.com/paguera/portfolio/blob/main/README.md');
    END IF;
END $$;
