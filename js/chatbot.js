// Chatbot logic for OpenPlayground Assistant
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot");
const closeChat = document.getElementById("close-chat");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const messages = document.getElementById("chatbot-messages");

/* Toggle chatbot */
if (chatbotToggle) {
  chatbotToggle.addEventListener("click", () => {
    if (chatbot) chatbot.style.display = "flex";
  });
}

if (closeChat) {
  closeChat.addEventListener("click", () => {
    if (chatbot) chatbot.style.display = "none";
  });
}

/* Send message */
function sendMessage() {
  if (!userInput) return;
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    botReply(text);
  }, 500);
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (userInput) userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function addMessage(text, sender) {
  if (!messages) return;
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.innerText = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

/* Simple Bot Logic */
function botReply(userText) {
  let reply = "I'm not sure 🤔. Try asking about projects or contributing.";

  const msg = userText.toLowerCase();

  if (msg.includes("project")) {
    reply = "📁 You can explore projects in the Projects section.";
  } else if (msg.includes("contribute")) {
    reply = "🤝 Scroll to the Contribute section to see steps to contribute.";
  } else if (msg.includes("github")) {
    reply = "🐙 Visit our GitHub repository to see code and issues.";
  } else if (msg.includes("hello") || msg.includes("hi")) {
    reply = "👋 Hello! How can I help you today?";
  }

  addMessage(reply, "bot");
}
