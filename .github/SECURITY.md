# Politique de sécurité

Backup Manager est une application à **usage individuel et personnel**, conçue pour tourner sur la machine de son utilisateur. Elle n'a volontairement aucune authentification et n'est pas prévue pour être exposée sur un réseau ou sur Internet (voir l'avertissement du [README](../README.md)).

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique** pour une faille. Utilisez le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**.

Le projet est maintenu à titre personnel, sans délai de réponse garanti.

## Hors périmètre

- L'absence d'authentification et l'accès au système de fichiers du serveur : ce sont des choix de conception liés à l'usage local.
- Toute vulnérabilité qui ne se manifeste que si l'application est volontairement exposée à un réseau non fiable.

## Surveillance automatique

Les workflows `.github/workflows/security.yml` et `.github/dependabot.yml` surveillent les dépendances npm, l'image Docker, le code (CodeQL) et les secrets.
