const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONE = 'America/Sao_Paulo';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Formata a data e hora atual no fuso horário de Brasília (America/Sao_Paulo).
 * @param {Date} date - Instância de data a ser formatada.
 * @returns {object} Objeto estruturado com data, hora, dia da semana, fuso, ISO e timestamp.
 */
function buildDateTimePayload(date = new Date()) {
  const data = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const hora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date);

  const diaSemana = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    weekday: 'long',
  }).format(date);

  return {
    sucesso: true,
    data,
    hora,
    dataHora: `${data}, ${hora}`,
    diaSemana,
    fusoHorario: `${TIMEZONE} (BRT/GMT-3)`,
    iso: date.toISOString(),
    timestamp: date.getTime(),
  };
}

/**
 * Handler das rotas de consulta de data e hora.
 */
function handleGetDateTime(_req, res) {
  res.status(200).json(buildDateTimePayload(new Date()));
}

app.get(['/api/datetime', '/datetime', '/api/data-hora'], handleGetDateTime);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
