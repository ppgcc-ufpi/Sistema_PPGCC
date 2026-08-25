# Configuração do Supabase

## 1. Criar o projeto

1. Entre em `https://supabase.com/dashboard`.
2. Crie uma organização e um projeto.
3. Escolha uma região próxima dos usuários.
4. Guarde a senha do banco em um gerenciador de senhas.

## 2. Obter as variáveis

Em **Project Settings > API**, copie:

- Project URL para `SUPABASE_URL`;
- Publishable key ou anon key para `SUPABASE_ANON_KEY`.

Em **Project Settings > Database > Connect**, copie:

- URL do pooler/transação para `DATABASE_URL`;
- conexão direta para `DIRECT_URL`.

Se sua rede não suportar IPv6 para a conexão direta, use o Session Pooler na
porta indicada pelo Supabase como `DIRECT_URL` durante as migrations.

## 3. Criar o schema

No diretório `backend/`:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name initial_schema
```

Depois, execute `prisma/hardening.sql` no SQL Editor do Supabase.

## 4. Importar os dados atuais

Confirme `DATA_SOURCE_DIR` no `.env` e execute:

```bash
npm run db:import
```

O comando é idempotente: registros com o mesmo ID são atualizados. Ao final,
confira as contagens esperadas no terminal e na tabela `importacoes`.

## 5. Criar usuários

1. Abra **Authentication > Users**.
2. Crie uma conta de coordenação e ao menos uma de docente.
3. Copie os UUIDs das contas.
4. Adapte e execute `prisma/cadastrar-usuarios.example.sql`.

A conta docente precisa apontar para um `id_docente` existente. O backend usa
esse vínculo para impedir que um docente consulte dados de outro.

## 6. Testar autenticação

Faça login pelo cliente Supabase no frontend, copie temporariamente o access
token da sessão e teste:

```bash
curl http://localhost:3001/api/docentes/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Teste também que um docente recebe `403` ao consultar `/api/docentes`.

## 7. Gerar o fallback

```bash
npm run snapshot:export
```

O frontend ainda precisa receber um adaptador que tente a API primeiro e, em
caso de indisponibilidade, carregue `/dados/*.json`. Essa integração é a próxima
etapa e deve ser feita depois que a API responder localmente.

## 8. Produção

Ainda será necessário escolher onde hospedar o NestJS. O Supabase hospeda o
banco e o Auth, mas não hospeda esta API NestJS. No serviço escolhido, configure
as mesmas variáveis do `.env` como secrets, execute `npm run prisma:deploy` no
deploy e use `npm run start:prod` para iniciar a aplicação.

Configure também:

- `FRONTEND_URL` com a URL real do GitHub Pages;
- HTTPS obrigatório;
- logs e monitoramento;
- exportação periódica dos snapshots;
- backup externo para o plano gratuito.
