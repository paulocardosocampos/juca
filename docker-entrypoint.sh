#!/bin/sh
set -e

echo "[juca] aplicando migrações do banco..."
node /app/prisma-cli/node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma

echo "[juca] verificando usuário administrador e configurações..."
node /app/scripts/bootstrap.mjs

echo "[juca] iniciando o servidor na porta ${PORT:-3000}..."
exec "$@"
