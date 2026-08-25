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

## Endpoints iniciais

Todos, exceto `health`, exigem `Authorization: Bearer <access_token>`.

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/health` | público |
| GET | `/api/docentes/me` | usuário vinculado a docente |
| GET | `/api/docentes` | coordenação |
| GET | `/api/docentes/:id` | coordenação |
| GET | `/api/dashboards/docente` | docente |
| GET | `/api/dashboards/coordenacao` | coordenação |

## Importação e snapshot

`npm run db:import` lê `DATA_SOURCE_DIR`. Por padrão, ele usa `../src/data`, que
é a localização atual dos JSONs. Caso o frontend seja movido para `frontend/`,
altere para `../frontend/src/data`.

`npm run snapshot:export` gera em `STATIC_FALLBACK_DIR`:

- `docentes.json`;
- `producoes.json`;
- `orientacoes.json`;
- `projetos.json`;
- `formacoes.json`;
- `metadados.json`.

Enquanto o frontend ainda estiver na raiz, use `../public/dados`. Depois da
separação completa, use `../frontend/public/dados`.

## Segurança

O frontend usa apenas a chave publicável/anon do Supabase. Nunca envie senha do
banco, `DATABASE_URL`, `DIRECT_URL` ou uma chave `service_role` para o navegador.

Após criar o schema, execute `prisma/hardening.sql` no SQL Editor do Supabase.
Ele bloqueia `anon` e `authenticated` de acessarem as tabelas diretamente. A API
NestJS continuará acessando-as pela conexão privada do PostgreSQL.
