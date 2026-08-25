# Backend do Sistema PPGCC

API NestJS para o Sistema PPGCC. O Supabase fornece PostgreSQL e autenticação;
as regras de negócio e autorização permanecem nesta API.

## O que já está preparado

- conexão PostgreSQL com Prisma;
- validação de tokens do Supabase Auth;
- perfis `COORDENACAO` e `DOCENTE`;
- vínculo seguro entre usuário e docente;
- endpoints iniciais de docentes e dashboards;
- importação dos cinco JSONs existentes;
- exportação de snapshots estáticos para contingência;
- endpoints públicos sanitizados, sem necessidade de conta;
- script de endurecimento que bloqueia acesso direto às tabelas pela Data API.

## Requisitos

- Node.js 20 ou superior;
- um projeto no Supabase;
- credenciais do banco e da API do Supabase.

## Configuração local

```bash
cd backend
npm install
cp .env.example .env
```

Preencha o `.env` conforme `docs/SUPABASE_SETUP.md`. Depois:

```bash
npx prisma generate
npx prisma migrate dev --name initial_schema
npm run db:import
npm run snapshot:export
npm run start:dev
```

A API ficará em `http://localhost:3001/api` e a verificação de saúde em:

```text
GET http://localhost:3001/api/health
```

## Endpoints públicos

Estas rotas não exigem conta ou token. Elas retornam somente registros aceitos
para integração e removem metadados administrativos internos.

| Método | Rota | Conteúdo |
|---|---|---|
| GET | `/api/public/dashboard` | totais gerais do programa |
| GET | `/api/public/docentes` | docentes e vínculos públicos |
| GET | `/api/public/producoes` | produções públicas integráveis |
| GET | `/api/public/orientacoes` | orientações públicas integráveis |
| GET | `/api/public/projetos` | projetos públicos integráveis |
| GET | `/api/public/formacoes` | formação pública dos docentes |

## Endpoints autenticados

Todos, exceto `health`, exigem `Authorization: Bearer <access_token>`.

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/docentes/me` | usuário vinculado a docente |
| GET | `/api/docentes` | coordenação |
| GET | `/api/docentes/:id` | coordenação |
| GET | `/api/dashboards/docente` | docente |
| GET | `/api/dashboards/coordenacao` | coordenação |

## Importação e snapshot

`npm run db:import` lê `DATA_SOURCE_DIR`. Por padrão, ele usa
`../frontend/src/data`, que é a localização dos JSONs do frontend.

`npm run snapshot:export` gera em `STATIC_FALLBACK_DIR`:

- `docentes.json`;
- `producoes.json`;
- `orientacoes.json`;
- `projetos.json`;
- `formacoes.json`;
- `metadados.json`.

O diretório padrão de saída é `../frontend/public/dados`.

O snapshot é deliberadamente público e usa os mesmos sanitizadores de
`/api/public`. Contas, logs, controles de revisão, fontes internas e registros
não integráveis nunca devem ser exportados para esse diretório.

## Segurança

O frontend usa apenas a chave publicável/anon do Supabase. Nunca envie senha do
banco, `DATABASE_URL`, `DIRECT_URL` ou uma chave `service_role` para o navegador.

Após criar o schema, execute `prisma/hardening.sql` no SQL Editor do Supabase.
Ele bloqueia `anon` e `authenticated` de acessarem as tabelas diretamente. A API
NestJS continuará acessando-as pela conexão privada do PostgreSQL.
