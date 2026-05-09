/**
 * ENCONTRO DE MULHERES — COLUNA DE VIRTUDES
 * Lógica principal do jogo
 */

// ──────────────────────────────────────────────────────────────────────────────
// Estado global
// ──────────────────────────────────────────────────────────────────────────────
let state = {
  grupoAtual: null,
  dicaAtual: 0,
  passo: 'dicas',
  scrambleResolvido: false,
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function normalizar(str) {
  return str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '');
}

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function aplicarCor(grupo) {
  document.documentElement.style.setProperty('--group-color', grupo.cor);
  document.documentElement.style.setProperty('--group-bg', grupo.corBg);
}

function mostrarTela(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const tela = document.getElementById(id);
  if (tela) {
    tela.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Progress bar (5 passos)
// ──────────────────────────────────────────────────────────────────────────────

const PASSOS = ['dicas', 'personagem', 'desembaralhe', 'reflexao', 'desafio'];

function atualizarProgress(passoAtivo) {
  const idx = PASSOS.indexOf(passoAtivo);

  document.querySelectorAll('.step-circle').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i < idx) el.classList.add('done');
    else if (i === idx) el.classList.add('active');
  });

  document.querySelectorAll('.step-label').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  document.querySelectorAll('.step-line').forEach((el, i) => {
    el.classList.toggle('done', i < idx);
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Tela de seleção de grupo
// ──────────────────────────────────────────────────────────────────────────────

function inicializarSelecao() {
  document.querySelectorAll('.group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.group);
      const grupo = GRUPOS.find(g => g.id === id);
      if (!grupo) return;
      selecionarGrupo(grupo);
    });
  });
}

function selecionarGrupo(grupo) {
  state.grupoAtual = grupo;
  state.dicaAtual = 0;
  state.passo = 'dicas';
  state.scrambleResolvido = false;

  aplicarCor(grupo);
  atualizarHeader(grupo);
  mostrarTela('screen-game');
  mostrarDicas();
}

// ──────────────────────────────────────────────────────────────────────────────
// Header do jogo
// ──────────────────────────────────────────────────────────────────────────────

function atualizarHeader(grupo) {
  const badge = document.getElementById('header-badge');
  const title = document.getElementById('header-title');
  badge.textContent = grupo.id;
  badge.className = 'header-badge g' + grupo.id;
  title.textContent = 'GRUPO ' + grupo.id;
}

// ──────────────────────────────────────────────────────────────────────────────
// PASSO 1 — Dicas
// ──────────────────────────────────────────────────────────────────────────────

function mostrarDicas() {
  state.passo = 'dicas';
  atualizarProgress('dicas');

  const content = document.getElementById('game-content');
  const grupo = state.grupoAtual;

  content.innerHTML = `
    <h2>Quem sou eu?</h2>
    <p class="subtitle">Leia as dicas e tente adivinhar a personagem.</p>
    <div id="clues-container"></div>
    <button class="btn-reveal" id="btn-proxima-dica">✨ Revelar próxima dica</button>
  `;

  renderizarDicasVisiveis();
  document.getElementById('btn-proxima-dica').addEventListener('click', revelarProximaDica);

  const guessBox = document.getElementById('guess-box');
  guessBox.innerHTML = `
    <p>Já sabe quem é? Digite o nome abaixo!</p>
    <div class="guess-form">
      <input class="guess-input" id="guess-input" type="text" placeholder="Nome da personagem..." autocomplete="off" />
      <button class="guess-submit" id="guess-btn" title="Verificar">🔍</button>
    </div>
  `;
  guessBox.classList.remove('hidden');

  document.getElementById('guess-btn').addEventListener('click', verificarResposta);
  document.getElementById('guess-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verificarResposta();
  });

  if (state.dicaAtual === 0) {
    state.dicaAtual = 1;
    renderizarDicasVisiveis();
    atualizarBotaoReveal();
  }
}

function renderizarDicasVisiveis() {
  const grupo = state.grupoAtual;
  const container = document.getElementById('clues-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < state.dicaAtual; i++) {
    const div = document.createElement('div');
    div.className = 'clue-card';
    div.innerHTML = `<span class="clue-num">#${i + 1}</span><span class="clue-text">${grupo.dicas[i]}</span>`;
    container.appendChild(div);
  }
}

function atualizarBotaoReveal() {
  const btn = document.getElementById('btn-proxima-dica');
  if (!btn) return;
  if (state.dicaAtual >= state.grupoAtual.dicas.length) {
    btn.textContent = '✓ Todas as dicas foram reveladas';
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  } else {
    btn.textContent = '✨ Revelar próxima dica';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
}

function revelarProximaDica() {
  if (state.dicaAtual < state.grupoAtual.dicas.length) {
    state.dicaAtual++;
    renderizarDicasVisiveis();
    atualizarBotaoReveal();
  }
}

function verificarResposta() {
  const input = document.getElementById('guess-input');
  if (!input) return;
  const resposta = normalizar(input.value.trim());
  const nomeCorr = normalizar(state.grupoAtual.personagem);
  const primeiraPalavra = nomeCorr.split('')[0] ? nomeCorr : '';

  const acertou = resposta.length >= 2 && (
    nomeCorr.includes(resposta) || resposta.includes(nomeCorr.split('E')[0])
    || nomeCorr === resposta
    || nomeCorr.startsWith(resposta)
  );

  if (acertou) {
    mostrarPersonagem();
  } else {
    input.style.borderColor = '#e04b9a';
    input.value = '';
    input.placeholder = 'Tente novamente...';
    setTimeout(() => {
      input.style.borderColor = '';
      input.placeholder = 'Nome da personagem...';
    }, 1500);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PASSO 2 — Personagem revelada
// ──────────────────────────────────────────────────────────────────────────────

function mostrarPersonagem() {
  state.passo = 'personagem';
  atualizarProgress('personagem');

  const grupo = state.grupoAtual;
  const content = document.getElementById('game-content');
  const guessBox = document.getElementById('guess-box');
  guessBox.classList.add('hidden');

  content.innerHTML = `
    <h2>A personagem é...</h2>
    <p class="subtitle">Parabéns! Vocês descobriram quem representa o grupo!</p>

    <div class="char-reveal-card">
      <img src="${grupo.imagem}" alt="${grupo.personagem}" />
      <div class="char-reveal-info">
        <p class="char-label">✨ Personagem revelada</p>
        <h3>${grupo.personagem}</h3>
        <p class="char-verse-ref">${grupo.referencia}</p>
        <blockquote class="char-verse-full">${grupo.versiculoCompleto}</blockquote>
      </div>
    </div>

    <div class="secret-notice">
      <div class="notice-icon">🤫</div>
      <div>
        <p class="notice-title">Atenção: mantenham o segredo!</p>
        <p class="notice-text">
          Após descobrir quem é a personagem, o grupo <strong>não poderá revelar</strong> para os outros grupos.
          No <strong>desafio final</strong>, os demais grupos deverão adivinhar quem é a personagem e qual é a sua virtude!
        </p>
      </div>
    </div>

    <div class="game-nav">
      <button class="btn-game primary" id="btn-ir-desembaralhe">Continuar → Desembaralhe</button>
    </div>
  `;

  document.getElementById('btn-ir-desembaralhe').addEventListener('click', mostrarDesembaralhe);
}

// ──────────────────────────────────────────────────────────────────────────────
// PASSO 3 — Desembaralhe a Virtude
// ──────────────────────────────────────────────────────────────────────────────

function mostrarDesembaralhe() {
  state.passo = 'desembaralhe';
  atualizarProgress('desembaralhe');

  const grupo = state.grupoAtual;
  const content = document.getElementById('game-content');
  const guessBox = document.getElementById('guess-box');
  guessBox.classList.add('hidden');

  const letrasEmbaralhadas = embaralhar(normalizar(grupo.palavraVirtude).split(''));

  content.innerHTML = `
    <h2>Desembaralhe a Virtude</h2>
    <p class="subtitle">Reorganizem as letras para descobrir a virtude desta mulher.</p>

    <div class="scramble-card">
      <div class="scramble-header">
        <span class="scramble-icon">🔤</span>
        <strong>Desembaralhe a Virtude</strong>
      </div>
      <p class="scramble-sub">Reorganizem as letras para descobrir a virtude desta mulher</p>

      <div class="scramble-letters" id="scramble-letters">
        ${letrasEmbaralhadas.map(l => `<span class="letter-tile">${l}</span>`).join('')}
      </div>

      <div class="scramble-form">
        <input
          class="scramble-input"
          id="scramble-input"
          type="text"
          placeholder="QUAL É A VIRTUDE?"
          autocomplete="off"
          maxlength="20"
        />
        <button class="scramble-submit" id="scramble-btn" title="Verificar">✓</button>
      </div>

      <p class="scramble-error hidden" id="scramble-error">Ops! Tente novamente. 💭</p>
    </div>

    <div class="game-nav hidden" id="nav-pos-scramble">
      <button class="btn-game outline" id="btn-voltar-personagem">← Personagem</button>
      <button class="btn-game primary" id="btn-ir-reflexao">Continuar → Reflexão</button>
    </div>
  `;

  document.getElementById('scramble-btn').addEventListener('click', verificarScramble);
  document.getElementById('scramble-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verificarScramble();
  });

  document.getElementById('btn-voltar-personagem')?.addEventListener('click', mostrarPersonagem);
  document.getElementById('btn-ir-reflexao')?.addEventListener('click', mostrarReflexao);
}

function verificarScramble() {
  const input = document.getElementById('scramble-input');
  const errorEl = document.getElementById('scramble-error');
  const navEl = document.getElementById('nav-pos-scramble');
  if (!input) return;

  const resposta = normalizar(input.value.trim());
  const esperado = normalizar(state.grupoAtual.palavraVirtude);

  if (resposta === esperado) {
    state.scrambleResolvido = true;

    input.disabled = true;
    input.value = state.grupoAtual.palavraExibir;
    input.style.background = '#e8f7f0';
    input.style.borderColor = '#2d9e6a';
    input.style.color = '#2d9e6a';
    input.style.fontWeight = '700';
    input.style.textAlign = 'center';

    document.getElementById('scramble-btn').textContent = '✓';
    document.getElementById('scramble-btn').style.background = '#2d9e6a';

    errorEl.classList.add('hidden');

    const successMsg = document.createElement('p');
    successMsg.className = 'scramble-success';
    successMsg.textContent = '🎉 Parabéns! Vocês acertaram!';
    input.parentElement.insertAdjacentElement('afterend', successMsg);

    navEl.classList.remove('hidden');

    document.getElementById('btn-voltar-personagem').addEventListener('click', mostrarPersonagem);
    document.getElementById('btn-ir-reflexao').addEventListener('click', mostrarReflexao);

  } else {
    errorEl.classList.remove('hidden');
    input.style.borderColor = '#e04b9a';
    input.value = '';
    setTimeout(() => {
      input.style.borderColor = '';
      errorEl.classList.add('hidden');
    }, 2000);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PASSO 4 — Reflexão
// ──────────────────────────────────────────────────────────────────────────────

function mostrarReflexao() {
  state.passo = 'reflexao';
  atualizarProgress('reflexao');

  const grupo = state.grupoAtual;
  const content = document.getElementById('game-content');
  const guessBox = document.getElementById('guess-box');
  guessBox.classList.add('hidden');

  const perguntasHTML = grupo.perguntasReflexao
    .map((p, i) => `
      <div class="question-item">
        <span class="question-num">${i + 1}</span>
        <span class="question-text">${p}</span>
      </div>
    `).join('');

  content.innerHTML = `
    <h2>Reflexão em Grupo</h2>
    <p class="subtitle">Meditem juntas nesta virtude e respondam às perguntas.</p>

    <div class="virtue-card">
      <p class="virtue-label">🌸 Virtude do grupo</p>
      <h3>${grupo.virtude}</h3>
      <p>${grupo.reflexao}</p>
      <span class="verse-ref">📖 ${grupo.versiculo}</span>
    </div>

    <div class="questions-card">
      <div class="questions-header">
        <span>💬</span>
        <strong>Perguntas de Auto Confrontação</strong>
      </div>
      <p class="questions-sub">Discutam cada pergunta honestamente no grupo.</p>
      <div class="questions-list">
        ${perguntasHTML}
      </div>
    </div>

    <div class="game-nav">
      <button class="btn-game outline" id="btn-voltar-desembaralhe">← Voltar</button>
      <button class="btn-game primary" id="btn-ir-desafio">Continuar → Desafio Final</button>
    </div>
  `;

  document.getElementById('btn-voltar-desembaralhe').addEventListener('click', mostrarDesembaralhe);
  document.getElementById('btn-ir-desafio').addEventListener('click', mostrarDesafio);
}

// ──────────────────────────────────────────────────────────────────────────────
// PASSO 5 — Desafio Final + Sorteio
// ──────────────────────────────────────────────────────────────────────────────

function mostrarDesafio() {
  state.passo = 'desafio';
  atualizarProgress('desafio');

  const grupo = state.grupoAtual;
  const content = document.getElementById('game-content');
  const guessBox = document.getElementById('guess-box');
  guessBox.classList.add('hidden');

  content.innerHTML = `
    <h2>Desafio Final!</h2>
    <p class="subtitle">Hora de colocar à prova o que todos aprenderam.</p>

    <div class="challenge-card">
      <div class="trophy">🏆</div>
      <h3>Como funciona o desafio?</h3>
      <p>Cada grupo já conhece sua personagem e virtude. Agora os grupos vão se desafiar mutuamente!</p>

      <div class="challenge-steps">
        <div class="challenge-step">
          <span class="cs-num">1</span>
          <span class="cs-text">Um grupo por vez vai representar ou descrever sua personagem para os demais, <strong>sem revelar o nome</strong>.</span>
        </div>
        <div class="challenge-step">
          <span class="cs-num">2</span>
          <span class="cs-text">Os outros grupos tentam <strong>adivinhar quem é a personagem</strong> e <strong>qual é a virtude</strong> dela.</span>
        </div>
        <div class="challenge-step">
          <span class="cs-num">3</span>
          <span class="cs-text">O grupo que acertar ambas (personagem + virtude) <strong>ganha pontos</strong>!</span>
        </div>
        <div class="challenge-step">
          <span class="cs-num">4</span>
          <span class="cs-text">No final, todas celebram juntas as <strong>virtudes que Deus planta</strong> em cada mulher.</span>
        </div>
      </div>
    </div>

    <div class="secret-notice">
      <div class="notice-icon">🤫</div>
      <div>
        <p class="notice-title">Lembrete importante!</p>
        <p class="notice-text">
          Até o desafio começar, <strong>mantenham segredo</strong>! Não revelem para os outros grupos quem é a personagem do Grupo ${grupo.id}.
        </p>
      </div>
    </div>

    <!-- Sorteio -->
    <div class="sorteio-card">
      <p class="sorteio-label">🎲 Sorteio do Desafio</p>
      <h3>O que o grupo vai fazer?</h3>
      <p>Clique para sortear qual será o desafio do seu grupo!</p>
      <div class="sorteio-result hidden" id="sorteio-result">
        <span class="sorteio-group-num" id="sorteio-num">—</span>
      </div>
      <button class="btn-sorteio" id="btn-sortear">🎲 Sortear Desafio</button>
    </div>

    <div class="game-nav" style="margin-top: 24px;">
      <button class="btn-game outline" id="btn-voltar-reflexao">← Reflexão</button>
      <button class="btn-game primary" id="btn-novo-grupo">Escolher outro grupo</button>
    </div>
  `;

  document.getElementById('btn-sortear').addEventListener('click', realizarSorteio);
  document.getElementById('btn-voltar-reflexao').addEventListener('click', mostrarReflexao);
  document.getElementById('btn-novo-grupo').addEventListener('click', () => {
    mostrarTela('screen-select');
    document.documentElement.style.removeProperty('--group-color');
    document.documentElement.style.removeProperty('--group-bg');
  });
}

const DESAFIOS = [
  '💡 Dê 3 conselhos de vida sem citar o nome da personagem',
  '🎭 Encene uma mímica representando esta mulher — sem falar nada!',
  '🖼️ Desenhe em 60 segundos uma cena que represente esta personagem',
];

function realizarSorteio() {
  const btn = document.getElementById('btn-sortear');
  const result = document.getElementById('sorteio-result');
  const numEl = document.getElementById('sorteio-num');

  btn.disabled = true;
  btn.textContent = '🎲 Sorteando...';
  result.classList.remove('hidden', 'destaque');

  let count = 0;
  const interval = setInterval(() => {
    numEl.textContent = DESAFIOS[Math.floor(Math.random() * DESAFIOS.length)];
    count++;
    if (count > 16) {
      clearInterval(interval);
      const sorteado = DESAFIOS[Math.floor(Math.random() * DESAFIOS.length)];
      numEl.textContent = sorteado;
      result.classList.add('destaque');
      btn.textContent = '🔄 Sortear novamente';
      btn.disabled = false;
      btn.onclick = () => {
        result.classList.remove('destaque');
        realizarSorteio();
      };
    }
  }, 130);
}

// ──────────────────────────────────────────────────────────────────────────────
// Botão Sair
// ──────────────────────────────────────────────────────────────────────────────

function inicializarBotaoSair() {
  const btn = document.getElementById('btn-sair');
  if (!btn) return;
  btn.addEventListener('click', () => {
    mostrarTela('screen-select');
    document.documentElement.style.removeProperty('--group-color');
    document.documentElement.style.removeProperty('--group-bg');
    document.getElementById('guess-box').classList.add('hidden');
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  inicializarSelecao();
  inicializarBotaoSair();
  mostrarTela('screen-select');
});
