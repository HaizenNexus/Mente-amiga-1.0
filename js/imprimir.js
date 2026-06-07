/* ============================================================
   MENTE AMIGA — Jogos para Imprimir (imprimir.js)
   ------------------------------------------------------------
   Gera folhas de atividade imprimíveis (Memória, Colorir, Cores,
   Foco). Cada folha pode ser regenerada (variedade infinita) e
   impressa / salva em PDF pelo próprio navegador.
   CEO: Pedro Henrique © 2026
   ============================================================ */
(function () {
  "use strict";

  /* ─── Desenhos (contornos SVG, pretos, sem preenchimento) ─── */
  /* Estilo 2D fofo (kawaii): formas cheias e arredondadas, com carinhas.
     Ainda são CONTORNOS (fill:none) pra criança pintar; olhos/nariz vêm
     preenchidos (fill próprio) só pra dar graça. */
  var SHAPES = {
    sol:       { color: 'Amarelo',  name: 'sol',       svg: '<circle cx="100" cy="102" r="44"/><circle cx="86" cy="98" r="4" fill="#1a1a1a"/><circle cx="114" cy="98" r="4" fill="#1a1a1a"/><path d="M84 114 q16 16 32 0"/><line x1="100" y1="38" x2="100" y2="20"/><line x1="100" y1="166" x2="100" y2="184"/><line x1="36" y1="102" x2="18" y2="102"/><line x1="164" y1="102" x2="182" y2="102"/><line x1="55" y1="57" x2="43" y2="45"/><line x1="145" y1="147" x2="157" y2="159"/><line x1="145" y1="57" x2="157" y2="45"/><line x1="55" y1="147" x2="43" y2="159"/>' },
    maca:      { color: 'Vermelho', name: 'maçã',      svg: '<path d="M100 60 C92 48 70 48 64 68 C56 96 72 152 100 160 C128 152 144 96 136 68 C130 48 108 48 100 60 Z"/><path d="M100 58 C104 44 112 40 120 38"/><path d="M120 38 C136 34 140 50 138 56 C124 60 118 48 120 38 Z"/><circle cx="84" cy="96" r="3.5" fill="#1a1a1a"/><circle cx="116" cy="96" r="3.5" fill="#1a1a1a"/><path d="M88 108 q12 10 24 0"/>' },
    sapo:      { color: 'Verde',    name: 'sapo',      svg: '<ellipse cx="100" cy="120" rx="54" ry="36"/><circle cx="74" cy="80" r="18"/><circle cx="126" cy="80" r="18"/><circle cx="74" cy="82" r="6" fill="#1a1a1a"/><circle cx="126" cy="82" r="6" fill="#1a1a1a"/><path d="M76 124 q24 18 48 0"/>' },
    peixe:     { color: 'Azul',     name: 'peixe',     svg: '<ellipse cx="92" cy="102" rx="52" ry="36"/><polygon points="144,102 182,74 182,130"/><circle cx="72" cy="94" r="9"/><circle cx="72" cy="94" r="4" fill="#1a1a1a"/><path d="M62 116 q14 10 28 0"/><path d="M108 72 q10 30 0 60"/>' },
    porquinho: { color: 'Rosa',     name: 'porquinho', svg: '<circle cx="100" cy="108" r="50"/><path d="M64 74 C50 58 54 50 66 52 C78 54 80 66 78 76 Z"/><path d="M136 74 C150 58 146 50 134 52 C122 54 120 66 122 76 Z"/><ellipse cx="100" cy="120" rx="22" ry="16"/><circle cx="93" cy="120" r="3.5" fill="#1a1a1a"/><circle cx="107" cy="120" r="3.5" fill="#1a1a1a"/><circle cx="80" cy="98" r="4" fill="#1a1a1a"/><circle cx="120" cy="98" r="4" fill="#1a1a1a"/>' },
    laranja:   { color: 'Laranja',  name: 'laranja',   svg: '<circle cx="100" cy="110" r="48"/><path d="M100 62 C104 50 110 46 118 46"/><path d="M118 46 C134 42 138 58 136 64 C122 68 116 56 118 46 Z"/><circle cx="86" cy="106" r="3.5" fill="#1a1a1a"/><circle cx="114" cy="106" r="3.5" fill="#1a1a1a"/><path d="M88 118 q12 10 24 0"/>' },
    uva:       { color: 'Roxo',     name: 'uva',       svg: '<circle cx="100" cy="66" r="14"/><circle cx="78" cy="86" r="14"/><circle cx="122" cy="86" r="14"/><circle cx="100" cy="100" r="14"/><circle cx="80" cy="116" r="14"/><circle cx="120" cy="116" r="14"/><circle cx="100" cy="132" r="14"/><path d="M100 52 C104 40 110 36 118 36"/><path d="M118 36 C134 32 138 48 136 54 C122 58 116 46 118 36 Z"/>' },
    ursinho:   { color: 'Marrom',   name: 'ursinho',   svg: '<circle cx="100" cy="112" r="48"/><circle cx="64" cy="78" r="18"/><circle cx="136" cy="78" r="18"/><ellipse cx="100" cy="122" rx="22" ry="18"/><ellipse cx="100" cy="112" rx="7" ry="5" fill="#1a1a1a"/><circle cx="82" cy="100" r="4" fill="#1a1a1a"/><circle cx="118" cy="100" r="4" fill="#1a1a1a"/><path d="M92 126 q8 8 16 0"/>' },
    gato:      { color: 'Cinza',    name: 'gato',      svg: '<circle cx="100" cy="110" r="48"/><path d="M66 78 L58 42 L94 66 Z"/><path d="M134 78 L142 42 L106 66 Z"/><circle cx="82" cy="104" r="5" fill="#1a1a1a"/><circle cx="118" cy="104" r="5" fill="#1a1a1a"/><path d="M96 116 l4 5 l4 -5"/><line x1="50" y1="112" x2="76" y2="116"/><line x1="50" y1="124" x2="76" y2="124"/><line x1="150" y1="112" x2="124" y2="116"/><line x1="150" y1="124" x2="124" y2="124"/>' }
  };
  var SHAPE_KEYS = Object.keys(SHAPES);
  function svgEl(name, size, cls) {
    var s = SHAPES[name];
    return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" class="' + (cls || '') + '" aria-hidden="true">' +
      '<g fill="none" stroke="#1a1a1a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' + s.svg + '</g></svg>';
  }

  /* ─── Emojis do Foco ─── */
  var FOCO_POOL = ['🍎','🍌','⭐','🌙','🚗','⚽','🐶','🐱','🌻','🎈','🐸','🦋','🍓','🐢','🐝','🚀'];

  /* ─── Heróis (para o Jogo de Dama) — imagens em assets/personagens ─── */
  var HEROES = {
    prof_conceicao: 'Prof. Conceição', ingrid: 'Ingrid', tryannaxx: 'Tryannaxx', geovania: 'Geovania',
    heitozin: 'Heitozin', henrique: 'Henrique', codigo_fantasma: 'Código Fantasma', vibora_noturna: 'Víbora Noturna',
    feiticeira_escalate: 'Feiticeira', lamina_fantasma: 'Lâmina Fantasma', dama_da_luz: 'Dama da Luz', aurora_da_luz: 'Aurora da Luz'
  };
  var HERO_IDS = Object.keys(HEROES);
  function heroSrc(id) { return '../assets/personagens/' + id + '.webp'; }

  /* ─── Desenhos do Colorir — imagens em assets/colorir (contornos) ───
     Para adicionar um desenho novo: salve o .webp/.png em assets/colorir/
     e acrescente { f:'arquivo.webp', n:'nome' } na lista abaixo. */
  var COLORIR = [
    { f: 'cantora.webp',     n: 'cantora' },
    { f: 'cavalinho.webp',   n: 'cavalinho' },
    { f: 'coala.webp',       n: 'coala' },
    { f: 'dragao.webp',      n: 'dragão' },
    { f: 'patinho.webp',     n: 'patinho' },
    { f: 'princesinha.webp', n: 'princesinha' },
    { f: 'rosas.webp',       n: 'rosas' },
    { f: 'tigre.webp',       n: 'tigre' },
    { f: 'ursinho.webp',     n: 'ursinho' }
  ];

  /* ─── Utilidades ─── */
  function shuffle(a) { var r = a.slice(); for (var i = r.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  var LOGO = '../assets/favicon/logo.png';
  // Cabeçalho da folha: logo + marca + título, sobre o gradiente da cor-tema.
  function head(emoji, title, instr) {
    return '<div class="ps-head"><img src="' + LOGO + '" alt="Mente Amiga">' +
      '<div class="ps-head-txt"><span class="ps-brandname">MENTE AMIGA</span>' +
      '<span class="ps-title">' + title + '</span></div>' +
      '<span class="ps-head-emoji" aria-hidden="true">' + emoji + '</span></div>' +
      '<div class="ps-instr">' + instr + '</div>';
  }
  function body(html) { return '<div class="ps-body">' + html + '</div>'; }
  function foot() {
    return '<div class="ps-foot"><span class="brand">🧠 Mente Amiga · menteamiga.app</span>' +
      '<span class="name">Nome: __________________  Data: ___ / ___</span></div>';
  }

  /* ─── Geradores de folha ─── */
  function genMemoria() {
    var hs = sample(HERO_IDS, 8);              // 8 heróis = 8 pares (16 cartas)
    var cards = shuffle(hs.concat(hs));
    var grid = '';
    cards.forEach(function (id) { grid += '<div class="mem-card"><img src="' + heroSrc(id) + '" alt=""></div>'; });
    return head('🃏', 'Jogo da Memória',
      'Recorte as 16 cartas, embaralhe e vire para baixo. Ache os <strong>pares de heróis iguais</strong>!') +
      body('<div class="mem-grid">' + grid + '</div>') + foot();
  }

  function genColorir() {
    var d = pick(COLORIR);
    return head('🖍️', 'Vamos Colorir!', 'Pinte o(a) <strong>' + d.n + '</strong> com as cores que você quiser! 🎨') +
      body('<div class="cl-stage"><img class="cl-img" src="../assets/colorir/' + d.f + '" alt="' + d.n + ' para colorir"></div>') + foot();
  }

  function genCores() {
    // escolhe figuras com cores DIFERENTES (sem repetir cor na mesma folha)
    var byColor = {};
    SHAPE_KEYS.forEach(function (k) { (byColor[SHAPES[k].color] = byColor[SHAPES[k].color] || []).push(k); });
    var colors = sample(Object.keys(byColor), 6);
    var grid = '';
    colors.forEach(function (cor) {
      var n = pick(byColor[cor]);
      grid += '<div class="cor-item">' + svgEl(n, 104, '') +
        '<div class="cor-label">' + SHAPES[n].color + '<small>pinte de ' + SHAPES[n].color.toLowerCase() + '</small></div></div>';
    });
    return head('🎨', 'Pinte da Cor Certa', 'Cada figura tem o nome de uma cor. Pinte cada uma da <strong>cor que está escrita</strong>!') +
      body('<div class="cor-grid">' + grid + '</div>') + foot();
  }

  function genFoco() {
    /* A) circular DOIS alvos diferentes (mais difícil) */
    var t1 = pick(FOCO_POOL), t2;
    do { t2 = pick(FOCO_POOL); } while (t2 === t1);
    var others = FOCO_POOL.filter(function (e) { return e !== t1 && e !== t2; });
    var cols = 11, total = cols * 9, cells = '';
    for (var i = 0; i < total; i++) {
      var rnd = Math.random();
      if (rnd < 0.12) cells += '<div class="foco-cell">' + t1 + '</div>';
      else if (rnd < 0.24) cells += '<div class="foco-cell">' + t2 + '</div>';
      else cells += '<div class="foco-cell">' + pick(others) + '</div>';
    }
    var blockA =
      '<div class="foco-block"><div class="foco-h">1) Circule todos os <b>' + t1 + '</b> e todos os <b>' + t2 + '</b>:</div>' +
      '<div class="foco-grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + cells + '</div>' +
      '<div class="foco-count">' + t1 + ' = ______    ' + t2 + ' = ______</div></div>';

    /* B) ache o diferente — 6 linhas de 9 itens */
    var rowsHtml = '';
    for (var r = 0; r < 6; r++) {
      var base = pick(FOCO_POOL), diff;
      do { diff = pick(FOCO_POOL); } while (diff === base);
      var n = 9, oddPos = Math.floor(Math.random() * n), line = '';
      for (var c = 0; c < n; c++) line += '<span class="em">' + (c === oddPos ? diff : base) + '</span>';
      rowsHtml += '<div class="foco-row"><span class="lbl">' + (r + 1) + '</span>' + line + '</div>';
    }
    var blockB = '<div class="foco-block"><div class="foco-h">2) Ache o <b>diferente</b> em cada linha:</div>' + rowsHtml + '</div>';

    return head('🎯', 'Caça aos Objetos', 'Modo difícil! Capriche na atenção 👀') +
      body(blockA + blockB) + foot();
  }

  function genDama() {
    var pair = sample(HERO_IDS, 2), A = pair[0], B = pair[1];
    /* tabuleiro VAZIO — as peças são recortadas e colocadas por cima */
    var board = '';
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var dark = (r + c) % 2 === 1;
        board += '<div class="dama-sq ' + (dark ? 'dark' : 'light') + '"></div>';
      }
    }
    var cut = '';
    for (var i = 0; i < 12; i++) cut += '<div class="dama-token"><img src="' + heroSrc(A) + '" alt=""></div>';
    for (var j = 0; j < 12; j++) cut += '<div class="dama-token"><img src="' + heroSrc(B) + '" alt=""></div>';
    var content =
      '<div class="dama-board">' + board + '</div>' +
      '<div class="dama-legend">' +
        '<span><img src="' + heroSrc(A) + '" alt="">' + HEROES[A] + ' (12)</span>' +
        '<span><img src="' + heroSrc(B) + '" alt="">' + HEROES[B] + ' (12)</span></div>' +
      '<div class="dama-cut-title">✂️ Recorte as 24 peças e coloque nas casas escuras (3 fileiras de cada lado):</div>' +
      '<div class="dama-cut">' + cut + '</div>';
    return head('♟️', 'Dama dos Heróis',
      'Recorte as peças e monte o jogo no tabuleiro! Ande nas <strong>diagonais</strong> e capture pulando o adversário.') +
      body(content) + foot();
  }

  var GENERATORS = { memoria: genMemoria, colorir: genColorir, cores: genCores, foco: genFoco, dama: genDama };

  /* ─── Navegação ─── */
  var currentAct = null;
  var sheet, viewHub, viewAct;

  function openActivity(key) {
    if (!GENERATORS[key]) return;
    currentAct = key;
    sheet.className = 'print-sheet sheet-' + key;   // aplica a cor-tema do jogo
    sheet.innerHTML = GENERATORS[key]();
    viewHub.style.display = 'none';
    viewAct.style.display = 'block';
    if (location.hash.replace('#', '') !== key) {
      try { history.replaceState(null, '', '#' + key); } catch (e) { location.hash = key; }
    }
    window.scrollTo(0, 0);
  }
  function regenerate() { if (currentAct) { sheet.innerHTML = GENERATORS[currentAct](); window.scrollTo(0, 0); } }
  function backToHub() {
    currentAct = null;
    viewAct.style.display = 'none';
    viewHub.style.display = 'block';
    try { history.replaceState(null, '', location.pathname); } catch (e) { location.hash = ''; }
    window.scrollTo(0, 0);
  }
  /* expõe pros onclick do HTML */
  window.regenerate = regenerate;
  window.backToHub = backToHub;

  function init() {
    sheet   = document.getElementById('sheet');
    viewHub = document.getElementById('view-hub');
    viewAct = document.getElementById('view-activity');
    document.querySelectorAll('.ph-card').forEach(function (c) {
      c.addEventListener('click', function () { openActivity(c.dataset.act); });
    });
    // deep-link: #memoria / #colorir / #cores / #foco abre direto a atividade
    var h = (location.hash || '').replace('#', '');
    if (GENERATORS[h]) openActivity(h);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
