# syntax=docker/dockerfile:1

# Node 26 : `node:sqlite` est embarqué sans flag (utilisé par la couche base de données)
ARG NODE_VERSION=26

# ---------- Étape 1 : installation des dépendances ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Installation reproductible, mise en cache tant que les manifestes ne changent pas
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- Étape 2 : build de production ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- Étape 3 : image d'exécution ----------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NUXT_DB_PATH=/data/backup-manager.db \
    NUXT_MIGRATIONS_FOLDER=/app/migrations
WORKDIR /app

# Le build Nitro est autonome (hors migrations SQL, copiées séparément ci-dessous)
COPY --from=build --chown=node:node /app/.output ./.output
# Migrations SQL (Drizzle) : absentes de `.output`, appliquées au démarrage par l'app
COPY --from=build --chown=node:node /app/server/database/migrations ./migrations

# Dossier de la base SQLite, appartenant à l'utilisateur non-root
# (un dossier hôte monté dessus doit être accessible en écriture à l'uid 1000)
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

# Utilisateur non-root fourni par l'image officielle (uid 1000)
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
