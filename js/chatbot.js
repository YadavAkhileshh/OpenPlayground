/**
 * Chatbot Logic for OpenPlayground Assistant
 * Simple AI assistant that helps users navigate the platform
 */
document.addEventListener("componentLoaded", (e) => {
  if (e.detail.component !== "chatbot") return;

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
let currentState = "idle";

  // Bot reply logic
  function botReply(userText) {
  const msg = userText.trim().toLowerCase();

  // Always allow menu reset
  if (msg === "menu" || msg === "0") {
    currentState = "main_menu";
    return showMainMenu();
  }

  switch (currentState) {
    case "idle":
      if (msg === "hi" || msg === "hello" || msg === "hii") {
        currentState = "main_menu";
        showMainMenu();
      } else {
        showFallback();
      }
      break;

    case "main_menu":
      handleMainMenu(msg);
      break;

    case "explore_projects":
      handleProjectType(msg);
      break;

    case "contribute_menu":
      handleContributeMenu(msg);
      break;

    default:
      showFallback();
  }
}
function showMainMenu() {
  typeMessage(
    "👋 How can I help you today?\n\n" +
    "1️⃣ Explore projects\n\n" +
    "2️⃣ Contributing to OpenPlayground\n\n" +
    "3️⃣ GitHub repository\n\n" +
    "4️⃣ About OpenPlayground\n\n" +
    "Reply with a number (1–4)"
  );
}

function handleMainMenu(choice) {
  switch (choice) {
    case "1":
      currentState = "explore_projects";
      typeMessage(
        "📁 What type of projects are you looking for?\n\n" +
        "1️⃣ Action\n\n" +
        "2️⃣ Puzzle\n\n" +
        "3️⃣ Utility\n\n" +
        "4️⃣ Game\n\n" +
        "Reply with a number or type 0 to go back"
      );
      break;

    case "2":
      currentState = "contribute_menu";
      typeMessage(
        "🤝 How would you like to contribute?\n\n" +
        "1️⃣ Add a project\n\n" +
        "2️⃣ Fix a bug\n\n" +
        "3️⃣ Improve documentation\n\n" +
        "Reply with a number"
      );
      break;

    case "3":
      typeMessage("🐙 Visit our GitHub repository to explore issues and submit PRs!");
      break;

    case "4":
      typeMessage(
        "ℹ️ OpenPlayground is a community-driven platform where developers share and explore interactive projects."
      );
      break;

    default:
      typeMessage("⚠️ Please choose a valid option (1–4)");
  }
}
function handleProjectType(choice) {
  switch (choice) {
    case "1":
      typeMessage("🎨 You can find Action projects in the Projects section using filters.");
      currentState = "idle";
      break;
    case "2":
      typeMessage("🛠 Puzzles  are listed with tech tags..");
      currentState = "idle";
      break;
    case "3":
      typeMessage("🚀 Utility projects combine various skills.");
      currentState = "idle";
      break;
    case "4":
      typeMessage("🌱 Games are marked to help new contributors.");
      currentState = "idle";
      break;
    default:
      typeMessage("⚠️ Please choose a valid option or type 0 to go back.");
  }
}
function showFallback() {
  typeMessage(
    "🤔 I didn’t understand that.\n\n" +
    "Type 'hi' to start or 'menu' to see options."
  );
}
function handleContributeMenu(choice) {
  switch (choice) {
    case "1":
      typeMessage("➕ You can add a project using the Contribute section. Make sure to follow the guidelines.");
      currentState = "idle";
      break;

    case "2":
      typeMessage("🐛 You can fix bugs by checking open issues on GitHub.");
      currentState = "idle";
      break;

    case "3":
      typeMessage("📝 Documentation improvements are always welcome! Look for README or docs files.");
      currentState = "idle";
      break;

    default:
      typeMessage("⚠️ Please choose a valid option or type 0 to go back.");

  }
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
});

