---
title: Comprendre la planification cron (et la suggestion par IA)
description: Lire une expression cron, vérifier les prochaines exécutions et se faire aider par la suggestion IA.
order: 2
label: Cron & IA
icon: i-lucide-calendar-clock
---

La planification d'une tâche est une expression **cron** à 5 champs :

```text
minute  heure  jour-du-mois  mois  jour-de-semaine
```

Le dimanche vaut `0`, le lundi `1`.

## Exemples

| Expression | Signification |
| --- | --- |
| `0 3 * * *` | tous les jours à 03:00 |
| `30 2 * * 1-5` | du lundi au vendredi à 02:30 |
| `0 */6 * * *` | toutes les 6 heures |
| `0 4 1 * *` | le 1er de chaque mois à 04:00 |

Les heures sont celles du **fuseau horaire du serveur**. Une expression invalide est refusée à l'enregistrement.

La page d'une tâche affiche sa **prochaine exécution**. Elle indique « Désactivée » si la tâche n'est pas active.

## Suggestion par IA

Sous le champ cron, un champ de description accepte une phrase libre, par exemple « chaque nuit à 2h, du lundi au vendredi ».

1. Saisissez la description puis quittez le champ : la demande part à ce moment.
2. Une proposition s'affiche avec l'expression, une explication et les **prochaines exécutions** pour vérification.
3. Cliquez sur **Utiliser** pour l'appliquer au champ cron, ou **Ignorer**. Rien n'est appliqué sans votre clic.

L'expression proposée est revalidée par le serveur avant d'être affichée. Si la description ne décrit pas une planification, un message l'indique.

### Activer la fonction

La suggestion nécessite une clé API Anthropic dans la variable `NUXT_ANTHROPIC_API_KEY` (fichier `.env`). Sans clé, la fonction est désactivée et le formulaire affiche que la suggestion est indisponible ; la saisie manuelle du cron reste possible. Le modèle se règle avec `NUXT_ANTHROPIC_MODEL`.
