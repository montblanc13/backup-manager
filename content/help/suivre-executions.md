---
title: Suivre les exécutions et consulter les fichiers archivés
description: Lire l'historique d'une tâche et la liste des fichiers embarqués dans chaque archive.
order: 5
label: Exécutions
icon: i-lucide-activity
---

## Historique d'une tâche

Ouvrez une tâche depuis la liste : le tableau **Historique des exécutions** indique pour chacune la date de début, l'état, le nombre de fichiers archivés et leur volume. Les états sont **En cours**, **Réussie** et **Échouée**. La liste de la page d'accueil se rafraîchit automatiquement toutes les 5 secondes.

## Détail d'une exécution

Cliquez sur une ligne pour ouvrir la page de l'exécution :

- **Fichiers archivés** et **volume des données** (taille non compressée) ;
- **Éléments exclus** par vos patterns ;
- début, fin et durée ;
- chemin de l'archive et sa taille compressée ;
- en cas d'échec, le **message d'erreur** (source introuvable, destination dans la source, droits d'écriture...).

## Fichiers embarqués

Pour une exécution non échouée, la liste des fichiers effectivement archivés est affichée avec leur taille. Elle est paginée par 50 et filtrable par chemin grâce au champ de recherche. Seuls les fichiers réguliers sont listés (pas les dossiers ni les liens).

La liste d'une exécution **échouée** n'est pas conservée.

## Au redémarrage de l'application

Une exécution restée « En cours » lors d'un arrêt de l'application est marquée comme échouée au démarrage suivant, et les tâches actives sont replanifiées.
