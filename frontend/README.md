# Frontend do Observatório PPG - PPGCC

Aplicação React publicada no GitHub Pages. Todos os dados exibidos pelos
dashboards são consultados nas APIs públicas hospedadas no Render.

## Configuração

As variáveis disponíveis estão em `.env.example`:

```env
REACT_APP_API_URL=https://sistema-ppgcc-api.onrender.com
REACT_APP_PROGRAM_ID=ppgcc-ufpi
```

Esses valores são públicos e não devem conter URLs do Neon, segredos JWT, senhas
ou tokens. O endereço padrão da API já está definido no código para o build do
GitHub Pages.

## Áreas da aplicação

- `/dashboard`: dashboard público alimentado pela API;
- `/login`: autenticação de docentes e coordenação;
- `/faculty`: área protegida do docente;
- `/coordination`: área protegida da coordenação;
- `/portal`: redirecionamento para a área correspondente ao perfil autenticado.

A sessão fica restrita à aba do navegador por meio de `sessionStorage`. O access
token é renovado automaticamente com o refresh token quando necessário e os
dois são removidos no logout ou ao fechar a aba.

Nas áreas protegidas, produções, orientações e projetos podem ser consultados
com seus critérios de visibilidade. A edição gera uma sugestão auditável: a
coordenação registra a aprovação ou rejeição, e somente correções aprovadas são
aplicadas sobre os dados importados.

## Verificação e publicação

```bash
npm test -- --watchAll=false
npm run build
npm run deploy
```
