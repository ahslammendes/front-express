const REFRESH_INTERVAL_MS = 1000;

let pollingTimerId = null;
let isFetching = false;

/**
 * Retorna a URL padrão do endpoint considerando se a página foi aberta via HTTP/HTTPS ou arquivo local.
 */
function getDefaultApiUrl() {
  if (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') {
    return 'http://localhost:3000/api/datetime';
  }
  return `${window.location.origin}/api/datetime`;
}

/**
 * Atualiza o badge de status de conexão na interface.
 * @param {'online' | 'loading' | 'error'} state
 * @param {string} label
 */
function setStatusBadge(state, label) {
  const badge = document.getElementById('status-badge');
  badge.className = `badge badge--${state}`;
  badge.textContent = label;
}

/**
 * Exibe ou oculta a mensagem de erro na interface.
 * @param {string | null} message
 */
function setError(message) {
  const errorEl = document.getElementById('error-message');
  if (!message) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = message;
}

/**
 * Consome a API Express e renderiza os dados de data e hora na tela.
 */
async function fetchDateTime() {
  if (isFetching) return;

  const apiUrlInput = document.getElementById('api-url');
  const apiUrl = apiUrlInput.value.trim() || getDefaultApiUrl();

  isFetching = true;
  if (document.getElementById('hora').textContent === '--:--:--') {
    setStatusBadge('loading', 'Consultando...');
  }

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status} ao consultar ${apiUrl}`);
    }

    const payload = await response.json();

    document.getElementById('hora').textContent = payload.hora ?? '--:--:--';
    document.getElementById('data').textContent = payload.data ?? '--/--/----';
    document.getElementById('dia-semana').textContent = payload.diaSemana ?? '---';
    document.getElementById('fuso').textContent = payload.fusoHorario ?? '---';
    document.getElementById('iso').textContent = payload.iso ?? '---';
    document.getElementById('timestamp').textContent =
      payload.timestamp !== undefined ? String(payload.timestamp) : '---';
    document.getElementById('json-output').textContent = JSON.stringify(payload, null, 2);

    setError(null);
    setStatusBadge('online', 'Online');
  } catch (err) {
    setStatusBadge('error', 'Erro');
    setError(`Não foi possível consultar a API: ${err.message}`);
  } finally {
    isFetching = false;
  }
}

/**
 * Inicia ou interrompe a atualização automática a cada 1 segundo.
 */
function updatePollingState(enabled) {
  if (pollingTimerId !== null) {
    clearInterval(pollingTimerId);
    pollingTimerId = null;
  }

  if (enabled) {
    pollingTimerId = setInterval(fetchDateTime, REFRESH_INTERVAL_MS);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('api-url');
  const btnFetch = document.getElementById('btn-fetch');
  const autoRefreshToggle = document.getElementById('auto-refresh');

  apiUrlInput.value = getDefaultApiUrl();

  btnFetch.addEventListener('click', fetchDateTime);
  autoRefreshToggle.addEventListener('change', (event) => {
    updatePollingState(event.target.checked);
  });

  fetchDateTime();
  updatePollingState(autoRefreshToggle.checked);
});
