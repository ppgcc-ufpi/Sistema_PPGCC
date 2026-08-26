# Publicação da API no Render

O arquivo `render.yaml` na raiz configura um Web Service gratuito para a API. O
serviço usa o diretório `backend`, executa as migrations do Prisma durante o
build e verifica a saúde em `/api/health`.

## Antes de publicar

1. Confirme que `DATABASE_URL` usa a conexão com pooling do Neon.
2. Confirme que `DIRECT_URL` usa a conexão direta do Neon.
3. Faça commit das alterações e leve-as para a branch que será publicada.
4. No Render, selecione **New > Blueprint** e conecte este repositório.
5. No primeiro cadastro, informe `DATABASE_URL` e `DIRECT_URL` quando solicitado.
6. Não copie o arquivo `.env` nem cadastre `DATA_SOURCE_DIR` no Render.

O `JWT_SECRET` é gerado pelo próprio Render. `FRONTEND_URL` aceita a origem do
GitHub Pages (`https://ppgcc-ufpi.github.io`); a origem não inclui o caminho
`/Sistema_PPGCC`.

Depois do primeiro deploy, abra:

```text
https://<nome-do-servico>.onrender.com/api/health
```

Copie a URL HTTPS da API para a configuração de produção do frontend. Nunca
adicione `DATABASE_URL`, `DIRECT_URL` ou `JWT_SECRET` ao React.

## Limitação do plano gratuito

O Web Service gratuito entra em repouso após um período sem requisições. A
primeira chamada posterior pode demorar, mas os dados não são perdidos porque
ficam no Neon. O filesystem local do Render não deve ser usado como banco ou
como destino permanente de arquivos.

Como o comando de pre-deploy é um recurso pago, `prisma migrate deploy` está no
comando de build. Ao migrar para um plano pago, mova a migration para
`preDeployCommand`.
