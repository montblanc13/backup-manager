# Backup Manager

Application web locale pour planifier et suivre des sauvegardes de dossiers. Chaque tâche archive un dossier source en `.tar.gz` horodaté (`<nom>-AAAAMMJJ-HHMMSS.tar.gz`) dans un dossier de destination, selon une planification cron, avec historique des exécutions, liste des fichiers archivés et rétention automatique des anciennes archives.

> L'application n'a pas d'authentification : elle est conçue pour un usage local sur une seule machine.

Stack : Nuxt 4, Nuxt UI, Nuxt Content, SQLite (`node:sqlite`) et Drizzle ORM.

## Fonctionnalités

- Tâches de sauvegarde (source, destination, cron, exclusions glob) avec lancement manuel.
- Suggestion d'expression cron par IA à partir d'une description (optionnelle, clé API requise).
- Historique des exécutions et fichiers archivés consultables, actualisation automatique de l'accueil.
- Rétention par tâche : nombre maximum d'archives et/ou volume maximum (M ou G), appliquée après chaque sauvegarde réussie.
- Guides d'aide intégrés sous `/help`, thèmes de couleur et mode clair/sombre, colonne de navigation repliable.
- La version `vA.B.C` (source : `package.json`) s'affiche en bas de la colonne de gauche.

## Prérequis

- Node.js 26 (module natif `node:sqlite`) et npm.

## Installation et développement

```bash
npm install
cp .env.example .env   # puis adapter les valeurs
npm run dev
```

L'application est servie sur `http://localhost:3000`. Les migrations de la base sont appliquées automatiquement au premier accès.

## Configuration

Toute la configuration passe par des variables `NUXT_*` (fichier `.env`, modèle : `.env.example`) :

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `NUXT_DB_PATH` | Fichier SQLite | `./data/backup-manager.db` |
| `NUXT_MIGRATIONS_FOLDER` | Dossier des migrations Drizzle | `./server/database/migrations` |
| `NUXT_ANTHROPIC_API_KEY` | Clé API pour la suggestion de cron (sans clé : fonction désactivée) | vide |
| `NUXT_ANTHROPIC_MODEL` | Modèle utilisé pour cette suggestion | `claude-opus-5-5` |
| `NUXT_BROWSE_ROOT` | Racine du sélecteur de dossier | `/` |
| `PORT` / `HOST` | Serveur HTTP | `3000` / selon Nitro |

## Commandes

```bash
npm run dev          # serveur de développement
npm run build        # build de production
npm run preview      # prévisualisation du build
npm run typecheck    # vérification des types
npm run db:generate  # migration Drizzle après modification de server/database/schema.ts
```

## Docker

```bash
docker compose up --build
```

L'application est exposée sur `127.0.0.1` uniquement, port hôte `PORT` (défaut `9090`). La base est stockée dans `BACKUP_DATA_DIR` (défaut `./data`, à créer au préalable et accessible en écriture à l'uid 1000). Les chemins source et destination des tâches sont ceux du conteneur : le HOME de l'hôte est monté sur `/host-home`. Voir `compose.yaml` pour monter d'autres dossiers.

## Documentation

- Guides utilisateur : dossier `content/help/` (affichés sous `/help`).
- Architecture et conventions de code : [CLAUDE.md](CLAUDE.md).
- Historique des versions : [CHANGELOG.md](CHANGELOG.md).
