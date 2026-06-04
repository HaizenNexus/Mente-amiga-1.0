/**
 * Luna – Assistente Virtual para Crianças e Adolescentes com TEA e TDAH
 * script.js – Lógica completa do chat no frontend
 */

// =============================================
// CONFIGURAÇÃO: URL do backend
// =============================================
const BACKEND_URL = "https://luna-backend-duci.onrender.com/chat";

// =============================================
// SELETORES
// =============================================
const chatMessages    = document.getElementById("chat-messages");
const userInput       = document.getElementById("user-input");
const sendBtn         = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

// =============================================
// ESTADO
// =============================================
let isWaiting = false; // Evita envios duplicados enquanto aguarda resposta
let lunaTurns = 0;     // Quantas respostas a Luna já deu (para saudar só na 1ª)

// =============================================
// ESCOPO: A LUNA SÓ FALA DE IDIOMAS
// ---------------------------------------------
// Guardrail no frontend: se a mensagem não for sobre idiomas/línguas,
// a Luna recusa na hora e nem chama o backend.
// =============================================
function normalizeText(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Sinais de que a conversa é sobre idiomas/línguas.
const LANGUAGE_SIGNALS = [
  // a própria ideia de idioma/língua
  /\b(idioma|idiomas|lingua|linguas|linguagem|linguistica|bilingue)\b/,
  // nomes de idiomas (pt e formas nativas)
  /\b(portugues|ingles|english|espanhol|espanol|spanish|frances|french|francais|italiano|italian|alemao|german|deutsch|japones|japanese|nihongo|chines|chinese|mandarim|mandarin|coreano|korean|russo|russian|arabe|arabic|latim|latin|libras|hebraico|holandes|grego|polones)\b/,
  // tradução / significado
  /\b(traduz|traduza|traduzir|traducao|translate|translation)\b/,
  /(significa|significado|quer dizer|como se diz|como se fala|como se escreve|como fala|como escrevo|como pronuncia)/,
  // fonética / escrita
  /\b(pronunc|sotaque|accent|soletr|alfabeto|letra|letras|silaba|silabas|acento)\b/,
  // gramática / vocabulário
  /\b(gramatica|grammar|verbo|verbos|verb|conjug|vocabulario|vocabulary|palavra|palavras|word|words|frase|frases|sentence|expressao|expressoes)\b/,
  /\b(plural|singular|feminino|masculino|artigo|preposicao|adjetivo|substantivo|adverbio|pronome|tempo verbal|presente|passado|futuro)\b/,
  // pedir em outra língua
  /(in english|em ingles|en espanol|en frances|auf deutsch)/,
  // saudações/expressões comuns (servem pra começar a praticar)
  /\b(hello|hi|hey|hola|bonjour|ciao|hallo|salut|konnichiwa|ni hao|annyeong|gracias|merci|danke|arigato|thank you|please|good morning|good night|goodbye|bye)\b/,
  // saudações em português pra iniciar a conversa
  /\b(oi|ola|opa|bom dia|boa tarde|boa noite)\b/,
];

function isLanguageTopic(text) {
  const t = normalizeText(text);
  if (!t) return false;
  return LANGUAGE_SIGNALS.some((re) => re.test(t));
}

// Mensagem de recusa (na voz da Luna).
const OFF_TOPIC_REPLY =
  "Ops! 🌍 Eu sou a Luna e só sei conversar sobre idiomas e línguas, nada além disso.\n" +
  'Que tal me perguntar algo assim: "Como se diz obrigado em inglês?" ou "O que significa hello?" 💜';

// Embrulha a mensagem com o contexto de professora de idiomas, para
// orientar o backend a responder sempre dentro do tema.
function buildLanguagePrompt(text) {
  return (
    "Você é a Luna, uma professora de idiomas simpática para crianças e adolescentes. " +
    "Responda sempre em português, de forma curta, gentil e divertida, e fale APENAS sobre " +
    "idiomas, línguas e como aprendê-los (tradução, vocabulário, pronúncia, gramática, frases). " +
    "Se a pergunta não for sobre idiomas, diga com carinho que você só ajuda com idiomas. " +
    'Pergunta da criança: "' + text + '"'
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// =============================================
// SAUDAÇÃO SÓ NA PRIMEIRA RESPOSTA
// ---------------------------------------------
// O backend tende a começar toda resposta com "Oii". A partir da 2ª
// resposta, removemos essa saudação inicial para o papo fluir natural.
// =============================================
// Saudação no início: "oi", "oii", "olá", "opa", "e aí", "hey"...
// seguida de pontuação/espaço (ou fim), para não cortar "oitavo", "olaria" etc.
const LEADING_GREETING_RE =
  /^[\s]*(?:oi+e?|oi+|olá+|ola+|opa|oie+|e a[ií]|hey+|hello|hi)(?=$|[\s,!.…?:–—-])[\s,!.…?:–—-]*/i;

function stripLeadingGreeting(text) {
  const stripped = (text || "").replace(LEADING_GREETING_RE, "");
  const clean = stripped.trim();
  if (!clean) return (text || "").trim();           // nunca esvazia a bolha
  return clean.charAt(0).toUpperCase() + clean.slice(1); // recapitaliza
}

// =============================================
// AUTO-RESIZE DO TEXTAREA
// =============================================
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

// =============================================
// ENVIAR COM ENTER (Shift+Enter = nova linha)
// =============================================
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

sendBtn.addEventListener("click", () => handleSend());

// =============================================
// FUNÇÃO PRINCIPAL: ENVIAR MENSAGEM
// =============================================
async function handleSend() {
  const text = userInput.value.trim();

  // Validações básicas
  if (!text || isWaiting) return;
  if (text.length > 500) {
    showError("Sua mensagem é muito longa! Tente escrever um pouquinho menos. 😊");
    return;
  }

  isWaiting = true;
  setInputDisabled(true);

  // 1. Exibe mensagem do usuário na tela
  appendMessage(text, "user");

  // 2. Limpa o campo de texto
  userInput.value = "";
  userInput.style.height = "auto";

  // 2.5. TRAVA DE ASSUNTO: se não for sobre idiomas, recusa sem chamar o backend.
  if (!isLanguageTopic(text)) {
    showTypingIndicator();
    await wait(650);
    hideTypingIndicator();
    appendMessage(OFF_TOPIC_REPLY, "luna");
    isWaiting = false;
    setInputDisabled(false);
    userInput.focus();
    return;
  }

  // 3. Mostra indicador de digitação
  showTypingIndicator();

  // 4. Chama o backend (com o contexto de professora de idiomas)
  try {
    let reply = await sendToBackend(buildLanguagePrompt(text));
    hideTypingIndicator();
    lunaTurns++;
    // Saúda só na 1ª resposta; nas seguintes, remove o "Oii" inicial.
    if (lunaTurns > 1) reply = stripLeadingGreeting(reply);
    appendMessage(reply, "luna");
  } catch (err) {
    hideTypingIndicator();
    console.error("Erro ao se comunicar com o backend:", err);
    appendMessage(
      "Opa! Parece que tive um probleminha para te responder agora. 😅 Tenta de novo daqui a pouco, tá? Estou aqui esperando! 💜",
      "luna"
    );
  }

  isWaiting = false;
  setInputDisabled(false);
  userInput.focus();
}

// =============================================
// CHAMAR O BACKEND
// =============================================
async function sendToBackend(message) {
  const response = await fetch("https://luna-backend-duci.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
  }

  const data = await response.json();

  // Verifica se a resposta tem o campo esperado
  if (!data.reply) {
    throw new Error("Resposta inválida do servidor.");
  }

  return data.reply;
}

// =============================================
// RENDERIZAR MENSAGEM NA TELA
// =============================================
function appendMessage(text, sender) {
  const isLuna = sender === "luna";

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", isLuna ? "luna-wrapper" : "user-wrapper");

  // Avatar
  if (isLuna) {
    const avatar = document.createElement("div");
    avatar.classList.add("message-avatar");
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "🌙";
    wrapper.appendChild(avatar);
  }

  // Bolha de mensagem
  const bubble = document.createElement("div");
  bubble.classList.add("message", isLuna ? "luna-message" : "user-message");

  // Converte texto simples com quebras de linha em parágrafos
  if (isLuna) {
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== "");
    if (paragraphs.length > 1) {
      paragraphs.forEach(para => {
        const p = document.createElement("p");
        p.textContent = para;
        bubble.appendChild(p);
      });
    } else {
      bubble.textContent = text;
    }
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  // Scroll automático suave até o final
  scrollToBottom();
}

// =============================================
// MOSTRAR / ESCONDER DIGITANDO
// =============================================
function showTypingIndicator() {
  typingIndicator.style.display = "flex";
  scrollToBottom();
}

function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}

// =============================================
// SCROLL AUTOMÁTICO
// =============================================
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  });
}

// =============================================
// DESABILITAR / HABILITAR INPUT
// =============================================
function setInputDisabled(disabled) {
  userInput.disabled = disabled;
  sendBtn.disabled   = disabled;

  if (disabled) {
    userInput.setAttribute("aria-disabled", "true");
    sendBtn.setAttribute("aria-busy", "true");
  } else {
    userInput.removeAttribute("aria-disabled");
    sendBtn.removeAttribute("aria-busy");
  }
}

// =============================================
// EXIBIR MENSAGEM DE ERRO (usa bolha da Luna)
// =============================================
function showError(message) {
  appendMessage(message, "luna");
}

// =============================================
// AQUECIMENTO DO BACKEND (Render dorme após inatividade)
// ---------------------------------------------
// Ao abrir a página, "cutucamos" o servidor para ele acordar enquanto
// a criança lê as boas-vindas e digita. Assim a 1ª mensagem real já
// chega com o backend desperto, sem aquele atraso de cold-start.
// Não cria mensagem de chat: é só um GET para acordar o serviço.
// Erros/404/CORS são ignorados de propósito.
// =============================================
function warmUpBackend() {
  try {
    const origin = new URL(BACKEND_URL).origin;
    fetch(origin, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    /* silencioso */
  }
}

// =============================================
// FOCO INICIAL
// =============================================
window.addEventListener("load", () => {
  userInput.focus();
  warmUpBackend();
});