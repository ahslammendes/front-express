const REFRESH_INTERVAL_MS = 1000;
const RING_CIRCUMFERENCE = 283;

let pollingTimerId = null;
let isFetching = false;
let requestCount = 0;

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
  if (badge) {
    badge.className = `badge badge--${state}`;
    badge.textContent = label;
  }

  const syncStateText = document.getElementById('sync-state-text');
  if (syncStateText) {
    syncStateText.textContent =
      state === 'online' ? 'SINCRONIZADO' : state === 'loading' ? 'CONSULTANDO...' : 'FALHA DE CONEXÃO';
    syncStateText.className = state === 'error' ? 'text-red-400' : 'text-mint';
  }
}

/**
 * Exibe ou oculta a mensagem de erro na interface.
 * @param {string | null} message
 */
function setError(message) {
  const errorEl = document.getElementById('error-message');
  if (!errorEl) return;
  if (!message) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = message;
}

/**
 * Atualiza o anel SVG de progresso do dia (24h) e os contadores de Horas/Minutos/Segundos.
 * @param {string} horaStr - Hora no formato "HH:mm:ss"
 */
function updateDayCycleRing(horaStr) {
  if (typeof horaStr !== 'string') return;
  const parts = horaStr.split(':').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return;

  const [hours, minutes, seconds] = parts;
  const totalSecondsInDay = 24 * 60 * 60;
  const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
  const percentage = Math.min(100, Math.max(0, (elapsedSeconds / totalSecondsInDay) * 100));
  const dashOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * percentage) / 100;

  const ringEl = document.getElementById('day-ring');
  if (ringEl) {
    ringEl.style.strokeDashoffset = String(dashOffset.toFixed(1));
  }

  const progressEl = document.getElementById('day-progress');
  if (progressEl) {
    progressEl.textContent = `${percentage.toFixed(1)}%`;
  }

  const hoursEl = document.getElementById('unit-hours');
  const minutesEl = document.getElementById('unit-minutes');
  const secondsEl = document.getElementById('unit-seconds');

  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

/**
 * Consome a API Express e renderiza os dados de data e hora na tela.
 */
async function fetchDateTime() {
  if (isFetching) return;

  const apiUrlInput = document.getElementById('api-url');
  const apiUrl = (apiUrlInput && apiUrlInput.value.trim()) || getDefaultApiUrl();

  isFetching = true;
  const horaEl = document.getElementById('hora');
  if (horaEl && horaEl.textContent.trim() === '--:--:--') {
    setStatusBadge('loading', 'Consultando...');
  }

  const startTime = performance.now();

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status} ao consultar ${apiUrl}`);
    }

    const payload = await response.json();
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    requestCount += 1;

    document.getElementById('hora').textContent = payload.hora ?? '--:--:--';
    document.getElementById('data').textContent = payload.data ?? '--/--/----';
    document.getElementById('dia-semana').textContent = payload.diaSemana ?? '---';
    document.getElementById('fuso').textContent = payload.fusoHorario ?? '---';
    document.getElementById('iso').textContent = payload.iso ?? '---';
    document.getElementById('timestamp').textContent =
      payload.timestamp !== undefined ? String(payload.timestamp) : '---';
    document.getElementById('json-output').textContent = JSON.stringify(payload, null, 2);

    const dataHoraCompletaEl = document.getElementById('data-hora-completa');
    if (dataHoraCompletaEl) {
      dataHoraCompletaEl.textContent = payload.dataHora ?? `${payload.data} ${payload.hora}`;
    }

    const latencyValEl = document.getElementById('latency-val');
    if (latencyValEl) {
      latencyValEl.textContent = `${latencyMs} ms`;
    }

    const navLatencyEl = document.getElementById('nav-latency');
    if (navLatencyEl) {
      navLatencyEl.textContent = `PING: ${latencyMs}MS`;
    }

    const reqCountEl = document.getElementById('req-count');
    if (reqCountEl) {
      reqCountEl.textContent = String(requestCount);
    }

    updateDayCycleRing(payload.hora);
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

/**
 * Inicializa as animações do Aetheris Design System (Preloader, GSAP, ScrollTrigger, Lenis e Unicorn Studio).
 */
function initAetherisDesignSystem() {
  // 1. Inicializa cena WebGL Aurora (Unicorn Studio)
  if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
    try {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    } catch (_err) {
      // Fallback silencioso caso WebGL não esteja disponível no ambiente
    }
  }

  // 2. Inicializa Smooth Scroll (Lenis)
  if (typeof window.Lenis === 'function') {
    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // 3. Preloader + GSAP Entrance & ScrollTrigger Reveals
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');

  const runPostLoadAnimations = () => {
    if (!window.gsap) {
      document.querySelectorAll('.hero-anim').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    window.gsap.to('.hero-anim', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
    });

    document.querySelectorAll('.reveal').forEach((el) => {
      window.gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: window.ScrollTrigger
            ? {
                trigger: el,
                start: 'top 90%',
                end: 'bottom 10%',
                toggleActions: 'play none none reverse',
              }
            : undefined,
        }
      );
    });
  };

  if (preloader && loaderBar) {
    let width = 0;
    const loadInterval = setInterval(() => {
      width += Math.random() * 28 + 12;
      if (width >= 100) {
        width = 100;
        loaderBar.style.width = '100%';
        clearInterval(loadInterval);

        if (window.gsap) {
          window.gsap.to(preloader, {
            yPercent: -100,
            duration: 0.85,
            ease: 'power4.inOut',
            delay: 0.15,
            onComplete: () => {
              preloader.style.display = 'none';
              runPostLoadAnimations();
            },
          });
        } else {
          preloader.style.display = 'none';
          runPostLoadAnimations();
        }
      } else {
        loaderBar.style.width = `${width}%`;
      }
    }, 60);
  } else {
    runPostLoadAnimations();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('api-url');
  const btnFetch = document.getElementById('btn-fetch');
  const autoRefreshToggle = document.getElementById('auto-refresh');

  if (apiUrlInput) {
    apiUrlInput.value = getDefaultApiUrl();
  }

  if (btnFetch) {
    btnFetch.addEventListener('click', fetchDateTime);
  }

  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener('change', (event) => {
      updatePollingState(event.target.checked);
    });
  }

  fetchDateTime();
  updatePollingState(autoRefreshToggle ? autoRefreshToggle.checked : true);
  initAetherisDesignSystem();
});
