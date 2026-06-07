/* ============================================================
   MENTE AMIGA — Refinamento Visual (Vitrine: Home)
   Lucide + micro-interações equilibradas e acessíveis.
   Carregado DEPOIS de app.js e nav.js.
   CEO: Pedro Henrique © 2026
   ============================================================ */
'use strict';

(function () {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 1. Ícones Lucide ──────────────────────────────────── */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ─── 2. Botão de tema com ícone Lucide (sem quebrar app.js) ─
     app.js define ThemeManager.apply() que escreve emoji no botão.
     Aqui envolvemos esse apply para desenhar sol/lua em SVG. */
  function enhanceThemeButton() {
    const T = window.MA && window.MA.Theme;
    const btn = document.querySelector('#btn-theme');
    if (!btn) return;

    const paint = (theme) => {
      btn.textContent = '';
      btn.innerHTML = '<i data-lucide="' + (theme === 'dark' ? 'sun' : 'moon') + '"></i>';
      renderIcons();
    };

    if (T && typeof T.apply === 'function') {
      const original = T.apply.bind(T);
      T.apply = function (theme) {
        original(theme);
        paint(theme);
      };
    }
    paint(document.documentElement.getAttribute('data-theme') || 'light');
  }

  /* ─── 3. Reveal on scroll com efeito escalonado ─────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (REDUCED) { els.forEach(el => el.classList.add('visible')); return; }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ─── 4. Ripple nos botões ──────────────────────────────── */
  function initRipple() {
    if (REDUCED) return;
    const selector = '.btn, .game-btn, .choose-card';
    document.addEventListener('click', (ev) => {
      const target = ev.target.closest(selector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (ev.clientX - rect.left - size / 2) + 'px';
      r.style.top = (ev.clientY - rect.top - size / 2) + 'px';
      // garante posicionamento relativo p/ conter o ripple
      const cs = getComputedStyle(target);
      if (cs.position === 'static') target.style.position = 'relative';
      target.appendChild(r);
      setTimeout(() => r.remove(), 620);
    });
  }

  /* ─── 5. Botões magnéticos (CTAs) ───────────────────────── */
  function initMagnetic() {
    if (REDUCED || window.matchMedia('(pointer: coarse)').matches) return;
    const targets = document.querySelectorAll('[data-magnetic]');
    targets.forEach(el => {
      el.classList.add('magnetic');
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ─── 6. Realce de luz seguindo o mouse nos choose-cards ── */
  function initCardGlow() {
    if (REDUCED || window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.choose-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ─── 7. Count-up das estatísticas do hero ──────────────── */
  function initCountUp() {
    const nums = document.querySelectorAll('.stat-number[data-count]');
    if (!nums.length) return;
    if (REDUCED) {
      nums.forEach(n => n.textContent = n.dataset.count + (n.dataset.suffix || ''));
      return;
    }
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(n => obs.observe(n));
  }

  /* ─── 8. Partículas leves no hero ───────────────────────── */
  function initParticles() {
    if (REDUCED) return;
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const COLORS = ['rgba(124,92,191,', 'rgba(74,144,217,', 'rgba(43,181,160,'];
    const COUNT = window.innerWidth < 720 ? 18 : 36;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function build() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.4 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.4 + 0.15,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.a + ')';
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }
    resize(); build(); tick();
    window.addEventListener('resize', () => { resize(); build(); }, { passive: true });
    // pausa quando a aba não está visível (economia)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else tick();
    });
  }

  /* ─── 9. Scroll suave com offset da navbar ──────────────── */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
  }

  /* ─── Inicialização ─────────────────────────────────────── */
  function init() {
    document.body.classList.add('page-enter');
    renderIcons();
    enhanceThemeButton();
    initReveal();
    initRipple();
    initMagnetic();
    initCardGlow();
    initCountUp();
    initParticles();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
