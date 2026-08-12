# Deploy no Docker Swarm (Portainer + Traefik)

Site: **https://juca.pcmidialabs.com.br**
Imagem: **ghcr.io/paulocardosocampos/juca:latest** (construída pelo GitHub Actions)

O site roda como **um único serviço**: Next.js + banco SQLite em volume. Não
precisa de container de banco separado.

---

## 1. Antes de tudo: descubra 3 valores do seu Traefik

Rode na VPS (nó manager):

```bash
docker service ls --filter name=traefik
docker network ls --filter driver=overlay
docker service inspect $(docker service ls --filter name=traefik -q) \
  --format '{{range .Spec.TaskTemplate.Networks}}REDE: {{.Target}}{{"\n"}}{{end}}{{range .Spec.TaskTemplate.ContainerSpec.Args}}ARG: {{.}}{{"\n"}}{{end}}'
```

Anote:

| O que | Onde aparece | Exemplos comuns |
|---|---|---|
| Rede overlay do Traefik | linhas `REDE:` | `network_public`, `traefik-public`, `proxy` |
| Entrypoint HTTPS | arg `--entrypoints.<nome>.address=:443` | `websecure`, `https` |
| Certresolver | arg `--certificatesresolvers.<nome>...` | `letsencryptresolver`, `le` |

Se algum valor for diferente do que está no `stack.yml`, ajuste os pontos
marcados com **AJUSTE** naquele arquivo.

## 2. Aponte o DNS

No painel do domínio, crie um registro **A** para `juca` apontando para o IP da
VPS (o mesmo das outras stacks). Confirme com `nslookup juca.pcmidialabs.com.br`
antes de seguir — o Let's Encrypt só emite o certificado se o DNS já resolver.

## 3. Publique a imagem

O push para a branch `main` dispara o workflow **Publicar imagem Docker**
(aba *Actions* no GitHub). Ao terminar, a imagem estará em
`ghcr.io/paulocardosocampos/juca:latest`.

**Torne o pacote público** (uma vez só): GitHub → seu perfil → *Packages* →
`juca` → *Package settings* → *Change visibility* → **Public**. Assim o Swarm
baixa a imagem sem autenticação.

> Se preferir manter privado: na VPS rode
> `docker login ghcr.io -u paulocardosocampos` (senha = um Personal Access Token
> com escopo `read:packages`) e, ao implantar por linha de comando, use
> `docker stack deploy --with-registry-auth`.

## 4. Crie a stack no Portainer

*Stacks* → **Add stack** → nome `juca` → **Web editor** → cole o conteúdo de
[`stack.yml`](./stack.yml) já ajustado.

Preencha antes de implantar:

- **`AUTH_SECRET`** — gere com `openssl rand -base64 33`
- **`ADMIN_PASSWORD`** — a senha de acesso ao `/admin`
- **`AUTH_URL`** — precisa ser exatamente `https://juca.pcmidialabs.com.br`.
  Sem ela o login monta os redirecionamentos com o endereço interno do
  container (`0.0.0.0:3000`) em vez do domínio.

Clique em **Deploy the stack**.

## 5. Confira

```bash
docker service ps juca_juca --no-trunc     # estado das tarefas
docker service logs -f juca_juca           # deve mostrar as 3 etapas do boot
```

O log esperado na primeira subida:

```
[juca] aplicando migrações do banco...
[juca] verificando usuário administrador e configurações...
[juca] iniciando o servidor na porta 3000...
```

Depois acesse **https://juca.pcmidialabs.com.br** e faça login em
`/admin` com o usuário `admin` e a senha que você definiu.

---

## Atualizar o site depois

1. `git push` na branch `main` (o Actions reconstrói a imagem);
2. no Portainer: *Stacks* → `juca` → **Update the stack** com a opção
   **Re-pull image** marcada.

Como o `update_config` está em `stop-first`, o container antigo é encerrado
antes do novo subir — isso garante que nunca haja dois processos escrevendo no
mesmo arquivo SQLite (custo: alguns segundos de indisponibilidade).

## Backup (importante)

Tudo o que não pode ser perdido está em dois volumes: `juca_juca_data`
(banco) e `juca_juca_uploads` (fotos das peças).

```bash
# Backup
docker run --rm -v juca_juca_data:/data -v /root/backups:/bkp alpine \
  tar czf /bkp/juca-db-$(date +%F).tar.gz -C /data .
docker run --rm -v juca_juca_uploads:/up -v /root/backups:/bkp alpine \
  tar czf /bkp/juca-fotos-$(date +%F).tar.gz -C /up .
```

Vale colocar esses dois comandos num cron diário.

---

## Perguntas frequentes

**SQLite aguenta?** Sim, para este caso. O gargalo do SQLite é escrita
concorrente — aqui só o gestor escreve (cadastro de veículos e peças), e os
visitantes apenas leem. Ele roda no disco local, sem latência de rede.

**E se um dia precisar de Postgres?** A migração é pequena: trocar
`provider = "postgresql"` em `prisma/schema.prisma`, apontar `DATABASE_URL`
para o Postgres que já existe na VPS, apagar a pasta `prisma/migrations` e
gerar uma nova com `npx prisma migrate dev --name init`. O código da aplicação
não muda.

**Por que 1 réplica só?** Duas réplicas escrevendo no mesmo arquivo SQLite
corromperiam o banco, e cada uma teria seu próprio volume de fotos. Para
escalar horizontalmente seria necessário Postgres + storage compartilhado
(S3/MinIO) para as imagens.

**As fotos somem quando eu atualizo a stack?** Não — ficam no volume
`juca_uploads`, que sobrevive a redeploys. Só some se você remover o volume.
