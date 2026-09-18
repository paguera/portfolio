# Portfolio Monorepo

Portfolio personnel Full-Stack & créatif regroupant l'ensemble des services : API Backend, application Visiteurs et panneau d'Administration.

---

## 🏗️ Structure du Projet

```text
portfolio/
├── backend-express/       # API REST Express 5 & TypeScript
│   ├── src/               # Code source (contrôleurs, modèles, routes, services)
│   ├── scripts/           # Scripts utilitaires (création d'administrateur)
│   ├── Dockerfile         # Image Docker Node multi-stage
│   └── .env.sample        # Modèle de configuration d'environnement
│
├── frontend-visiteurs/    # Application Web publique (React 19 + Vite + Tailwind CSS)
│   ├── src/               # Composants, pages, visualiseur audio Soundwave, galerie
│   ├── public/            # Assets statiques, audios, images
│   ├── Dockerfile         # Image Docker de build + Nginx
│   └── .env.sample        # Modèle de variables d'environnement Vite
│
├── frontend-admin/        # Dashboard de gestion (React 19 + Vite + Tailwind CSS)
│   ├── src/               # Gestion des projets, catégories, technologies, auth
│   ├── Dockerfile         # Image Docker de build + Nginx
│   └── .env.sample        # Modèle de variables d'environnement Vite
│
├── .gitignore             # Règles d'exclusion Git globales
├── .dockerignore          # Règles d'exclusion Docker globales
└── README.md
```

---

## ⚙️ Prérequis

- **Node.js** >= 20.x
- **PostgreSQL** >= 15.x
- **Docker** (optionnel pour le déploiement containerisé)

---

## 🚀 Installation & Développement Local

### 1. Backend (`backend-express`)

```bash
cd backend-express
npm install

# Configurer les variables d'environnement
cp .env.sample .env
# Éditer .env avec vos identifiants PostgreSQL, JWT et Mail

# Initialiser la base de données PostgreSQL
psql -U <user> -d <database> -f src/db.postgres.sql

# Créer un compte administrateur
npm run create-admin

# Lancer en mode développement (hot-reload tsx)
npm run dev
```

### 2. Frontend Visiteurs (`frontend-visiteurs`)

```bash
cd frontend-visiteurs
npm install

# Configurer l'environnement
cp .env.sample .env
# Définir VITE_BASE_URL (ex: http://localhost:3000/api)

# Lancer le serveur de développement Vite
npm run dev
```

### 3. Frontend Admin (`frontend-admin`)

```bash
cd frontend-admin
npm install

# Configurer l'environnement
cp .env.sample .env
# Définir VITE_BASE_URL (ex: http://localhost:3000)

# Lancer le serveur de développement Vite
npm run dev
```

---

## 🔐 Variables d'Environnement

### `backend-express/.env`
| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute de l'API | `3000` |
| `FRONT_URL` | Origine autorisée par CORS | `http://localhost:5173` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur PostgreSQL | `portfolio_user` |
| `DB_PASSWORD` | Mot de passe base de données | `secret` |
| `DB_NAME` | Nom de la base | `portfolio_db` |
| `JWT_SECRET` | Clé secrète de signature des tokens | `votre_cle_secrete` |
| `MAIL_USER` | Compte SMTP pour l'envoi de mails | `user@domain.com` |
| `MAIL_PASS` | Mot de passe d'application SMTP | `app_password` |
| `MAIL_TO` | Destinataire des messages de contact | `admin@domain.com` |

### `frontend-visiteurs/.env`
| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `VITE_BASE_URL` | Point d'entrée de l'API (avec `/api`) | `http://localhost:3000/api` |

### `frontend-admin/.env`
| Variable | Description | Exemple |
| :--- | :--- | :--- |
| `VITE_BASE_URL` | Hôte API (sans `/api` ou vide si reverse-proxy) | `http://localhost:3000` |

---

## 🐳 Déploiement Docker

Chaque sous-projet dispose d'un `Dockerfile` optimisé pour la production :

- **Backend** : Build TypeScript multi-stage léger Node.js Alpine.
- **Frontends** : Compilation statique Vite suivie d'un packaging Nginx Alpine avec headers de sécurité et mise en cache des assets.

```bash
# Exemple de build backend
docker build -t portfolio-backend ./backend-express

# Exemple de build frontend visiteurs
docker build --build-arg VITE_BASE_URL=https://api.paguera.fr/api -t portfolio-visiteurs ./frontend-visiteurs

# Exemple de build frontend admin
docker build --build-arg VITE_BASE_URL=https://api.paguera.fr -t portfolio-admin ./frontend-admin
```

---

## 📜 Licence

Projet sous licence MIT.
