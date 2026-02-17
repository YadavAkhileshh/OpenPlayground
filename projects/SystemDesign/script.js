const systems = {
  url: {
    blocks: ["Client", "Load Balancer", "App Server", "Database", "Cache"],
    description: `
      URL Shortener System:
      - Client sends request
      - Load balancer distributes traffic
      - App server generates short URL
      - Database stores mappings
      - Cache improves read performance
    `
  },

  chat: {
    blocks: ["Client", "WebSocket Server", "Message Queue", "Database", "Notification Service"],
    description: `
      Chat Application:
      - Client connects via WebSocket
      - Server handles real-time messages
      - Message Queue ensures reliability
      - Database stores chat history
      - Notification service sends alerts
    `
  },

  ecommerce: {
    blocks: ["Client", "API Gateway", "Auth Service", "Product Service", "Payment Service", "Database"],
    description: `
      E-Commerce Platform:
      - Client interacts via API Gateway
      - Authentication service verifies users
      - Product service manages catalog
      - Payment service handles transactions
      - Database stores orders & user data
    `
  }
};

function renderSystem() {
  const selected = document.getElementById("systemSelect").value;
  const diagram = document.getElementById("diagram");
  const description = document.getElementById("descriptionText");

  diagram.innerHTML = "";

  systems[selected].blocks.forEach(block => {
    const div = document.createElement("div");
    div.className = "block";
    div.textContent = block;
    diagram.appendChild(div);
  });

  description.innerHTML = systems[selected].description;
}

// Initialize default system
renderSystem();
