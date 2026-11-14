# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versions `vA.B.C` (A majeur, B mineur, C patch), source de vérité : `package.json`.

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
