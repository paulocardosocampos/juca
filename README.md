# 🚛 Juca Carros Velhos — Sistema + Loja Online

Sistema web do **Desmanche Juca Carros Velhos** (Bariri/SP — desmanche legalizado pelo DETRAN):
gestão de veículos arrematados em leilão + vitrine pública de peças.

## O que o sistema faz

**Loja pública** (`/`)
- Catálogo de peças com filtros por marca, tipo e busca (`/pecas`)
- Página de cada peça com fotos, preço, botão de WhatsApp com mensagem pronta e link do Mercado Livre
- Pátio de veículos em desmanche (`/veiculos`), Sobre/Contato com mapa (`/sobre`)

**Área administrativa** (`/admin`)
- Dashboard com KPIs (investido em leilões × vendido, estoque, avaliações pendentes)
- Cadastro de veículo integrado à **tabela FIPE**: escolhe marca → modelo → ano e o sistema
  detecta portas, motor, carroceria e câmbio, e sugere a família do motor (Fire, AP, VHC...)
- **Checklist automático de ~130–150 peças** gerado conforme as características do veículo
- Cada peça pode ser marcada como: Avaliar · À venda (com preço) · Vendida · Sucata (venda por
  peso) · Descarte — com ações em massa por grupo
- Fotos de veículos e peças, link do anúncio no ML, destaque na vitrine
- Dados do leilão (leiloeiro, lote, valor de arremate) são **privados** — nunca aparecem na loja

## Rodando

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite (dev.db) e roda o seed
npm run dev              # http://localhost:3000
```

**Login do admin:** usuário `admin` · senha `juca2026`
(troque a senha editando o seed ou o registro no banco — `npm run db:studio`)

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Prisma + SQLite (local) — para nuvem, trocar o `datasource` para Postgres
- Auth.js (NextAuth v5) com credenciais
- API FIPE gratuita (parallelum.com.br) com cache de 24h no servidor

## Estrutura

```
prisma/            schema + seed (admin, configurações, veículos-demo)
src/lib/           parts-catalog (gabarito de peças), part-generator,
                   vehicle-parser (FIPE → atributos), motor-families, fipe, whatsapp
src/app/(site)/    loja pública
src/app/admin/     área administrativa (protegida)
src/app/api/       proxy FIPE (autenticado) + upload de fotos
public/uploads/    fotos enviadas pelo admin
```

## Produção

O site roda em Docker Swarm (Portainer + Traefik) em
**https://juca.pcmidialabs.com.br**. O passo a passo completo está em
[DEPLOY.md](./DEPLOY.md).

Resumo: cada push na `main` dispara o workflow do GitHub Actions, que publica
`ghcr.io/paulocardosocampos/juca:latest` no GHCR; no Portainer basta atualizar
a stack ([stack.yml](./stack.yml)) com a opção de re-pull da imagem.

Arquivos envolvidos:

```
Dockerfile               imagem de produção (Next standalone + Prisma)
docker-entrypoint.sh     migrate deploy → bootstrap → start
scripts/bootstrap.mjs    cria admin e configurações (sem dados de demonstração)
stack.yml                stack do Swarm com as labels do Traefik
.github/workflows/       build e push da imagem para o GHCR
```

Dados persistentes ficam em dois volumes: `juca_data` (banco SQLite) e
`juca_uploads` (fotos das peças).
