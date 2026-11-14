---
title: Exclusions de fichiers (glob)
description: Écarter des fichiers ou dossiers de l'archive avec des patterns glob.
order: 3
label: Exclusions
icon: i-lucide-filter-x
---

Les exclusions évitent d'archiver des fichiers inutiles (journaux, caches, dépendances).

## Saisie

Dans le champ **Exclusions** de la tâche, écrivez **un pattern par ligne** :

```text
*.log
node_modules
**/.cache/**
```

## Comment les patterns sont appliqués

Chaque élément du dossier source est testé :

- sur son **chemin relatif** au dossier source (par exemple `projet/logs/app.log`) ;
- et sur son **nom seul** (`app.log`).

Le pattern `*.log` écarte donc les fichiers `.log` à n'importe quelle profondeur, et `node_modules` écarte tout dossier de ce nom. Les fichiers cachés (commençant par un point) sont aussi concernés par les patterns.

Quand un dossier est exclu, son contenu l'est aussi.

## Vérifier le résultat

La page d'une exécution affiche le nombre d'**éléments exclus** et la liste des fichiers réellement archivés : filtrez-la par chemin pour confirmer qu'un fichier n'y figure pas (voir [Suivre les exécutions](/help/suivre-executions)).
