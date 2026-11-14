---
title: Où sont les archives et comment les restaurer
description: Nom et emplacement des archives .tar.gz, et commandes pour les lister ou les extraire.
order: 4
label: Archives
icon: i-lucide-archive
---

## Emplacement et nom

Chaque exécution réussie produit **une archive** `.tar.gz` dans le dossier de destination de la tâche :

```text
<nom-de-la-tâche>-AAAAMMJJ-HHMMSS.tar.gz
```

Le nom de la tâche est simplifié (minuscules, sans accents, tirets) et la date est l'heure locale du serveur. Exemple : `documents-20261114-030000.tar.gz`.

Le chemin complet et la taille compressée sont affichés sur la page de l'exécution.

L'archive est d'abord écrite sous le nom `.partial`, puis renommée une fois terminée : un fichier `.tar.gz.partial` est le reste d'une exécution interrompue et ne doit pas être utilisé. Si une archive du même nom existe déjà, la sauvegarde échoue plutôt que de l'écraser.

## Conservation

Par défaut, l'application **ne supprime aucune archive**. Pour éviter de saturer la destination, définissez une limite de **rétention** dans la tâche (nombre d'archives et/ou volume total) : voir [Limiter l'espace occupé (rétention)](/help/retention).

## Lister et restaurer

Avec l'outil `tar` standard :

```bash
# Lister le contenu
tar -tzf documents-20261114-030000.tar.gz

# Tout restaurer dans un dossier
mkdir -p /chemin/restauration
tar -xzf documents-20261114-030000.tar.gz -C /chemin/restauration

# Restaurer un seul fichier (chemin relatif au dossier source)
tar -xzf documents-20261114-030000.tar.gz -C /chemin/restauration ./rapport/bilan.pdf
```

Les chemins dans l'archive sont **relatifs au dossier source**. Utilisez la liste des fichiers de l'exécution pour retrouver le chemin exact à restaurer.

Avec Docker, l'archive se trouve dans le dossier hôte monté sur la destination (par exemple sous votre HOME si vous avez saisi un chemin `/host-home/...`).
