const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected users and message history
const users = new Map(); // Map of WebSocket connection to user info
const messageHistory = [];
const MAX_HISTORY = 100;
let userCount = 0;

// User colors for UI differentiation
const userColors = [
  '#a5b4fc', '#fbcfe8', '#bbf7d0', '#fef3c7',
  '#fed7aa', '#fecaca', '#ddd6fe', '#bae6fd'
];

wss.on('connection', (ws, req) => {
  const params = url.parse(req.url, true).query;
  const baseUsername = params.username || `User${++userCount}`;
  const sessionId = params.sessionId || Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Create unique username by appending session ID
  const shortSessionId = sessionId.substr(-4); // Last 4 chars of session ID
  const uniqueUsername = `${baseUsername}#${shortSessionId}`;
  
  const userId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const userColor = params.color || userColors[userCount % userColors.length];
  
  // Store user information
  const userInfo = {
    id: userId,
    username: uniqueUsername,
    baseUsername: baseUsername,
    color: userColor,
    isTyping: false,
    lastTypingTime: 0,
    ws: ws,
    sessionId: sessionId
  };
  
  users.set(ws, userInfo);
  
  console.log(`✅ ${uniqueUsername} connected (ID: ${userId}, Total: ${users.size})`);
  
  // Send user info first (with user ID and unique username)
  ws.send(JSON.stringify({
    type: 'user_info',
    userId: userId,
    username: uniqueUsername,
    color: userColor,
    timestamp: Date.now()
  }));
  
  // Send system welcome message
  ws.send(JSON.stringify({
    type: 'system',
    content: `Welcome ${baseUsername}!`,
    userId: userId,
    timestamp: Date.now(),
    users: Array.from(users.values()).map(u => ({
      id: u.id,
      username: u.username,
      color: u.color,
      online: true
    }))
  }));
  
  // Notify all other users about new connection (EXCLUDE current user)
  broadcast({
    type: 'user_joined',
    userId: userId,
    user: { 
      id: userId, 
      username: uniqueUsername,
      color: userColor, 
      online: true 
    },
    timestamp: Date.now()
  }, ws);
  
  // Broadcast updated user list to everyone (INCLUDING current user)
  broadcastToAll({
    type: 'users_update',
    users: Array.from(users.values()).map(u => ({
      id: u.id,
      username: u.username,
      color: u.color,
      online: true
    }))
  });
  
  // Send recent message history to new user only
  const recentMessages = messageHistory.slice(-20);
  ws.send(JSON.stringify({
    type: 'history',
    messages: recentMessages
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'message':
          const user = users.get(ws);
          if (!user) return;
          
          const messageId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          const chatMessage = {
            type: 'message',
            id: messageId,
            userId: user.id,
            username: user.username,
            color: user.color,
            content: message.content.substring(0, 500),
            timestamp: Date.now()
          };
          
          // Add to history
          messageHistory.push(chatMessage);
          if (messageHistory.length > MAX_HISTORY) {
            messageHistory.shift();
          }
          
          // Broadcast to ALL clients INCLUDING sender
          broadcastToAll(chatMessage);
          console.log(`📨 ${user.username}: ${message.content.substring(0, 30)}... (Broadcasted to ${wss.clients.size} clients)`);
          break;
          
        case 'typing':
          const typingUser = users.get(ws);
          if (typingUser) {
            typingUser.isTyping = message.isTyping;
            typingUser.lastTypingTime = Date.now();
            
            // Broadcast typing status to all OTHER users
            broadcast({
              type: 'typing',
              userId: typingUser.id,
              username: typingUser.username,
              isTyping: message.isTyping
            }, ws);
          }
          break;
          
        case 'load_more':
          const { offset } = message;
          const olderMessages = messageHistory.slice(
            Math.max(0, messageHistory.length - offset - 20),
            messageHistory.length - offset
          );
          
          ws.send(JSON.stringify({
            type: 'older_messages',
            messages: olderMessages,
            hasMore: offset + 20 < messageHistory.length
          }));
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    const user = users.get(ws);
    if (user) {
      users.delete(ws);
      
      console.log(`❌ ${user.username} disconnected (Total: ${users.size})`);
      
      // Notify all remaining users about disconnection
      broadcastToAll({
        type: 'user_left',
        userId: user.id,
        username: user.username,
        timestamp: Date.now()
      });
      
      // Broadcast updated user list
      broadcastToAll({
        type: 'users_update',
        users: Array.from(users.values()).map(u => ({
          id: u.id,
          username: u.username,
          color: u.color,
          online: true
        }))
      });
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast messages to all connected clients EXCLUDING specified one
function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Function to broadcast messages to ALL connected clients INCLUDING sender
function broadcastToAll(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Cleanup typing indicators every 3 seconds
setInterval(() => {
  const now = Date.now();
  users.forEach((user, ws) => {
    if (user.isTyping && now - user.lastTypingTime > 3000) {
      user.isTyping = false;
      broadcast({
        type: 'typing',
        userId: user.id,
        username: user.username,
        isTyping: false
      }, ws);
    }
  });
}, 3000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});