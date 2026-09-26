# Portfolio Monorepo

Portfolio personnel Full-Stack & créatif regroupant l'ensemble des services : API Backend, application Visiteurs et panneau d'Administration sécurisé.

---

## 🏗️ Structure du Projet

```text
portfolio/
├── backend-express/       # API REST Express 5 & TypeScript
│   ├── src/               # Code source (contrôleurs, modèles, routes, services, uploads)
│   ├── scripts/           # Scripts utilitaires (création d'administrateur, seed)
│   ├── Dockerfile         # Image Docker Node multi-stage
│   └── .env.sample        # Modèle de configuration d'environnement
│
├── frontend-visiteurs/    # Application Web publique (React 19 + Vite + Tailwind CSS)
│   ├── src/               # Pages, visualiseur Soundwave, mini-lecteur audio, galerie d'art
│   ├── public/            # Assets statiques, audios, images
│   ├── Dockerfile         # Image Docker de build + Nginx
│   └── .env.sample        # Modèle de variables d'environnement Vite
│
├── frontend-admin/        # Dashboard de gestion (React 19 + Vite + Tailwind CSS)
│   ├── src/               # Gestion projets, galerie artworks, boîte de réception, télémétrie
│   ├── Dockerfile         # Image Docker de build + Nginx
│   └── .env.sample        # Modèle de variables d'environnement Vite
│
├── .gitignore             # Règles d'exclusion Git globales
├── .dockerignore          # Règles d'exclusion Docker globales
├── .env.sample            # Modèle de configuration globale Docker Compose
├── docker-compose.yml     # Orchestration des services (DB, API, Frontends)
└── README.md
```

---

## ✨ Fonctionnalités Principales

### 🌐 Espace Public (Visiteurs)
- **Fiches Projets Détaillées & Architecture** : Rendu Markdown avec coloration de code, liens démo et dépôts sources.
- **Recherche & Filtres Avancés** : Filtrage interactif par technologie (React, Docker, PostgreSQL...) et recherche textuelle en temps réel.
- **Lecteur Audio Persistant** : Contexte audio global (`AudioProvider`) permettant une écoute ininterrompue en naviguant sur tout le site avec un mini-lecteur flottant rétractable et raccourcis clavier (`Espace`).
- **Laboratoire Musical & Visualiseur** : Visualiseur audio interactif avec stroboscope, analyseurs de fréquences stéréo et gestion de playlists.
- **Galerie d'Art Contemporain** : Carrousel interactif d'œuvres et dessins avec affichage des techniques, dimensions et démarches.
- **Télémétrie Respectueuse** : Mesure d'audience sans cookies tiers.

### 🔐 Espace Administrateur (Privé & Sécurisé via Tailscale)
- **Tableau de Bord Télémétrique** : Statistiques de fréquentation en direct, graphiques d'activité, top pages et top écoutes audio.
- **Gestionnaire de Projets** : Éditeur Markdown avec prévisualisation en direct, réordonnancement par montée/descente, statuts public/brouillon et vedette (★).
- **Gestionnaire de Galerie d'Art** : CRUD d'œuvres, réordonnancement du carrousel et téléversement direct de fichiers.
- **Boîte de Réception (Contact Inbox)** : Sauvegarde PostgreSQL systématique des messages de formulaire de contact, badge de notification pour les non lus et réponse par e-mail en 1 clic.
- **Téléversement de Médias Sécurisé** : Upload d'images (WebP, AVIF, PNG, JPEG, SVG) avec limitation à 10 Mo et hachage aléatoire contre le path traversal.
- **Configuration Dynamique du Site** : Modification en direct du badge de disponibilité d'embauche, des textes d'accroche et de la bio.

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

## 🐳 Déploiement Containerisé (Docker / Podman)

L'application est entièrement orchestrée via `docker-compose.yml` (compatible Docker et Podman).

### 1. Configuration de l'environnement

Créez votre fichier `.env` à la racine à partir du modèle :

```bash
cp .env.sample .env
```

Renseignez vos identifiants PostgreSQL, le secret JWT, la configuration SMTP ainsi que les URLs d'API pour les frontends (`VITE_BASE_URL_VISITEURS`, `VITE_BASE_URL_ADMIN`).

### 2. Lancement avec Docker Compose / Podman

```bash
# Avec Docker Compose
docker compose up -d --build

# Avec Podman Compose
podman compose up -d --build
```

Cette commande orchestre les 4 conteneurs :
- **`portfolio-db`** : Base PostgreSQL 15 (volume persistant `portfolio-db-data` et initialisation SQL automatique).
- **`portfolio-backend`** : API Node.js/Express 5 TypeScript multi-stage.
- **`portfolio-visiteurs`** : Frontend public sous Nginx avec volume monté pour les fichiers audio.
- **`portfolio-admin`** : Dashboard d'administration sous Nginx isolé sur son propre réseau et strictement exposé sur l'interface Tailscale (`${TAILSCALE_IP}:8080`), inaccessible depuis `nas-net` ou le réseau local.

---

## 📜 Licence

Projet sous licence GNU General Public License v3.0 (GPL-3.0). Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
