# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

Gestionnaire de paquets : **npm**. Aucun linter ni framework de tests n'est encore configuré.

```bash
npm install        # installe les dépendances (lance aussi `nuxt prepare`)
npm run dev        # serveur de développement
npm run build      # build de production
npm run preview    # prévisualise le build
npm run db:generate  # génère une migration Drizzle après modif de server/database/schema.ts
npm run typecheck    # vérification des types (nuxt typecheck)
```

## Structure

Nuxt 4 : le code applicatif est dans `app/`, le serveur Nitro dans `server/`, le code commun client/serveur dans `shared/` (alias `#shared`). `app.vue` enveloppe l'application dans `<UApp>`, requis par Nuxt UI.

Flux d'une requête, par couche (chaque couche n'appelle que celle du dessous) :

- **Interface** : `app/pages` et `app/components` (affichage seulement) → `app/services/backupApi.ts` (client HTTP, auto-importé via `imports.dirs`) ; formatage dans `app/utils/format.ts`.
- **API** : `server/api/**` (routes fines : validation zod + appel de service ; erreurs métier → HTTP via `server/utils/http.ts`).
- **Services** : `server/services/` — `taskService` (CRUD + planification), `backupService` (exécution, verrou anti-doublon par tâche, historique), `backupRunner` (crée une archive `.tar.gz` horodatée `<slug-du-nom>-AAAAMMJJ-HHMMSS.tar.gz` dans la destination, via `tar` en JS pur ; écrite en `.partial` puis renommée ; exclusions glob via picomatch ; aucune rétention/purge des anciennes archives pour l'instant), `scheduler` (crons `croner`, prochaine exécution).
- **Suggestion de cron par IA** : `POST /api/cron/suggest` → `server/services/cronSuggestionService.ts` (SDK `@anthropic-ai/sdk`, sortie structurée JSON, revalidation de l'expression avec `croner`, repli serveur `fallbacks: 'default'`). Déclenchée à la sortie du champ de description dans `TaskForm.vue` ; la proposition n'est jamais appliquée sans clic sur « Utiliser ». Clé : `NUXT_ANTHROPIC_API_KEY` (sans clé → 503, fonction désactivée) ; modèle : `NUXT_ANTHROPIC_MODEL` (défaut `claude-opus-5-5`).
- **Sélecteur de dossier** : `GET /api/fs/directories` (`directoryService`, navigation limitée à `NUXT_BROWSE_ROOT`) ↔ `FolderPicker.vue`. L'application n'a pas d'authentification : restreindre cette racine hors usage local.
- **Fichiers embarqués** : le runner transmet par lots (5000) les fichiers effectivement archivés à `backupService`, qui les stocke dans la table `execution_files` (`executionFileRepository`) ; supprimés si l'exécution échoue. Exposés paginés et filtrables par `GET /api/executions/:id/files`, affichés dans `app/pages/executions/[id].vue`. Les colonnes `files_copied` / `bytes_copied` / `files_skipped` désignent désormais : fichiers archivés / volume non compressé / éléments exclus.
- **Repositories** : `server/repositories/` — seul endroit qui écrit du SQL (Drizzle). Schéma dans `server/database/schema.ts`, connexion + application des migrations au premier accès dans `server/database/connection.ts`. Après toute modification du schéma : `npm run db:generate`, puis relire/versionner le SQL généré dans `server/database/migrations/` (la migration `init` est volontairement en `IF NOT EXISTS` pour les bases créées avant Drizzle).
- **Démarrage** : `server/plugins/scheduler.ts` marque les exécutions restées « running » comme échouées, puis planifie toutes les tâches actives.
- **Contrat partagé** : `shared/types/backup.ts` (types) et `shared/schemas/task.ts` (schéma zod, utilisé par le formulaire ET l'API).

## Configuration

Toute la config passe par `runtimeConfig` (`nuxt.config.ts`), surchargée par des variables `NUXT_<CLE_EN_SNAKE_CASE>` lues depuis `.env` (git-ignoré ; modèle : `.env.example`). Exemple : `dbPath` → `NUXT_DB_PATH`. Ajouter toute nouvelle option de cette façon, jamais via `process.env` direct.

## Stack technique

- **Nuxt** (dernière version) — framework principal
- **Nuxt UI** (`@nuxt/ui`) — composants d'interface
- **Nuxt Icon** (`@nuxt/icon`) — icônes
- **Nuxt Img** (`@nuxt/image`) — images
- **SQLite** — base embarquée via le module natif `node:sqlite` de Node (aucune dépendance native)
- **Drizzle ORM** (`drizzle-orm@beta`, driver `drizzle-orm/node-sqlite`, synchrone) + `drizzle-kit@beta` pour les migrations

Pour toute question d'API sur ces modules, consulter la documentation à jour (versions récentes) plutôt que de se fier à la mémoire.

## Règles de codage

- **Séparation en couches** : ne pas mélanger présentation, logique métier et accès aux données. Les composants/pages ne font que de l'affichage et délèguent aux composables/services ; l'accès aux données (API, serveur) est isolé dans sa propre couche.
- **Principes SOLID** à respecter (responsabilité unique, dépendances vers des abstractions, etc.).
- **Code en anglais** : noms de variables, fonctions, fichiers, types, composants.
- **Commentaires en français**.

## Docker

`Dockerfile` (multi-stage, Node 26, utilisateur non-root) et `compose.yaml` (conteneur `backup-manager`) : `docker compose up --build` expose l'app sur 127.0.0.1 uniquement, port hôte réglable via `PORT` (variable ou `.env`, défaut 9090) ; le port interne reste 3000. Les migrations SQL sont copiées dans l'image vers `/app/migrations` (`NUXT_MIGRATIONS_FOLDER`). La base SQLite est lue via `NUXT_DB_PATH` (config de l'app, à ne pas confondre avec un éventuel `BACKUP_DB_PATH`, réservé à un dossier de destination de backup ; dossier hôte `BACKUP_DATA_DIR`, défaut `./data`, monté sur `/data` ; à créer au préalable, accessible en écriture à l'uid 1000). Les chemins source/destination des tâches sont ceux du conteneur : le HOME de l'hôte est monté sur `/host-home` (chemins à saisir sous ce préfixe) ; d'autres dossiers se montent via les bind mounts d'exemple (commentés) de `compose.yaml`.
