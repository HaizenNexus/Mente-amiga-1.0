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

  // 3. Mostra indicador de digitação
  showTypingIndicator();

  // 4. Chama o backend
  try {
    const reply = await sendToBackend(text);
    hideTypingIndicator();
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
// FOCO INICIAL
// =============================================
window.addEventListener("load", () => {
  userInput.focus();
});