# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions `vA.B.C` (A majeur, B mineur, C patch), source de vérité : `package.json`.

## v1.6.0 - 2026-11-14

### Fixed

- **Vulnérabilités des dépendances** : `package.json` définit des `overrides` qui forcent des versions corrigées dans `@nuxt/content` (dernière version publiée, qui embarque `zod@3.25.76` sensible à GHSA-mrhx-c7xc-m3w5 et `minimatch@10`, GHSA-g3hv-75wg-m249) : `zod` ^4.6.7 et `minimatch` ^11.0.1 (aussi pour `readdir-glob`). `npm audit` passe de 13 alertes (2 high, 4 moderate, 7 low) à 8 alertes low. À retirer quand `@nuxt/content` publiera des dépendances corrigées. Build, typecheck et rendu des guides vérifiés.

### Added

- **CI GitHub Actions** (`.github/workflows/ci.yml`) : typecheck et build sur Node 26.
- **Workflow de sécurité** (`.github/workflows/security.yml`) : `npm audit` (blocage à partir de moderate, rapport complet dans le résumé), Dependency Review sur les pull requests, CodeQL, Gitleaks (historique complet) et scan Trivy de l'image Docker. Exécuté sur `main`, les pull requests et chaque lundi. Actions épinglées par SHA.
- **Publication de l'image Docker sur GHCR** (`.github/workflows/publish.yml`) : sur un tag `vA.B.C`, vérifie que le tag correspond à `package.json`, construit, scanne (Trivy, blocage sur critique corrigeable) puis publie `ghcr.io/montblanc13/sla-backup-manager` en `linux/amd64` et `linux/arm64`, avec les tags `A.B.C`, `A.B` et `latest`, la provenance et le SBOM. `compose.yaml` accepte `APP_IMAGE` pour utiliser cette image à la place du build local.
- **Dependabot** (`.github/dependabot.yml`) : mises à jour hebdomadaires groupées (npm, GitHub Actions, Docker).
- **`SECURITY.md`** : politique de signalement privé des vulnérabilités.
- README : section « Qualité et sécurité ».

### Known

- `npm audit` : 8 alertes « low » restantes, toutes issues de `deepmerge` (aucune version corrigée publiée, dépendance de `@rollup/plugin-node-resolve` → `nitropack` → `nuxt`) et d'`esbuild` (fuite de fichiers limitée au serveur de développement sous Windows). Elles ne bloquent pas la CI.

## v1.5.2 - 2026-11-14

### Changed

- `README.md` réécrit pour le public : avertissement d'usage personnel et de sécurité, aperçu avec captures (`docs/images/`), démarrage rapide, configuration `.env` détaillée variable par variable (dont l'encadré sur la clé d'API optionnelle), Docker (rootless, droits, volumes), limites connues.
- `.env.example` : mise à jour de `HOST` et variables Docker (`APP_UID` / `APP_GID`).

### Fixed

- Docker rootless : le conteneur ne pouvait pas ouvrir la base SQLite (`unable to open database file`) car son uid 1000 ne correspond pas à l'utilisateur d'hôte. L'utilisateur du conteneur est réglable via `APP_UID` / `APP_GID` (`compose.yaml`, `.env.example`, README).

## v1.5.1 - 2026-11-14

### Fixed

- La version racine de `package-lock.json` (restée à 1.4.0 dans la v1.5.0) est alignée sur `package.json`.
- La rétention saisie dans le formulaire de tâche n'était pas enregistrée : le champ « Nombre max. d'archives » renvoie un nombre et le code appelait `.trim()` dessus, ce qui faisait échouer le calcul et envoyer `null`.

### Added

- La page d'une tâche affiche aussi sa politique de rétention.
- La liste des tâches affiche la politique de rétention de chaque tâche (nombre max d'archives et/ou volume max, ou « Illimitée »).

## v1.5.0 - 2026-11-14

Première version numérotée : elle regroupe les itérations 1.1.0 à 1.5.0 ci-dessous.

### Added

- **Rétention par tâche** : nombre maximum d'archives et/ou volume maximum (M = 1024², G = 1024³), appliquée après chaque sauvegarde réussie. Ne supprime que les archives de la tâche (motif strict `<slug>-AAAAMMJJ-HHMMSS.tar.gz`), jamais l'archive qui vient d'être créée. Les purges (archives supprimées, octets libérés, avertissement) sont consignées dans l'exécution. Migration `retention` (colonnes additives).
- **Guides d'aide** (Nuxt Content) sous `/help` : création de tâche, cron, exclusions, archives, suivi des exécutions, rétention, thèmes.
- **Thèmes et modes** : sélecteur clair / sombre / système et cinq thèmes de couleur (Ardoise, Émeraude, Indigo, Ambre, Rose), persistés par cookie.
- **Colonne de navigation gauche repliable** (tiroir sur mobile) contenant navigation, guides, sélecteurs de thème et version.
- **Version de l'application** affichée dans l'interface, lue depuis `package.json`.
- **Actualisation automatique** de l'accueil toutes les 5 s (suspendue quand l'onglet est masqué), avec indicateur.

### Changed

- Refonte de l'interface (hiérarchie typographique, badges de statut, tableaux, formulaires, pages tâche et exécution, typographie des guides).
- `README.md` réécrit pour décrire l'application, sa configuration et son déploiement Docker.

### Fixed

- Les migrations n'étaient pas appliquées en local lorsque `NUXT_MIGRATIONS_FOLDER` pointait vers un dossier vide hors du dépôt (configuration locale `.env`).
- `nuxt build` ne se terminait pas avec Nuxt Content : le planificateur est désormais ignoré pendant le prérendu.

### Infra

- `Dockerfile` : création de `/app/.data` accessible à l'utilisateur `node` (base interne de Nuxt Content). Build Docker non testé.
