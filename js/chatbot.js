/**
 * Chatbot Logic for OpenPlayground Assistant
 * Simple AI assistant that helps users navigate the platform
 */

(function () {
  // Elements
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbot = document.getElementById("chatbot");
  const closeChat = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatSend");
  const userInput = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  // Toggle chatbot visibility
  function toggleChatbot() {
    if (!chatbot) return;
    const isVisible = chatbot.style.display === "flex";
    chatbot.style.display = isVisible ? "none" : "flex";
  }

  // Event listeners for toggle
  if (chatbotToggle) {
    chatbotToggle.addEventListener("click", toggleChatbot);
  }

  if (closeChat) {
    closeChat.addEventListener("click", () => {
      if (chatbot) chatbot.style.display = "none";
    });
  }

  // Send message function
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

  // Event listeners for sending
  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  // Add message to chat
  function addMessage(text, sender) {
    if (!messages) return;
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "user-message" : "bot-message";
    msg.innerText = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Bot reply logic
  function botReply(userText) {
    let reply = "I'm not sure 🤔. Try asking about projects or contributing.";
    const msg = userText.toLowerCase();

    if (msg.includes("project")) {
      reply = "📁 You can explore projects in the Projects section above. Use filters to find specific types!";
    } else if (msg.includes("contribute")) {
      reply = "🤝 Scroll down to see the Contribute section with step-by-step instructions.";
    } else if (msg.includes("github")) {
      reply = "🐙 Visit our GitHub repository to explore the code, open issues, or submit PRs!";
    } else if (msg.includes("hello") || msg.includes("hi")) {
      reply = "👋 Hello! I'm the OpenPlayground AI. How can I help you today?";
    } else if (msg.includes("theme") || msg.includes("dark") || msg.includes("light")) {
      reply = "🎨 You can toggle between dark and light themes using the toggle in the navigation bar!";
    } else if (msg.includes("search") || msg.includes("find")) {
      reply = "🔍 Use the search box in the Projects section to find specific projects by name or technology!";
    } else if (msg.includes("help")) {
      reply = "🆘 I can help you with: projects, contributing, GitHub, theme, and searching. Just ask!";
    }

    // Typing effect
    typeMessage(reply);
  }

  // Typing effect for bot messages
  function typeMessage(text) {
    if (!messages) return;

    const div = document.createElement("div");
    div.className = "bot-message";
    messages.appendChild(div);

    let i = 0;
    const typing = setInterval(() => {
      div.textContent += text.charAt(i);
      i++;
      messages.scrollTop = messages.scrollHeight;
      if (i === text.length) clearInterval(typing);
    }, 20);
  }

  // Expose toggleChatbot globally if needed
  window.toggleChatbot = toggleChatbot;
})();
