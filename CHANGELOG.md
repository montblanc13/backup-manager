# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions `vA.B.C` (A majeur, B mineur, C patch), source de vérité : `package.json`.

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
