# Configuração do Neon e da autenticação

Use a URL com `-pooler` em `DATABASE_URL` e a conexão direta em `DIRECT_URL`.
O arquivo `.env` é local e não deve ser versionado.

Além das conexões, defina:

```env
JWT_SECRET=uma-chave-aleatoria-com-pelo-menos-32-bytes
JWT_ACCESS_SECONDS=900
JWT_REFRESH_DAYS=30
DEFAULT_PROGRAM_ID=ppgcc-ufpi
```

Gere `JWT_SECRET` com um gerador criptograficamente seguro. Não reutilize a senha
do banco e não envie a chave ao frontend.

## Primeira instalação

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:import
```

Depois, defina temporariamente `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`,
`PROGRAM_ID`, `PROGRAM_NAME` e `PROGRAM_ACRONYM` e execute:

```bash
npm run db:seed-admin
```

Remova `ADMIN_PASSWORD` do `.env` após criar a conta. Novos docentes devem ser
cadastrados pela coordenação e vinculados ao `id_docente` publicado pelo pipeline.
