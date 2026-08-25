# Sistema PPGCC

Sistema de visualização dos dados acadêmicos do Programa de Pós-Graduação em
Ciência da Computação da UFPI.

## Estrutura

```text
Sistema_PPGCC/
├── frontend/   # aplicação React e snapshots estáticos
├── backend/    # API NestJS, Prisma e integração com Supabase
├── package.json
└── README.md
```

## Frontend

O frontend React está em [`frontend/`](frontend/). Para executá-lo:

```bash
cd frontend
npm install
npm start
```

Ou, a partir da raiz:

```bash
npm run frontend
```

A aplicação estará disponível em `http://localhost:3000`. O build e a
publicação no GitHub Pages continuam configurados no `package.json` do frontend:

```bash
cd frontend
npm run build
npm run deploy
```

## Backend

O backend NestJS está em [`backend/`](backend/README.md). A configuração do
Supabase está detalhada em
[`backend/docs/SUPABASE_SETUP.md`](backend/docs/SUPABASE_SETUP.md).

Após instalar e configurar o backend, ele pode ser iniciado pela raiz:

```bash
npm run backend
```

## Testes

```bash
npm run test:frontend
npm run test:backend
```

## Aplicação publicada

https://ppgcc-ufpi.github.io/Sistema_PPGCC/
