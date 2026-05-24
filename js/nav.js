/* ============================================================
   MENTE AMIGA — Navegação Unificada (nav.js)
   ------------------------------------------------------------
   Fonte ÚNICA da verdade da navegação do app.
   Basta incluir <script src="../js/nav.js"></script> antes de
   </body> em qualquer página. Este arquivo injeta:

     • Barra inferior fixa (estilo app) nas páginas internas
       → 🏠 Início · 🎮 Jogos · 📅 Rotina · 🏆 Progresso
       "Início" volta pro painel certo conforme o perfil salvo.

     • Estilo .ma-btn-voltar: o botão "Voltar" com borda RGB
       animada (inspirado no botão da Luna). As cores ADAPTAM por
       página, via a variável CSS --ma-rgb-grad (definida no <html>).
       Use class="ma-btn-voltar" em qualquer botão/link de voltar.

     • Barra superior "← Voltar" nas páginas de jogo (pasta jogos/),
       cujo botão já usa o estilo .ma-btn-voltar.

   Casos especiais:
     • index.html (landing): mantém a navbar própria; o nav.js só
       define a paleta da página (sem barra inferior).
     • ia.html (a própria Luna): não recebe barra nem nada — ela tem
       o seu próprio botão "Voltar" (o button-85 original, o modelo).
     • jogos/*.html: barra superior "Voltar".

   Funciona em qualquer nível de pasta porque descobre a raiz do
   projeto a partir do próprio src deste <script>.
   CEO: Pedro Henrique © 2026
   ============================================================ */
(function () {
  'use strict';

  /* 1) Descobrir a RAIZ do projeto a partir do próprio src do script.
        Ex.: ".../Mente amiga/js/nav.js" → ".../Mente amiga/" */
  var ROOT = (function () {
    var src = (document.currentScript && document.currentScript.src) || '';
    return src.replace(/js\/nav\.js(?:\?.*)?$/, '');
  })();

  /* 2) Ler o perfil salvo (kids | teen) para a navegação inteligente. */
  function getProfile() {
    try {
      var p = JSON.parse(localStorage.getItem('ma-progress') || '{}');
      return p.profile || null;
    } catch (e) { return null; }
  }

  /* Destino do "Início" / painel conforme o perfil. */
  function homeHref() {
    var prof = getProfile();
    if (prof === 'kids') return ROOT + 'pages/dashboard-crianca.html';
    if (prof === 'teen') return ROOT + 'pages/dashboard-adolescente.html';
    return ROOT + 'index.html';
  }

  /* Contexto da página atual. */
  var path      = location.pathname.toLowerCase();
  var current   = (path.split('/').pop() || 'index.html');
  var inGame    = /\/jogos\//.test(path);
  var isLuna    = current === 'ia.html';
  var isLanding = current === 'index.html' && !/\/pages\//.test(path) && !inGame;

  /* 3) Paleta de cores da borda RGB POR PÁGINA.
        O JS escolhe a lista certa e entrega ao CSS pela variável
        --ma-rgb-grad; o CSS desenha o gradiente que gira na borda.
        (A 1ª cor repete no fim pra a animação dar a volta suave.) */
  function pageGradient() {
    var map = {
      'index.html':                  '#7c5cbf,#4a90d9,#2bb5a0,#ff8c42,#e91e8c,#7c5cbf',
      'dashboard-crianca.html':      '#ff8c42,#ffd600,#ff5fa2,#ff8c42',
      'dashboard-adolescente.html':  '#4a90d9,#7c5cbf,#e91e8c,#4a90d9',
      'jogos.html':                  '#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000',
      'rotina.html':                 '#2bb5a0,#4a90d9,#56cba5,#2bb5a0',
      'progresso.html':              '#ffd600,#ff8c42,#ffb800,#ffd600',
      'personagens.html':            '#7c5cbf,#e91e8c,#a07ee0,#7c5cbf',
      'biblioteca-mente-amiga.html': '#4a90d9,#4caf50,#ff8c42,#e91e8c,#7c5cbf,#4a90d9'
    };
    var c = map[current];
    if (!c) {
      var prof = getProfile();
      if (prof === 'kids')      c = '#ff8c42,#ffd600,#ff5fa2,#ff8c42';
      else if (prof === 'teen') c = '#4a90d9,#7c5cbf,#e91e8c,#4a90d9';
      else                      c = '#7c5cbf,#4a90d9,#2bb5a0,#ff8c42,#e91e8c,#7c5cbf';
    }
    return 'linear-gradient(45deg,' + c + ')';
  }

  /* 4) CSS autocontido (claro e escuro). Os jogos não carregam o
        main.css, então o estilo precisa funcionar sozinho. */
  function injectCSS() {
    if (document.getElementById('ma-nav-css')) return;
    var css =
      /* ---- Botão "Voltar" com borda RGB animada (modelo da Luna) ---- */
      '.ma-btn-voltar{position:relative;z-index:0;display:inline-flex;align-items:center;gap:6px;' +
        'padding:0.55em 1.4em;border:none;outline:none;border-radius:10px;' +
        'background:#14122e;color:#fff;font-family:inherit;font-weight:700;font-size:0.9rem;' +
        'line-height:1.2;cursor:pointer;text-decoration:none;-webkit-tap-highlight-color:transparent;' +
        'transition:transform .15s ease;}' +
      '.ma-btn-voltar::before{content:"";position:absolute;inset:-2px;border-radius:12px;z-index:-2;' +
        'background:var(--ma-rgb-grad,linear-gradient(45deg,#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000));' +
        'background-size:400%;filter:blur(6px);animation:ma-rgb-glow 16s linear infinite;}' +
      '.ma-btn-voltar::after{content:"";position:absolute;inset:0;border-radius:10px;z-index:-1;background:#14122e;}' +
      '.ma-btn-voltar:hover{transform:translateY(-1px);}' +
      '.ma-btn-voltar:active{transform:translateY(0) scale(0.98);}' +
      '@keyframes ma-rgb-glow{0%{background-position:0 0;}50%{background-position:400% 0;}100%{background-position:0 0;}}' +
      /* ---- Barra inferior (páginas do app) ---- */
      '.ma-bottomnav{position:fixed;left:0;right:0;bottom:0;z-index:9000;' +
        'display:flex;justify-content:space-around;align-items:stretch;' +
        'background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);' +
        '-webkit-backdrop-filter:blur(14px);border-top:1px solid rgba(0,0,0,0.08);' +
        'box-shadow:0 -4px 22px rgba(0,0,0,0.07);' +
        'font-family:"Nunito",system-ui,-apple-system,sans-serif;}' +
      '.ma-bottomnav a{position:relative;flex:1;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:3px;padding:8px 4px;min-height:60px;' +
        'text-decoration:none;color:#5B5278;font-weight:700;font-size:0.7rem;' +
        'transition:color .2s ease,transform .2s ease;}' +
      '.ma-bottomnav a .ma-bn-icon{font-size:1.4rem;line-height:1;transition:transform .2s ease;}' +
      '.ma-bottomnav a:hover{color:#7C5CBF;}' +
      '.ma-bottomnav a:hover .ma-bn-icon{transform:translateY(-2px);}' +
      '.ma-bottomnav a.active{color:#7C5CBF;}' +
      '.ma-bottomnav a.active .ma-bn-icon{transform:translateY(-2px) scale(1.14);}' +
      '.ma-bottomnav a.active::before{content:"";position:absolute;top:0;width:28px;height:3px;' +
        'border-radius:0 0 4px 4px;background:linear-gradient(90deg,#7C5CBF,#4A90D9);}' +
      'body.ma-has-bottomnav{padding-bottom:calc(66px + env(safe-area-inset-bottom,0px)) !important;}' +
      '[data-theme="dark"] .ma-bottomnav{background:rgba(20,18,38,0.92);' +
        'border-top-color:rgba(255,255,255,0.08);box-shadow:0 -4px 22px rgba(0,0,0,0.4);}' +
      '[data-theme="dark"] .ma-bottomnav a{color:#9890c0;}' +
      '[data-theme="dark"] .ma-bottomnav a:hover,[data-theme="dark"] .ma-bottomnav a.active{color:#b9a8ff;}' +
      /* o botão "voltar ao topo" sobe pra não ficar atrás da barra inferior */
      'body.ma-has-bottomnav .scroll-top-btn{bottom:calc(80px + env(safe-area-inset-bottom,0px)) !important;}' +
      /* ---- Barra superior dos jogos ---- */
      '.ma-gamebar{position:fixed;top:0;left:0;right:0;z-index:9000;display:flex;' +
        'align-items:center;justify-content:space-between;gap:12px;padding:9px 16px;min-height:48px;' +
        'background:rgba(12,12,28,0.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
        'border-bottom:1px solid rgba(255,255,255,0.12);' +
        'font-family:"Nunito",system-ui,-apple-system,sans-serif;}' +
      '.ma-gamebar .ma-gb-logo{display:flex;align-items:center;gap:8px;color:#fff;' +
        'text-decoration:none;font-weight:800;font-size:0.95rem;}' +
      '.ma-gamebar .ma-gb-logo:hover{opacity:0.85;}' +
      'body.ma-has-gamebar{padding-top:62px;}' +
      /* ---- Movimento reduzido (acessibilidade) ---- */
      '@media (prefers-reduced-motion: reduce){.ma-btn-voltar::before{animation:none;}}' +
      /* ---- Impressão ---- */
      '@media print{.ma-bottomnav,.ma-gamebar{display:none !important;}}';
    var s = document.createElement('style');
    s.id = 'ma-nav-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  /* 5) Barra inferior — 4 itens (a Luna fica no botão flutuante? Não:
        a Luna agora é acessada pelo botão "Voltar"/menu das páginas). */
  function buildBottomNav() {
    var items = [
      { key: 'home',   icon: '🏠', label: 'Início',    href: homeHref() },
      { key: 'jogos',  icon: '🎮', label: 'Jogos',     href: ROOT + 'pages/jogos.html' },
      { key: 'rotina', icon: '📅', label: 'Rotina',    href: ROOT + 'pages/rotina.html' },
      { key: 'prog',   icon: '🏆', label: 'Progresso', href: ROOT + 'pages/progresso.html' }
    ];
    var activeMap = {
      'dashboard-crianca.html': 'home',
      'dashboard-adolescente.html': 'home',
      'index.html': 'home',
      'jogos.html': 'jogos',
      'rotina.html': 'rotina',
      'progresso.html': 'prog'
    };
    var activeKey = activeMap[current] || '';

    var nav = el('nav', 'ma-bottomnav');
    nav.setAttribute('aria-label', 'Navegação rápida');
    items.forEach(function (it) {
      var a = el('a', it.key === activeKey ? 'active' : '');
      a.href = it.href;
      a.setAttribute('aria-label', it.label);
      if (it.key === activeKey) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<span class="ma-bn-icon" aria-hidden="true">' + it.icon +
                    '</span><span>' + it.label + '</span>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    document.body.classList.add('ma-has-bottomnav');
  }

  /* 6) Barra superior dos jogos (escape garantido).
        O botão "Voltar" usa o mesmo estilo .ma-btn-voltar. */
  function buildGameBar() {
    var bar = el('div', 'ma-gamebar');
    var logo = el('a', 'ma-gb-logo');
    logo.href = homeHref();
    logo.title = 'Ir para o meu painel';
    logo.innerHTML = '<span aria-hidden="true">🧠</span><span>Mente Amiga</span>';

    var back = el('a', 'ma-btn-voltar');
    back.href = ROOT + 'pages/jogos.html';
    back.title = 'Voltar para a lista de jogos';
    back.innerHTML = '<span aria-hidden="true">←</span><span>Voltar</span>';

    bar.appendChild(logo);
    bar.appendChild(back);
    document.body.appendChild(bar);
    document.body.classList.add('ma-has-gamebar');
  }

  /* 7) Inicialização — decide o que cada tipo de página recebe. */
  function main() {
    /* define a paleta de cores da página (usada pelo botão Voltar) */
    document.documentElement.style.setProperty('--ma-rgb-grad', pageGradient());
    injectCSS();
    if (inGame) {
      buildGameBar();                      // jogos: barra "Voltar"
    } else if (isLuna) {
      /* a própria Luna tem navegação própria */
    } else if (!isLanding) {
      buildBottomNav();                    // páginas do app: barra inferior
    }
    /* landing (index): só a paleta + CSS, sem barras */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
