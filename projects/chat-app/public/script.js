// Get DOM elements
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");

// Handle form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return; // Prevent empty messages

  addMessage(text, "user"); // Show user message
  messageInput.value = "";
  messageInput.disabled = true; // Disable input while waiting

  // Show typing indicator
  if (!document.getElementById("typing-indicator")) {
    addMessage("Typing...", "bot", true);
  }

  try {
    // Call backend API
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    removeTypingIndicator();
    addMessage(data.reply ?? "No response from AI.", "bot");

  } catch (error) {
    console.error(error);
    removeTypingIndicator();
    addMessage("Something went wrong. Please try again.", "bot");
  } finally {
    messageInput.disabled = false; // Re-enable input
    messageInput.focus();
  }
});

// Add a message to the chat
function addMessage(text, type, isTyping = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);

  // Typing indicator
  if (isTyping && !document.getElementById("typing-indicator")) {
    msg.id = "typing-indicator";
  }

  const span = document.createElement("span");
  span.textContent = text; // Secure rendering

  msg.appendChild(span);
  chatMessages.appendChild(msg);

  // Auto-scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

