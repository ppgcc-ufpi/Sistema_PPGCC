# Backend do Observatório PPG

API NestJS com PostgreSQL hospedado no Neon, Prisma e autenticação JWT própria.

## Capacidades

- dados públicos sem autenticação;
- visões separadas para coordenação e docentes;
- escopos de visualização do contrato 3.8 do pipeline;
- ocultação global pela coordenação e individual pelo docente;
- sugestões, aprovação/rejeição e histórico de decisões;
- correções aprovadas aplicadas como camada sobre os dados importados;
- importação transacional que preserva decisões humanas;
- estrutura isolada por programa de pós-graduação.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npx prisma generate
npm run start:dev
```

Consulte [docs/NEON_SETUP.md](docs/NEON_SETUP.md) para preparar banco, JWT e a
primeira conta de coordenação.

Para publicar a API NestJS no Render, consulte
[docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md).

## Atualização dos dados

`DATA_SOURCE_DIR` deve apontar para `observatorioPPG/data/integrados`. O importador
aceita atualmente `metadados.schema_versao = 3.8`.

```bash
npm run db:import
npm run corrections:export
npm test
```

A importação atualiza os dados originais e os escopos calculados pelo pipeline,
mas não sobrescreve ocultações, sugestões, decisões ou correções aprovadas.

## Rotas principais

### Públicas

- `GET /api/public/dashboard?program=ppgcc-ufpi`
- `GET /api/public/faculty`
- `GET /api/public/productions`
- `GET /api/public/advising`
- `GET /api/public/projects`
- `GET /api/public/education`

### Autenticação

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

### Gestão autenticada

- `GET /api/dashboards/coordination`
- `GET /api/dashboards/faculty`
- `GET /api/records/coordination?type=PRODUCAO` — detalhes e flags da coordenação
- `GET /api/records/faculty?type=PRODUCAO` — detalhes e flags do docente
- `GET|POST /api/users` — coordenação
- `PATCH /api/users/:id` — coordenação
- `POST /api/suggestions`
- `GET /api/suggestions/mine`
- `GET /api/suggestions/coordination` — coordenação
- `POST /api/suggestions/:id/decision` — coordenação
- `PATCH /api/visibility/coordination/:type/:id`
- `PATCH /api/visibility/faculty/:type/:id`

Os valores aceitos em `:type` permanecem `PRODUCAO`, `ORIENTACAO` e `PROJETO`,
pois são enums persistidos pelo Prisma e compartilhados com o contrato do pipeline.

## Verificação

```bash
npm run lint
npm run build
npm test -- --runInBand
```

O frontend nunca deve receber `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, hashes
de senha, tokens de atualização, fontes internas ou decisões administrativas.
