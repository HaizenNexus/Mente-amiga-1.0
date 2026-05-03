/**
 * JOGO DAS CORES — game.js
 * Arquitetura modular: Config → State → Engine → UI → Init
 */

/* ═══════════════════════════════════════════════════════
   1. CONFIG — dados e constantes
════════════════════════════════════════════════════════ */
const CONFIG = {
  ROUNDS:          10,
  TIMER_SECONDS:   5,
  CARDS_PER_ROUND: 6,     // grid 3×2 (mobile) ou 4×2 (tablet)
  XP: {
    CORRECT_BASE:  100,
    TIME_BONUS:    20,     // por segundo restante
    STREAK_BONUS:  50,     // a cada 3 acertos consecutivos
  },
  FEEDBACK_DURATION: 900, // ms
};

const COLORS = [
  { name: 'VERMELHO',  hex: '#e74c3c' },
  { name: 'AZUL',      hex: '#3498db' },
  { name: 'VERDE',     hex: '#2ecc71' },
  { name: 'AMARELO',   hex: '#f1c40f' },
  { name: 'LARANJA',   hex: '#e67e22' },
  { name: 'ROXO',      hex: '#9b59b6' },
  { name: 'ROSA',      hex: '#e91e8c' },
  { name: 'CIANO',     hex: '#00bcd4' },
  { name: 'BRANCO',    hex: '#ecf0f1' },
  { name: 'CINZA',     hex: '#95a5a6' },
  { name: 'MARROM',    hex: '#8d5524' },
  { name: 'ÍNDIGO',    hex: '#5c6bc0' },
  { name: 'LIMÃO',     hex: '#cddc39' },
  { name: 'CORAL',     hex: '#ff6b6b' },
];

/* ═══════════════════════════════════════════════════════
   2. STATE — estado reativo simples
════════════════════════════════════════════════════════ */
const State = (() => {
  let _state = {};
  const _listeners = [];

  function get()          { return { ..._state }; }
  function set(partial)   { _state = { ..._state, ...partial }; _listeners.forEach(fn => fn(_state)); }
  function subscribe(fn)  { _listeners.push(fn); }
  function reset() {
    set({
      screen:      'intro',
      round:       0,
      score:       0,
      correct:     0,
      wrong:       0,
      streak:      0,
      maxStreak:   0,
      timeLeft:    CONFIG.TIMER_SECONDS,
      locked:      false,
      targetColor: null,
    });
  }

  return { get, set, subscribe, reset };
})();

/* ═══════════════════════════════════════════════════════
   3. ENGINE — lógica do jogo
════════════════════════════════════════════════════════ */
const Engine = (() => {
  let timerInterval = null;

  /** Embaralha array (Fisher-Yates) */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Monta set de cores para a rodada */
  function buildRoundColors() {
    const shuffled = shuffle(COLORS);
    const target   = shuffled[0];
    const options  = shuffle(shuffled.slice(0, CONFIG.CARDS_PER_ROUND));
    // Garante que target está no conjunto
    if (!options.find(c => c.name === target.name)) {
      options[Math.floor(Math.random() * options.length)] = target;
    }
    return { target, options: shuffle(options) };
  }

  function startRound() {
    clearInterval(timerInterval);
    const { target, options } = buildRoundColors();
    State.set({ round: State.get().round + 1, targetColor: target, timeLeft: CONFIG.TIMER_SECONDS, locked: false });
    UI.renderRound(target, options);
    runTimer();
  }

  function runTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const { timeLeft, locked } = State.get();
      if (locked) return;
      const next = timeLeft - 1;
      State.set({ timeLeft: next });
      UI.updateTimer(next);
      if (next <= 0) {
        clearInterval(timerInterval);
        handleAnswer(null); // tempo esgotado
      }
    }, 1000);
  }

  function handleAnswer(chosenColor) {
    const { locked, targetColor, score, correct, wrong, streak, maxStreak, timeLeft } = State.get();
    if (locked) return;
    clearInterval(timerInterval);
    State.set({ locked: true });

    const isCorrect = chosenColor && chosenColor.name === targetColor.name;
    let xpGained = 0;

    if (isCorrect) {
      const newStreak  = streak + 1;
      const streakBonus = newStreak > 0 && newStreak % 3 === 0 ? CONFIG.XP.STREAK_BONUS : 0;
      xpGained = CONFIG.XP.CORRECT_BASE + (timeLeft * CONFIG.XP.TIME_BONUS) + streakBonus;
      State.set({
        score:   score + xpGained,
        correct: correct + 1,
        streak:  newStreak,
        maxStreak: Math.max(maxStreak, newStreak),
      });
    } else {
      State.set({ wrong: wrong + 1, streak: 0 });
    }

    UI.showFeedback(isCorrect, xpGained, chosenColor);
    UI.highlightCards(targetColor, chosenColor);

    setTimeout(() => {
      UI.hideFeedback();
      const { round } = State.get();
      if (round >= CONFIG.ROUNDS) {
        endGame();
      } else {
        startRound();
      }
    }, CONFIG.FEEDBACK_DURATION);
  }

  function endGame() {
    clearInterval(timerInterval);
    const { score } = State.get();
    const best = parseInt(localStorage.getItem('jdc_best') || '0', 10);
    const newRecord = score > best;
    if (newRecord) localStorage.setItem('jdc_best', score);
    UI.showResult(newRecord);
    UI.showScreen('result');
  }

  return { startRound, handleAnswer };
})();

/* ═══════════════════════════════════════════════════════
   4. UI — manipulação do DOM
════════════════════════════════════════════════════════ */
const UI = (() => {
  // Referências
  const screens     = {
    intro:  document.getElementById('screen-intro'),
    game:   document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
  };
  const els = {
    roundNum:        document.getElementById('round-num'),
    scoreDisplay:    document.getElementById('score-display'),
    xpBar:           document.getElementById('xp-bar'),
    timerCircle:     document.getElementById('timer-circle'),
    timerText:       document.getElementById('timer-text'),
    colorName:       document.getElementById('color-name'),
    promptUnderline: document.getElementById('prompt-underline'),
    colorGrid:       document.getElementById('color-grid'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    feedbackIcon:    document.getElementById('feedback-icon'),
    feedbackText:    document.getElementById('feedback-text'),
    feedbackXp:      document.getElementById('feedback-xp'),
    finalScore:      document.getElementById('final-score'),
    resultCorrect:   document.getElementById('result-correct'),
    resultWrong:     document.getElementById('result-wrong'),
    resultStreak:    document.getElementById('result-streak'),
    resultRecordMsg: document.getElementById('result-record-msg'),
    bestScoreDisplay:document.getElementById('best-score-display'),
  };

  const CIRCUMFERENCE = 2 * Math.PI * 18; // r=18

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (key === name) {
        el.classList.remove('exit');
        el.classList.add('active');
      } else if (el.classList.contains('active')) {
        el.classList.add('exit');
        setTimeout(() => { el.classList.remove('active', 'exit'); }, 400);
      }
    });
  }

  function renderRound(target, options) {
    const { round, score } = State.get();

    // Header
    els.roundNum.textContent     = round;
    els.scoreDisplay.textContent = score.toLocaleString();
    els.xpBar.style.width        = `${(round / CONFIG.ROUNDS) * 100}%`;

    // Prompt
    els.colorName.style.opacity   = '0';
    els.colorName.style.transform = 'translateY(8px)';
    setTimeout(() => {
      els.colorName.textContent     = target.name;
      els.colorName.style.color     = target.hex;
      els.colorName.style.opacity   = '1';
      els.colorName.style.transform = 'translateY(0)';
      els.colorName.style.transition = 'opacity 0.25s, transform 0.25s, color 0.3s';
      els.promptUnderline.style.background = `linear-gradient(90deg, ${target.hex}, ${target.hex}88)`;
    }, 100);

    // Grid
    els.colorGrid.innerHTML = '';
    options.forEach((color, idx) => {
      const card = document.createElement('div');
      card.className              = 'color-card';
      card.style.backgroundColor  = color.hex;
      card.style.animationDelay   = `${idx * 55}ms`;
      card.setAttribute('role', 'gridcell');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Cor ${idx + 1}`);

      const check = document.createElement('span');
      check.className = 'card-check';
      card.appendChild(check);

      card.addEventListener('click',    () => Engine.handleAnswer(color));
      card.addEventListener('keydown',  e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Engine.handleAnswer(color); } });
      els.colorGrid.appendChild(card);
    });

    // Timer inicial
    updateTimer(CONFIG.TIMER_SECONDS);
  }

  function updateTimer(seconds) {
    const ratio  = seconds / CONFIG.TIMER_SECONDS;
    const offset = CIRCUMFERENCE * (1 - ratio);
    els.timerCircle.style.strokeDashoffset = offset;
    els.timerText.textContent = seconds;

    if      (seconds <= 2) els.timerCircle.style.stroke = '#e74c3c';
    else if (seconds <= 3) els.timerCircle.style.stroke = '#f39c12';
    else                   els.timerCircle.style.stroke = 'var(--accent)';
  }

  function highlightCards(target, chosen) {
    const cards = els.colorGrid.querySelectorAll('.color-card');
    cards.forEach(card => {
      const bg = card.style.backgroundColor;
      // Converte hex → rgb para comparar
      const isTarget = colorMatchesHex(bg, target.hex);
      const isChosen = chosen && colorMatchesHex(bg, chosen.hex);

      if (isTarget) {
        card.classList.add('correct');
        card.querySelector('.card-check').textContent = '✓';
      } else if (isChosen && !isTarget) {
        card.classList.add('wrong');
        card.querySelector('.card-check').textContent = '✗';
      } else {
        card.classList.add('dim');
      }
      card.style.pointerEvents = 'none';
    });
  }

  function colorMatchesHex(rgb, hex) {
    const [r, g, b] = hexToRgb(hex);
    return rgb === `rgb(${r}, ${g}, ${b})`;
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function showFeedback(isCorrect, xpGained, chosen) {
    els.feedbackIcon.textContent = isCorrect ? '🎯' : (chosen ? '💥' : '⏰');
    els.feedbackText.textContent = isCorrect ? 'Correto!' : (chosen ? 'Errou!' : 'Tempo!');
    els.feedbackXp.textContent   = isCorrect ? `+${xpGained} XP` : '+0 XP';
    els.feedbackOverlay.classList.add('show');
  }
  function hideFeedback() { els.feedbackOverlay.classList.remove('show'); }

  function showResult(newRecord) {
    const { score, correct, wrong, maxStreak } = State.get();
    els.finalScore.textContent    = score.toLocaleString();
    els.resultCorrect.textContent = correct;
    els.resultWrong.textContent   = wrong;
    els.resultStreak.textContent  = maxStreak;
    els.resultRecordMsg.classList.toggle('hidden', !newRecord);
    refreshBestScore();
  }

  function refreshBestScore() {
    const best = localStorage.getItem('jdc_best') || '0';
    els.bestScoreDisplay.textContent = parseInt(best, 10).toLocaleString();
  }

  return { showScreen, renderRound, updateTimer, highlightCards, showFeedback, hideFeedback, showResult, refreshBestScore };
})();

/* ═══════════════════════════════════════════════════════
   5. INIT — eventos e arranque
════════════════════════════════════════════════════════ */
(function init() {
  State.reset();
  UI.refreshBestScore();

  // Botão Iniciar
  document.getElementById('btn-start').addEventListener('click', () => {
    State.reset();
    State.set({ screen: 'game' });
    UI.showScreen('game');
    Engine.startRound();
  });

  // Botão Jogar Novamente
  document.getElementById('btn-replay').addEventListener('click', () => {
    State.reset();
    State.set({ screen: 'game' });
    UI.showScreen('game');
    Engine.startRound();
  });

  // Botão Início
  document.getElementById('btn-home').addEventListener('click', () => {
    State.reset();
    UI.refreshBestScore();
    UI.showScreen('intro');
  });
})();