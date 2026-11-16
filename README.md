# Consulta de Data e Hora - API Express + Frontend

Aplicação full-stack em Node.js com Express que disponibiliza uma rota REST de consulta de data e hora (`America/Sao_Paulo`) e uma interface frontend que consome essa API em tempo real, preparada para deploy no Render.

## Rotas da API

- `GET /api/datetime` (também disponível em `GET /datetime` e `GET /api/data-hora`)
  Retorna um JSON com a data e hora atuais:
  ```json
  {
    "sucesso": true,
    "data": "16/11/2026",
    "hora": "20:00:00",
    "dataHora": "16/11/2026, 20:00:00",
    "diaSemana": "segunda-feira",
    "fusoHorario": "America/Sao_Paulo (BRT/GMT-3)",
    "iso": "2026-11-16T23:00:00.000Z",
    "timestamp": 1794870000000
  }
  ```
- `GET /health`
  Healthcheck retornando `{ "status": "ok" }`.
- `GET /`
  Serve a aplicação frontend (`public/index.html`) que consome `/api/datetime`.

## Executar localmente

```bash
npm install
npm start
```

Acesse `http://localhost:3000` no navegador para ver o frontend, ou `http://localhost:3000/api/datetime` para consultar diretamente a API.

## Deploy no Render

O repositório já possui o arquivo [`render.yaml`](./render.yaml) configurado como Blueprint:

1. Acesse [https://dashboard.render.com](https://dashboard.render.com) e faça login.
2. Clique em **New +** > **Blueprint** (ou **Web Service**).
3. Conecte sua conta GitHub e selecione o repositório `ahslammendes/front-express` (branch `main`).
4. Confirme os parâmetros (`Build Command: npm install`, `Start Command: npm start`) e finalize o deploy.
5. Após o deploy concluir, acesse a URL `https://<seu-servico>.onrender.com` para o frontend e `https://<seu-servico>.onrender.com/api/datetime` para a rota da API.
