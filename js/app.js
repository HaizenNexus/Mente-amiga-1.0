/* ============================================================
   MENTE AMIGA — JavaScript Principal
   CEO: Pedro Henrique © 2026
   ============================================================ */

'use strict';

/* ─── Gerenciamento de Tema ─── */
const ThemeManager = {
  key: 'ma-theme',

  init() {
    const saved = localStorage.getItem(this.key) || 'light';
    this.apply(saved);
    document.querySelector('#btn-theme')?.addEventListener('click', () => this.toggle());
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.key, theme);
    const btn = document.querySelector('#btn-theme');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

/* ─── Navbar scroll ─── */
const NavbarManager = {
  init() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Hamburger
    const ham  = document.querySelector('.hamburger');
    const drawer = document.querySelector('.nav-drawer');
    ham?.addEventListener('click', () => {
      ham.classList.toggle('active');
      drawer?.classList.toggle('open');
    });

    // Fechar drawer ao clicar em link
    drawer?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ham?.classList.remove('active');
        drawer?.classList.remove('open');
      });
    });
  }
};

/* ─── Animações de entrada ao scroll ─── */
const RevealManager = {
  init() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => obs.observe(el));
  }
};

/* ─── Sistema de Toast ─── */
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(msg, type = 'info', duration = 3500) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${msg}</span>`;
    this.container.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'none';
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'all 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }
};

/* ─── Sistema de Progresso / Recompensas ─── */
const ProgressManager = {
  key: 'ma-progress',

  get() {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : {
      xp: 0,
      level: 1,
      medals: [],
      games_played: 0,
      streak: 0,
      last_play: null,
      character: null,
      profile: null  // 'kids' | 'teen'
    };
  },

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  addXP(amount, reason = '') {
    const data = this.get();
    data.xp += amount;
    // Level up cada 100 XP
    const newLevel = Math.floor(data.xp / 100) + 1;
    if (newLevel > data.level) {
      data.level = newLevel;
      Toast.show(`🎉 Parabéns! Você subiu para o Nível ${newLevel}!`, 'success', 5000);
      VictoryAnimation.show();
    }
    data.games_played++;
    data.last_play = Date.now();
    this.save(data);
    return data;
  },

  setCharacter(id) {
    const data = this.get();
    data.character = id;
    this.save(data);
  },

  setProfile(profile) {
    const data = this.get();
    data.profile = profile;
    this.save(data);
  }
};

/* ─── Animação de Vitória ─── */
const VictoryAnimation = {
  show(message = 'Incrível! Você foi demais! 🌟') {
    const overlay = document.createElement('div');
    overlay.id = 'victory-overlay';
    overlay.innerHTML = `
      <div class="victory-content">
        <div class="victory-stars">
          <span class="star s1">⭐</span>
          <span class="star s2">🌟</span>
          <span class="star s3">⭐</span>
        </div>
        <div class="victory-emoji">🏆</div>
        <h2 class="victory-title">Você conseguiu!</h2>
        <p class="victory-msg">${message}</p>
        <button class="btn btn-primary" onclick="document.getElementById('victory-overlay').remove()">
          Continuar 🚀
        </button>
      </div>
      <canvas id="victory-confetti"></canvas>
    `;
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);
      animation:fadeIn 0.3s ease;
    `;
    document.body.appendChild(overlay);
    this.launchConfetti();

    // Auto fechar após 6s
    setTimeout(() => overlay?.remove(), 6000);
  },

  launchConfetti() {
    const canvas = document.getElementById('victory-confetti');
    if (!canvas) return;
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#7C5CBF','#4A90D9','#2BB5A0','#FF8C42','#FFD600','#E91E8C','#4CAF50'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
      opacity: 1
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotV;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.01;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 200) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
};

/* ─── Roteamento simples de páginas ─── */
const Router = {
  navigate(path) {
    window.location.href = path;
  }
};

/* ─── Inicialização ─── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavbarManager.init();
  RevealManager.init();
  Toast.init();

  // Adicionar estilos de vitória inline
  const style = document.createElement('style');
  style.textContent = `
    .victory-content {
      position:relative;z-index:99999;
      background:var(--bg-primary,#fff);
      border-radius:32px;
      padding:3rem 2.5rem;
      text-align:center;
      max-width:440px;
      width:90%;
      animation:slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      box-shadow:0 24px 80px rgba(0,0,0,0.4);
    }
    .victory-emoji { font-size:5rem; margin:0.5rem 0; animation:pulse 0.8s ease infinite; }
    .victory-title { font-family:'Baloo 2',sans-serif; font-size:2rem; font-weight:800;
      background:linear-gradient(135deg,#7C5CBF,#4A90D9,#2BB5A0);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      margin-bottom:0.75rem; }
    .victory-msg { color:var(--text-secondary,#5B5278); margin-bottom:1.5rem; font-size:1rem; }
    .victory-stars { display:flex;justify-content:center;gap:0.5rem;margin-bottom:0.5rem; }
    .star { font-size:1.5rem; animation:spin 3s linear infinite; }
    .s2  { animation-delay:0.5s; font-size:2rem; }
    .s3  { animation-delay:1s;  }
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
  `;
  document.head.appendChild(style);

  // Expor globalmente para uso nos jogos
  window.MA = {
    Toast,
    Progress: ProgressManager,
    Victory: VictoryAnimation,
    Router,
    Theme: ThemeManager
  };
});

/* ─── Loading screen global ─── */
const LoadingScreen = {
  show() {
    if (document.getElementById('app-loading')) return;
    const el = document.createElement('div');
    el.id = 'app-loading';
    el.className = 'app-loading';
    el.innerHTML = `
      <div class="loading-brain">🧠</div>
      <div class="loading-bar-wrap"><div class="loading-bar-fill"></div></div>
      <div class="loading-text">Carregando sua aventura...</div>`;
    document.body.appendChild(el);
  },
  hide() {
    const el = document.getElementById('app-loading');
    if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 500); }
  }
};

/* ─── Scroll to top ─── */
(function() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = '↑';
  btn.title = 'Voltar ao topo';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
  });
})();

/* ─── Mensagem motivacional aleatória ─── */
const MOTIV_MSGS = [
  '🌟 Incrível!', '💪 Arrasou!', '🎉 Demais!',
  '⭐ Você consegue!', '🚀 Continue assim!', '💜 Orgulho!'
];
function showMotivMessage(x, y) {
  const el = document.createElement('div');
  el.className = 'motiv-msg';
  el.textContent = MOTIV_MSGS[Math.floor(Math.random() * MOTIV_MSGS.length)];
  el.style.left = (x - 60) + 'px';
  el.style.top  = (y - 20) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}

/* Expor novas funções */
document.addEventListener('DOMContentLoaded', () => {
  if (window.MA) {
    window.MA.Loading = LoadingScreen;
    window.MA.showMotiv = showMotivMessage;
  }
});