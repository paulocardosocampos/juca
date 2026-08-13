# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Imagem de produção do site Juca Carros Velhos (Next.js standalone + Prisma).
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# openssl é exigido pelos engines do Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Banco fictício: o build não consulta dados (todas as páginas são dinâmicas),
# mas o Prisma exige a variável presente ao gerar o client.
ENV DATABASE_URL="file:/tmp/build.db"
RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------
# CLI do Prisma numa árvore isolada. Copiar só a pasta "prisma" do node_modules
# do projeto não funciona: o CLI depende de pacotes transitivos (effect,
# @prisma/config, ...) que ficariam de fora. Aqui ele é instalado inteiro, na
# mesma versão exata resolvida pelo package-lock.
FROM base AS prismacli
WORKDIR /pcli
COPY --from=deps /app/node_modules/prisma/package.json ./version.json
RUN PRISMA_VERSION=$(node -p "require('./version.json').version") \
  && npm init -y > /dev/null \
  && npm install --omit=dev --no-audit --no-fund "prisma@${PRISMA_VERSION}" \
  && rm version.json

# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL="file:/data/juca.db"

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Servidor standalone + assets estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma client gerado (inclui o query engine) + bcryptjs, usados pelo app
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# CLI do Prisma isolado, usado só no boot para aplicar as migrações
COPY --from=prismacli /pcli/node_modules ./prisma-cli/node_modules

COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs scripts ./scripts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# /data guarda o banco SQLite; public/uploads guarda as fotos enviadas no admin.
# Ambos são montados como volumes na stack — aqui só garantimos dono correto.
RUN mkdir -p /data /app/public/uploads && chown -R nextjs:nodejs /data /app/public/uploads

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
