# Footy Predict

Jeu de pronostics de football entre amis (sans argent réel) : scores en direct, ligues privées entre amis avec classement, et fil d'actus mercato.

> Basé sur les maquettes visuelles générées avec Google Stitch (design system "Alexandria"), reconstruit en application complète.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router + Firebase (Auth)
- **Backend:** Express 5 + TypeScript + Firebase Admin (Firestore) + scraping (cheerio/Playwright) + node-cron

## Structure

```
frontend/   # App React (Vite)
backend/    # API Express
```

## Développement

```bash
# Backend (http://localhost:3001)
cd backend
cp .env.example .env   # renseigner les clés Firebase Admin
npm run dev

# Frontend (http://localhost:5173, proxy /api -> backend)
cd frontend
cp .env.example .env   # renseigner les clés Firebase Web
npm run dev
```

## Déploiement (gratuit) — Render + Vercel

Le repo contient déjà toute la config nécessaire (`render.yaml`, `frontend/vercel.json`). Il ne reste que la
connexion des comptes (étape que chacun doit faire soi-même, impossible à automatiser) :

**1) Backend → [Render](https://render.com)**
1. Sign up (de préférence via GitHub)
2. **New +** → **Blueprint** → sélectionner ce repo → Render détecte `render.yaml` → **Apply**
3. Premier build ~5-10 min (installation de Chromium pour le scraper flashscore.fr)
4. Noter l'URL générée (ex: `https://point-foot-backend.onrender.com`)
5. Optionnel (à faire une fois un vrai projet Firebase créé) : renseigner `FIREBASE_PROJECT_ID`,
   `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` dans l'onglet Environment du service

**2) Frontend → [Vercel](https://vercel.com)**
1. Sign up (via GitHub)
2. **Add New** → **Project** → importer ce repo
3. **Root Directory** → `frontend` (important, sinon Vercel build à la racine du monorepo)
4. Ajouter la variable d'env `VITE_API_BASE_URL` = l'URL Render de l'étape 1 (sans `/` final)
5. **Deploy**

Notes limites du plan gratuit : le backend Render se met en veille après 15 min d'inactivité (première requête
après une pause ~30-60s + lancement du scraper), et dispose de 512 Mo de RAM (limite pour Chromium/Playwright).
Passer au plan payant Render (7$/mois) si ça devient un problème.

## Sources de données

- **Scores/calendriers:** scraping de flashscore.fr (rendu JS, nécessite un navigateur headless), avec cache serveur et repli sur la dernière donnée valide en cas d'échec.
- **Actus mercato:** scraping de RMC Sport / Foot Mercato, avec cache serveur.

## Avancement

Voir les tâches du projet — développement par phases :

0. Scaffold monorepo
1. Design system (extrait des maquettes Stitch)
2. Résultats & Scores (scraping flashscore.fr)
3. Ligue entre Amis (auth + pronostics, Firebase)
4. Actu & Mercato (scraping RMC Sport / Foot Mercato)
5. Fiabilisation transverse (routing, états d'erreur, tests)
6. Publication GitHub
