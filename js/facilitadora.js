/**
 * PAINEL DA FACILITADORA
 * Placar, Timer e Modo Projetor
 */

const GRUPOS_INFO = [
  { id: 1, nome: 'Ana',           cor: '#0bb4cc', corBg: '#e6f8fb' },
  { id: 2, nome: 'Joquebede',     cor: '#2d9e6a', corBg: '#e8f7f0' },
  { id: 3, nome: 'Maria',         cor: '#7c5cba', corBg: '#f2eefc' },
  { id: 4, nome: 'Rebeca',        cor: '#e04b9a', corBg: '#fde9f4' },
  { id: 5, nome: 'Rute',          cor: '#e07a28', corBg: '#fdf0e5' },
  { id: 6, nome: 'Sara',          cor: '#b8922a', corBg: '#fdf6e7' },
  { id: 7, nome: 'Lóide & Eunice',cor: '#c0392b', corBg: '#fdecea' },
];

let scores      = [0, 0, 0, 0, 0, 0, 0];
let timerTotal  = 60;
let timerLeft   = 60;
let timerRunning = false;
let timerInterval = null;

// ─── PLACAR ───────────────────────────────────────────────────────────────────

function renderScoreboard() {
  const grid = document.getElementById('scoreboard-grid');
  grid.innerHTML = '';

  GRUPOS_INFO.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'sc-card';
    card.id = 'sc-card-' + i;
    card.innerHTML = `
      <div class="sc-badge" style="background:${g.cor}">${g.id}</div>
      <div class="sc-name">${g.nome}</div>
      <div class="sc-controls">
        <button class="sc-btn sc-minus" onclick="updateScore(${i}, -1)">−</button>
        <span class="sc-value" id="sc-val-${i}">${scores[i]}</span>
        <button class="sc-btn sc-plus" style="background:${g.cor}" onclick="updateScore(${i}, 1)">+</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateScore(idx, delta) {
  scores[idx] = Math.max(0, scores[idx] + delta);
  document.querySelectorAll('#sc-val-' + idx).forEach(el => {
    el.textContent = scores[idx];
  });
  // highlight top scorer
  highlightLeader();
}

function highlightLeader() {
  const max = Math.max(...scores);
  document.querySelectorAll('.sc-card').forEach((card, i) => {
    card.classList.toggle('leader', scores[i] === max && max > 0);
  });
}

function resetScores() {
  if (!confirm('Deseja zerar todos os pontos?')) return;
  scores = scores.map(() => 0);
  GRUPOS_INFO.forEach((_, i) => {
    document.querySelectorAll('#sc-val-' + i).forEach(el => el.textContent = 0);
  });
  document.querySelectorAll('.sc-card').forEach(c => c.classList.remove('leader'));
}

// ─── TIMER ────────────────────────────────────────────────────────────────────

function updateTimerDisplay() {
  const m = Math.floor(timerLeft / 60);
  const s = timerLeft % 60;
  const txt = m > 0
    ? `${m}:${String(s).padStart(2, '0')}`
    : `${s}`;

  document.querySelectorAll('.timer-display').forEach(el => {
    el.textContent = txt;
    el.classList.remove('timer-urgent', 'timer-done');
    if (timerLeft <= 10 && timerLeft > 0) el.classList.add('timer-urgent');
    if (timerLeft <= 0) el.classList.add('timer-done');
  });

  // progress ring fill
  const pct = timerTotal > 0 ? timerLeft / timerTotal : 0;
  document.querySelectorAll('.timer-ring-fill').forEach(el => {
    const circumference = 2 * Math.PI * 54;
    el.style.strokeDasharray = circumference;
    el.style.strokeDashoffset = circumference * (1 - pct);
  });
}

function startPauseTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    setStartBtn('▶ Continuar');
  } else {
    if (timerLeft <= 0) { timerLeft = timerTotal; updateTimerDisplay(); }
    timerRunning = true;
    setStartBtn('⏸ Pausar');
    timerInterval = setInterval(() => {
      timerLeft--;
      updateTimerDisplay();
      if (timerLeft <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        setStartBtn('▶ Iniciar');
        playBuzzer();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerLeft = timerTotal;
  updateTimerDisplay();
  setStartBtn('▶ Iniciar');
}

function setDuration(seconds) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerTotal = seconds;
  timerLeft  = seconds;
  updateTimerDisplay();
  setStartBtn('▶ Iniciar');
  // mark active preset
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.sec) === seconds);
  });
}

function setStartBtn(label) {
  document.querySelectorAll('.btn-start-pause').forEach(b => b.textContent = label);
}

function playBuzzer() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.2, 0.4].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch(e) {}
}

// ─── MODO PROJETOR ────────────────────────────────────────────────────────────

function toggleProjector() {
  const isProjetor = document.body.classList.toggle('projector-mode');
  const btn = document.getElementById('btn-projetor');

  if (isProjetor) {
    btn.textContent = '⊠ Sair do Projetor';
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    btn.textContent = '📺 Modo Projetor';
    document.exitFullscreen?.().catch(() => {});
  }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('projector-mode')) {
    document.body.classList.remove('projector-mode');
    const btn = document.getElementById('btn-projetor');
    if (btn) btn.textContent = '📺 Modo Projetor';
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderScoreboard();
  updateTimerDisplay();

  document.querySelectorAll('.btn-start-pause').forEach(b =>
    b.addEventListener('click', startPauseTimer));
  document.querySelectorAll('.btn-reset-timer').forEach(b =>
    b.addEventListener('click', resetTimer));
  document.getElementById('btn-projetor')?.addEventListener('click', toggleProjector);
  document.getElementById('btn-reset-scores')?.addEventListener('click', resetScores);

  document.querySelectorAll('.preset-btn').forEach(b => {
    b.addEventListener('click', () => setDuration(parseInt(b.dataset.sec)));
  });

  // default preset highlight
  document.querySelector('.preset-btn[data-sec="60"]')?.classList.add('active');
});
