# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

Gestionnaire de paquets : **npm**. Aucun linter ni framework de tests n'est encore configuré.

```bash
npm install        # installe les dépendances (lance aussi `nuxt prepare`)
npm run dev        # serveur de développement
npm run build      # build de production
npm run preview    # prévisualise le build
```

## Structure

Nuxt 4 : le code applicatif est dans `app/` (`app.vue`, `pages/`, `assets/css/main.css`). `app.vue` enveloppe l'application dans `<UApp>`, requis par Nuxt UI. Le CSS global importe `tailwindcss` puis `@nuxt/ui`.

## Stack technique

- **Nuxt** (dernière version) — framework principal
- **Nuxt UI** (`@nuxt/ui`) — composants d'interface
- **Nuxt Icon** (`@nuxt/icon`) — icônes
- **Nuxt Img** (`@nuxt/image`) — images

Pour toute question d'API sur ces modules, consulter la documentation à jour (versions récentes) plutôt que de se fier à la mémoire.

## Règles de codage

- **Séparation en couches** : ne pas mélanger présentation, logique métier et accès aux données. Les composants/pages ne font que de l'affichage et délèguent aux composables/services ; l'accès aux données (API, serveur) est isolé dans sa propre couche.
- **Principes SOLID** à respecter (responsabilité unique, dépendances vers des abstractions, etc.).
- **Code en anglais** : noms de variables, fonctions, fichiers, types, composants.
- **Commentaires en français**.
