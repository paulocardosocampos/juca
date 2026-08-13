#!/bin/sh
set -e

echo "[juca] aplicando migrações do banco..."
node /app/prisma-cli/node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma

echo "[juca] verificando usuário administrador e configurações..."
node /app/scripts/bootstrap.mjs

# Vitrine de demonstração: só entra quando DEMO_DATA=true na stack.
if [ "${DEMO_DATA}" = "true" ]; then
  echo "[juca] DEMO_DATA=true — garantindo os veículos de demonstração..."
  node /app/scripts/demo-seed.mjs
fi

echo "[juca] iniciando o servidor na porta ${PORT:-3000}..."
exec "$@"
