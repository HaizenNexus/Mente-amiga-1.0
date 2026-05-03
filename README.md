# 🧠 Mente Amiga
### Plataforma interativa para jovens com TEA e TDAH

> **CEO & Criador:** Pedro Henrique  
> **Versão:** 1.0.0 — 2026  
> **Licença:** © Todos os direitos reservados

---

## 📋 Sobre o Projeto

O **Mente Amiga** é uma plataforma web completa e profissional desenvolvida para apoiar crianças e adolescentes com **Autismo (TEA)** e **TDAH** em seu desenvolvimento emocional, educacional e social.

### 🎯 Objetivos
- Reduzir ansiedade e promover segurança emocional
- Estimular foco e concentração de forma divertida
- Apoiar o aprendizado escolar com tutores virtuais especializados
- Criar rotinas saudáveis com sistema de recompensas
- Oferecer IA empática para suporte emocional 24h

---

## 📁 Estrutura de Arquivos

```
mente-amiga/
│
├── index.html                    ← Landing page principal
│
├── css/
│   ├── main.css                  ← Sistema de design completo
│   ├── dashboard-kids.css        ← Estilos do dashboard infantil
│   ├── games.css                 ← Estilos dos jogos
│   └── animations.css            ← Animações e efeitos especiais
│
├── js/
│   ├── app.js                    ← Lógica principal (temas, XP, toasts)
│   └── sounds.js                 ← Sistema de sons Web Audio API
│
└── pages/
    ├── dashboard-crianca.html    ← Dashboard área infantil
    ├── dashboard-adolescente.html← Dashboard área adolescente
    ├── personagens.html          ← Seleção de personagens
    ├── jogos.html                ← Hub + 6 mini jogos completos
    ├── ia.html                   ← IA Luna (chat com Claude API)
    ├── rotina.html               ← Sistema de rotina (pais + filhos)
    ├── educacao.html             ← Sistema de ensino (9 matérias)
    └── progresso.html            ← Conquistas e medalhas
```

---

## 🚀 Como Rodar Localmente

### Opção 1 — Abrir direto no navegador (mais simples)
1. Baixe todos os arquivos
2. Abra o arquivo `index.html` no seu navegador
3. Pronto! Funciona sem servidor

### Opção 2 — Servidor local (recomendado para IA)
```bash
# Com Python (já vem no sistema)
python -m http.server 3000

# Com Node.js
npx serve .

# Depois acesse:
# http://localhost:3000
```

---

## 🤖 Configurar a IA (Claude API)

A IA Luna usa a **API da Anthropic**. Para ativar:

1. Crie uma conta em [anthropic.com](https://console.anthropic.com)
2. Gere uma **API Key** no painel
3. Adicione a key no arquivo `pages/ia.html` e `pages/educacao.html`:

```javascript
// Encontre esta linha nos arquivos:
headers: { 'Content-Type': 'application/json' }

// Adicione sua key:
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'SUA_API_KEY_AQUI',
  'anthropic-version': '2023-06-01'
}
```

> **Nota:** Para produção, nunca exponha a API key no frontend. Use um servidor backend (Node.js/Python) para fazer as chamadas com segurança.

---

## ☁️ Deploy (Publicar na Internet)

### Vercel (Recomendado — Grátis)
```bash
# 1. Instale o Vercel CLI
npm install -g vercel

# 2. Na pasta do projeto
vercel

# 3. Siga as instruções
# Seu site estará em: seusite.vercel.app
```

### Netlify (Alternativo — Grátis)
1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para o painel
3. Pronto! Seu site vai no ar em segundos

### GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em Settings → Pages → Source: main branch
4. Acesse: `seuusuario.github.io/mente-amiga`

---

## 📱 Responsividade

O projeto é totalmente responsivo para:
- 📱 **Celular** (320px+)
- 📟 **Tablet** (768px+)
- 💻 **Notebook/PC** (1024px+)

---

## 🎮 Mini Jogos

| Jogo | XP | Descrição |
|------|-----|-----------|
| 🎨 Jogo das Cores | +10 XP | Identifique cores, 10 rodadas com streak |
| 🃏 Jogo da Memória | +15 XP | Encontre pares com flip 3D |
| 🫧 Respiração | +5 XP | 5 ciclos guiados de respiração |
| 🎯 Jogo do Foco | +12 XP | Clique no alvo certo em 60s |
| 🖍️ Colorir | +8 XP | Canvas livre com flood fill |
| 🏎️ Corrida | +20 XP | Carro animado, colete estrelas |

---

## 🏅 Sistema de Medalhas

16 medalhas desbloqueáveis:
- Primeiro Jogo, Jogador (5 jogos), Gamer Incrível (10 jogos)
- Nível 5, Nível 10
- 100 XP, 500 XP
- Em Chama (3 dias), Uma Semana (7 dias)
- Dia Perfeito (rotina completa)
- Amigo da Luna, Estudioso, Zen Mestre, Artista, Herói Escolhido, Piloto de Elite

---

## 📚 Matérias do Sistema de Ensino

| Matéria | Tutor |
|---------|-------|
| 🔢 Matemática | Prof. Max |
| 📖 Português | Profa. Lara |
| 🔬 Ciências | Prof. Bio |
| 🏛️ História | Prof. Hermes |
| 🌍 Geografia | Profa. Terra |
| 🇺🇸 Inglês | Teacher Sam |
| 🎨 Artes | Profa. Arte |
| ⚽ Ed. Física | Prof. Flex |
| 🤔 Filosofia | Prof. Sócrates |

---

## 🎨 Personagens

### Adolescentes (fundo azul 💙)
- Prof. Conceição, Geovania, Heitozin, Ingrid, Tryannaxx, Henrique

### Heróis (fundo verde 💚)
- Código Fantasma, Víbora Noturna, Feiticeira Escalate
- Lâmina Fantasma, Dama da Luz, Aurora da Luz

---

## 🔧 Tecnologias Usadas

- **HTML5** — Estrutura semântica e acessível
- **CSS3** — Variáveis CSS, Grid, Flexbox, animações
- **JavaScript Vanilla** — Sem frameworks, máxima compatibilidade
- **Web Audio API** — Sistema de sons
- **Canvas API** — Jogos de corrida e colorir
- **LocalStorage** — Persistência de dados offline
- **Claude API** — IA empática (Anthropic)

---

## ♿ Acessibilidade (WCAG AA)

- Contraste mínimo 4.5:1 em todos os textos
- Botões mínimo 48px (toque acessível)
- Labels ARIA em todos os elementos interativos
- Navegação por teclado (Tab/Enter)
- Sem animações piscantes (seguro para fotossensíveis)
- Modo claro/escuro integrado
- Fontes legíveis (Nunito + Baloo 2)

---

## 💜 Sobre TEA e TDAH

Este projeto foi desenvolvido com base em princípios de:
- **Design Universal** — funciona para todos
- **Estrutura Previsível** — rotinas claras reduzem ansiedade
- **Feedback Imediato** — recompensas instantâneas (especialmente para TDAH)
- **Sobrecarga Sensorial Reduzida** — sem flashes, sons opcionais
- **Linguagem Literal** — evita ambiguidades para TEA
- **Autonomia** — o usuário no controle

---

## 📞 Contato

**CEO Pedro Henrique**  
Projeto Mente Amiga © 2026  
Todos os direitos reservados.

---

*Feito com ❤️ para quem merece o melhor.*