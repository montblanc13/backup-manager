---
title: Créer sa première tâche de sauvegarde
description: Définir un dossier source, une destination et une planification, puis lancer un premier essai.
order: 1
label: Première tâche
icon: i-lucide-rocket
---

Une tâche décrit **quoi** sauvegarder, **où** déposer l'archive et **quand** le faire.

## Étapes

1. Sur la page d'accueil, cliquez sur **Nouvelle tâche**.
2. Renseignez le **nom**. Il sert aussi à nommer les archives (voir [Où sont les archives](/help/archives-restauration)).
3. Choisissez le **dossier source** : saisissez le chemin ou utilisez le bouton de parcours (icône dossier).
4. Choisissez la **destination** : le dossier où seront écrites les archives. Il est créé s'il n'existe pas.
5. Indiquez la **planification** au format cron (par défaut `0 3 * * *`, tous les jours à 03:00). Voir [Comprendre la planification cron](/help/planification-cron).
6. Ajoutez au besoin des **exclusions** (voir [Exclusions de fichiers](/help/exclusions)).
7. Laissez **Tâche active** activé, puis **Enregistrer**.

## Règles à connaître

- Le nom, la source, la destination et un cron valide sont obligatoires.
- La destination ne peut pas se trouver **à l'intérieur** du dossier source : la sauvegarde échouerait avec le message « La destination ne doit pas se trouver dans le dossier source ».
- Une tâche désactivée n'est plus planifiée, mais reste lançable à la main.

## Tester tout de suite

Ouvrez la tâche depuis la liste et cliquez sur **Lancer maintenant**. L'exécution apparaît dans l'historique ; consultez-la pour vérifier le résultat (voir [Suivre les exécutions](/help/suivre-executions)).

Une même tâche ne peut pas être exécutée deux fois en parallèle : un second lancement pendant qu'une exécution est en cours est refusé.

## Avec Docker

Les chemins saisis sont ceux **du conteneur**. Avec la configuration fournie, le dossier personnel de l'hôte est monté sur `/host-home` : saisissez par exemple `/host-home/Documents`.
