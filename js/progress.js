/* ============================================================
   MENTE AMIGA — Núcleo de Progresso (progress.js)
   ------------------------------------------------------------
   Fonte ÚNICA de XP, níveis, medalhas, sequência (streak) e
   histórico de atividades. Tudo é salvo em localStorage['ma-progress'].

   Este arquivo NÃO mexe em tema, navbar nem em nenhum elemento dos
   jogos — só guarda dados e mostra um toast de recompensa. Por isso é
   seguro carregá-lo em qualquer página de jogo.

   USO (ao terminar um jogo):
     MAProgress.recordGame({
       name: 'Jogo das Cores',   // aparece no histórico
       icon: '🎨',
       xp:   120,                // XP a ganhar (já calculado pelo jogo)
       score: 1450,              // pontuação bruta (opcional)
       flags: { race: 1450 },    // marca progresso de medalhas (opcional)
       countAsGame: true         // conta como "jogo jogado" (padrão: true)
     });

   A função grava XP, sobe de nível, atualiza a sequência diária,
   registra a atividade, concede medalhas automaticamente e mostra
   os avisos (toasts). Retorna { prog, reward, leveledUp, newMedals }.

   CEO: Pedro Henrique © 2026
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'ma-progress';
  var LEVEL_XP = 100;          // XP necessário por nível

  /* ─── Catálogo de medalhas (fonte única — usado aqui e na página de progresso) ─── */
  var MEDALS = [
    { id:'primeiro-jogo',   icon:'🎮', name:'Primeiro Jogo!',   cond:'Jogue 1 jogo',          req:{ games:1 } },
    { id:'cinco-jogos',     icon:'🕹️', name:'Jogador!',         cond:'Jogue 5 jogos',         req:{ games:5 } },
    { id:'dez-jogos',       icon:'🏆', name:'Gamer Incrível!',  cond:'Jogue 10 jogos',        req:{ games:10} },
    { id:'nivel-5',         icon:'⭐', name:'Nível 5!',         cond:'Alcance o nível 5',     req:{ level:5 } },
    { id:'nivel-10',        icon:'🌟', name:'Nível 10!',        cond:'Alcance o nível 10',    req:{ level:10} },
    { id:'xp-100',          icon:'💎', name:'100 XP!',          cond:'Ganhe 100 XP',          req:{ xp:100  } },
    { id:'xp-500',          icon:'👑', name:'500 XP!',          cond:'Ganhe 500 XP',          req:{ xp:500  } },
    { id:'streak-3',        icon:'🔥', name:'Em Chama!',        cond:'3 dias seguidos',       req:{ streak:3} },
    { id:'streak-7',        icon:'🌈', name:'Uma Semana!',      cond:'7 dias seguidos',       req:{ streak:7} },
    { id:'rotina-completa', icon:'🏅', name:'Dia Perfeito!',    cond:'Complete a rotina',     req:{ rotina:1} },
    { id:'ia-conversa',     icon:'🤖', name:'Amigo da Luna!',   cond:'Converse com a Luna',   req:{ ia:1    } },
    { id:'educacao-5',      icon:'📚', name:'Estudioso!',       cond:'5 aulas',               req:{ edu:5   } },
    { id:'respiracao',      icon:'🫧', name:'Zen Mestre!',      cond:'Complete respiração',   req:{ breath:1} },
    { id:'coloriu',         icon:'🎨', name:'Artista!',         cond:'Salve um desenho',      req:{ draw:1  } },
    { id:'fala-comunicador',icon:'🗣️', name:'Comunicador!',     cond:'Treine a fala',         req:{ fala:1  } },
    { id:'personagem',      icon:'🦸', name:'Herói Escolhido!', cond:'Escolha um personagem', req:{ char:1  } },
    { id:'corrida-100',     icon:'🏎️', name:'Piloto de Elite!', cond:'100 pts na corrida',    req:{ race:100} },
  ];

  /* ─── Nomes de cada nível ─── */
  var LEVEL_NAMES = [
    '', 'Explorador Iniciante', 'Aventureiro Curioso', 'Herói em Formação',
    'Guardião do Saber', 'Campeão do Coração', 'Mestre da Mente',
    'Lenda Viva', 'Superstar', 'Ícone Épico', 'Lenda Suprema 🌟'
  ];

  /* ─── Leitura/escrita seguras ─── */
  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }
  function dayKey(d) { return (d || new Date()).toISOString().split('T')[0]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ─── Um requisito de medalha foi atingido? ─── */
  function meetsReq(req, p) {
    if (req.games  != null) return (p.games_played||0) >= req.games;
    if (req.level  != null) return (p.level||1)        >= req.level;
    if (req.xp     != null) return (p.xp||0)           >= req.xp;
    if (req.streak != null) return (p.streak||0)       >= req.streak;
    if (req.char   != null) return !!p.character;
    if (req.race   != null) return (p.race||0)         >= req.race;
    if (req.breath != null) return (p.breath||0)       >= req.breath;
    if (req.draw   != null) return (p.draw||0)         >= req.draw;
    if (req.fala   != null) return (p.fala||0)         >= req.fala;
    if (req.ia     != null) return (p.ia||0)           >= req.ia;
    if (req.edu    != null) return (p.edu||0)          >= req.edu;
    if (req.rotina != null) {
      try {
        var done = JSON.parse(localStorage.getItem('ma-rotina-done-' + dayKey()) || '[]');
        var rot  = JSON.parse(localStorage.getItem('ma-rotina') || '[]');
        return rot.length > 0 && done.length >= rot.length;
      } catch (e) { return false; }
    }
    return false;
  }

  /* ─── Concede medalhas novas. Retorna a lista das recém-ganhas. ─── */
  function checkMedals(prog) {
    var p = prog || get();
    var earned = (p.medals || []).map(function (m) { return m.id; });
    var newOnes = [];
    MEDALS.forEach(function (m) {
      if (earned.indexOf(m.id) !== -1) return;
      if (meetsReq(m.req, p)) {
        newOnes.push(m);
        (p.medals || (p.medals = [])).push({ id: m.id, icon: m.icon, desc: m.name, new: true });
      }
    });
    if (newOnes.length && !prog) save(p);   // se recebi 'prog', quem chamou salva
    return newOnes;
  }

  /* ─── Atualiza a sequência diária e marca o dia no calendário ─── */
  function updateStreak(p) {
    var today = dayKey();
    if (p.last_day === today) return;             // já contei hoje
    try { localStorage.setItem('ma-day-' + today, '1'); } catch (e) {}
    var y = new Date(); y.setDate(y.getDate() - 1);
    p.streak = (p.last_day === dayKey(y)) ? (p.streak || 0) + 1 : 1;
    p.last_day = today;
  }

  function fmtDate(d) {
    var p2 = function (n) { return String(n).padStart(2, '0'); };
    return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
  }

  /* ─── Toast de recompensa (auto-contido, empilhável, claro/escuro) ─── */
  function ensureToastHost() {
    var host = document.getElementById('map-toast-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'map-toast-host';
    host.style.cssText = 'position:fixed;left:0;right:0;bottom:78px;z-index:99999;' +
      'display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;' +
      'padding:0 12px;font-family:"Nunito",system-ui,-apple-system,sans-serif;';
    document.body.appendChild(host);
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var st = document.createElement('style');
    st.textContent =
      '.map-toast{pointer-events:auto;display:flex;align-items:center;gap:10px;' +
      'max-width:340px;padding:11px 16px;border-radius:14px;font-weight:800;font-size:.9rem;' +
      'color:#fff;background:linear-gradient(135deg,#7C5CBF,#4A90D9);' +
      'box-shadow:0 8px 28px rgba(26,18,48,.35);transform:translateY(16px);opacity:0;' +
      'transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .3s;}' +
      '.map-toast.show{transform:translateY(0);opacity:1;}' +
      '.map-toast .mt-ic{font-size:1.3rem;line-height:1;}';
    document.head.appendChild(st);
    return host;
  }
  function toast(msg, icon) {
    if (!document.body) return;
    var host = ensureToastHost();
    var t = document.createElement('div');
    t.className = 'map-toast';
    t.innerHTML = '<span class="mt-ic">' + (icon || '⭐') + '</span><span>' + msg + '</span>';
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 320);
    }, 3200);
  }

  /* ─── Registra o resultado de um jogo (função principal) ─── */
  function recordGame(opts) {
    opts = opts || {};
    var p = get();
    var reward = Math.max(0, Math.round(opts.xp || 0));

    // XP + nível
    p.xp = (p.xp || 0) + reward;
    var newLevel = Math.floor(p.xp / LEVEL_XP) + 1;
    var leveledUp = newLevel > (p.level || 1);
    p.level = leveledUp ? newLevel : (p.level || 1);

    // contagem de jogos + último jogo + sequência
    if (opts.countAsGame !== false) p.games_played = (p.games_played || 0) + 1;
    p.last_play = Date.now();
    updateStreak(p);

    // flags de medalha: número → guarda o MAIOR (ex.: recorde da corrida); senão grava o valor
    var flags = opts.flags || {};
    Object.keys(flags).forEach(function (k) {
      var v = flags[k];
      p[k] = (typeof v === 'number') ? Math.max(p[k] || 0, v) : v;
    });

    // histórico de atividades (mantém as últimas 60)
    p.activities = p.activities || [];
    p.activities.push({
      name: opts.name || 'Atividade',
      icon: opts.icon || '🎮',
      xp: reward,
      score: (opts.score != null ? opts.score : null),
      date: fmtDate(new Date())
    });
    if (p.activities.length > 60) p.activities = p.activities.slice(-60);

    save(p);

    // medalhas (já salvo acima; passo 'p' para a função reaproveitar o objeto)
    var newMedals = checkMedals(p);
    save(p);

    // feedback visual
    if (reward > 0) toast('+' + reward + ' XP' + (opts.name ? ' · ' + opts.name : ''), '⭐');
    if (leveledUp)  toast('Subiu para o Nível ' + p.level + '!', '🚀');
    newMedals.forEach(function (m) { toast('Nova medalha: ' + m.name, m.icon); });

    return { prog: p, reward: reward, leveledUp: leveledUp, newMedals: newMedals };
  }

  /* ─── API pública ─── */
  window.MAProgress = {
    MEDALS: MEDALS,
    LEVEL_NAMES: LEVEL_NAMES,
    LEVEL_XP: LEVEL_XP,
    get: get,
    save: save,
    clamp: clamp,
    recordGame: recordGame,
    checkMedals: checkMedals,
    toast: toast
  };
})();
