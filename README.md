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
