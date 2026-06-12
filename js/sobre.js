/* ============================================================
   PÁGINA SOBRE — scripts próprios
   (depende do app.js para tema/menu; este arquivo cuida só
    do que é exclusivo da página Sobre)

   ÍNDICE
     1. Fotos dos cards (equipe e colaboradores)
     2. Hotbar de abas (Equipe • Colaboradores • TEA e TDAH)
     3. Fundo tecnológico (rede de pontos no canvas)
     4. Botão "Ler mais" das biografias longas
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     1. FOTOS DOS CARDS (equipe e colaboradores)

     Tem 2 jeitos de definir a foto de um card:
       1) Caminho exato: adicione data-foto="..." no <article>.
          Ex.: data-foto="../assets/personagens/evelyn.webp"
       2) Padrão automático: sem data-foto, ele procura em
          assets/responsaveis/<data-id>.jpg
          Ex.: assets/responsaveis/pedro_henrique.jpg

     Se a foto ainda não existir, o emoji continua aparecendo. 👍
     (Quer usar .png em vez de .jpg no padrão? Troque o EXT abaixo.)
     ============================================================ */
  function montarFotos() {
    const EXT = 'jpg';
    document.querySelectorAll('.member-card[data-id]').forEach(card => {
      const id = card.getAttribute('data-id');
      const avatar = card.querySelector('.member-avatar');
      if (!avatar || avatar.querySelector('img')) return;   // já tem foto? pula
      const img = document.createElement('img');
      img.src = card.getAttribute('data-foto') || `../assets/responsaveis/${id}.${EXT}`;
      img.alt = card.querySelector('.member-name')?.textContent || id;
      img.onerror = () => img.remove();   // sem foto ainda → mantém o emoji
      avatar.appendChild(img);
    });
  }

  /* ============================================================
     2. HOTBAR DE ABAS (Equipe • Colaboradores • TEA e TDAH)
        Mostra um painel por vez e cuida da acessibilidade
        (teclado: ← → Home End; foco; aria-selected).
     ============================================================ */
  function montarAbas() {
    const tablist = document.querySelector('.about-tabs');
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function ativar(tab, focar) {
      tabs.forEach(t => {
        const selecionada = t === tab;
        t.setAttribute('aria-selected', selecionada ? 'true' : 'false');
        t.tabIndex = selecionada ? 0 : -1;
        const painel = document.getElementById(t.getAttribute('aria-controls'));
        if (painel) painel.hidden = !selecionada;
      });
      // agora que o painel ficou visível, dá pra medir o texto e criar
      // o botão "Ler mais" nos cards que ainda não têm (ex.: Colaboradores)
      montarLerMais();
      if (focar) tab.focus();
    }

    tabs.forEach((tab, i) => {
      // clique/toque
      tab.addEventListener('click', () => ativar(tab, false));

      // navegação por teclado (padrão de tablist da W3C)
      tab.addEventListener('keydown', e => {
        let alvo = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') alvo = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') alvo = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') alvo = tabs[0];
        else if (e.key === 'End') alvo = tabs[tabs.length - 1];
        if (alvo) { e.preventDefault(); ativar(alvo, true); }
      });
    });
  }

  /* ============================================================
     3. FUNDO TECNOLÓGICO — rede de pontos que se conectam
        (desenhada no <canvas id="bg-net">, nas cores do app)
     ============================================================ */
  function montarFundo() {
    const canvas = document.getElementById('bg-net');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CORES = ['124,92,191', '74,144,217', '43,181,160', '233,30,140']; // roxo, azul, teal, rosa
    let w, h, dpr, pontos = [];

    function dimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width  = window.innerWidth  * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      // quantidade de pontos conforme o tamanho da tela (com teto p/ desempenho)
      const qtd = Math.min(70, Math.round(window.innerWidth * window.innerHeight / 22000));
      pontos = Array.from({ length: qtd }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r:  (Math.random() * 1.6 + 1) * dpr,
        c:  CORES[Math.floor(Math.random() * CORES.length)]
      }));
    }

    function render(mover) {
      ctx.clearRect(0, 0, w, h);
      const lig = 130 * dpr; // distância máxima para "ligar" dois pontos
      for (let i = 0; i < pontos.length; i++) {
        const p = pontos[i];
        if (mover) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ',0.6)';
        ctx.fill();
        for (let j = i + 1; j < pontos.length; j++) {
          const q = pontos[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < lig) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + p.c + ',' + (0.16 * (1 - d / lig)).toFixed(3) + ')';
            ctx.lineWidth = dpr;
            ctx.stroke();
          }
        }
      }
    }

    function loop() { render(true); requestAnimationFrame(loop); }

    dimensionar();
    reduzir ? render(false) : loop();   // se a pessoa prefere menos movimento, fica parado
    window.addEventListener('resize', () => { dimensionar(); if (reduzir) render(false); });
  }

  /* ============================================================
     4. BOTÃO "LER MAIS" — só aparece nas biografias longas
     ============================================================ */
  function montarLerMais() {
    document.querySelectorAll('.member-card').forEach(card => {
      const bio = card.querySelector('.member-bio');
      if (!bio || card.querySelector('.read-more')) return;
      // se o texto já cabe nas ~4 linhas, não cria botão nenhum
      if (bio.scrollHeight - bio.clientHeight < 6) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'read-more';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="rm-label">Ler mais</span><i data-lucide="chevron-down" class="rm-ico" aria-hidden="true"></i>';
      bio.insertAdjacentElement('afterend', btn);

      btn.addEventListener('click', () => {
        const aberto = bio.classList.toggle('is-expanded');
        btn.classList.toggle('is-open', aberto);
        btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        btn.querySelector('.rm-label').textContent = aberto ? 'Ler menos' : 'Ler mais';
      });
    });
    // desenha os chevrons recém-criados (o Lucide já rodou antes destes botões existirem)
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */
  montarFotos();
  montarAbas();
  montarFundo();
  // mede a altura só depois das fontes carregarem (senão a conta sai errada)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(montarLerMais);
  else window.addEventListener('load', montarLerMais);
})();
