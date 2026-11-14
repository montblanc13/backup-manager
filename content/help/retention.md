---
title: Limiter l'espace occupé (rétention)
description: Supprimer automatiquement les plus anciennes archives d'une tâche au-delà d'un nombre ou d'un volume.
order: 6
label: Rétention
icon: i-lucide-recycle
---

## Principe

Dans la section **Rétention** du formulaire d'une tâche, vous pouvez limiter :

- le **nombre maximal d'archives** conservées (ex. 7) ;
- le **volume total maximal** des archives (ex. 500 M ou 20 G).

Laissez un champ vide pour ne pas le limiter. Sans aucune limite, rien n'est jamais supprimé. Si les deux limites sont renseignées, **les deux s'appliquent** : les plus anciennes archives sont supprimées tant que l'une des deux est dépassée.

Les unités sont binaires : 1 M = 1024 × 1024 octets, 1 G = 1024 × 1024 × 1024 octets.

## Quand et quoi

La purge a lieu à la fin de chaque sauvegarde **réussie**, de la plus ancienne à la plus récente (d'après la date du nom de l'archive).

- Seules les archives de **cette tâche** (`<nom>-AAAAMMJJ-HHMMSS.tar.gz`) sont concernées ; les autres fichiers du dossier, les fichiers `.partial` et les archives d'autres tâches ne sont jamais touchés.
- L'archive qui vient d'être créée est **toujours conservée**, même si elle dépasse à elle seule la limite de volume.
- Deux tâches dont le nom donne le même nom simplifié et qui partagent une destination se purgeraient mutuellement : donnez-leur des noms distincts.

## Suivi

La page d'une exécution indique le nombre d'archives supprimées et le volume libéré. Si la purge rencontre une erreur (droits, fichier verrouillé...), la sauvegarde reste réussie et un avertissement s'affiche.
