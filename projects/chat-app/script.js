// Configuration
const WS_SERVER = 'ws://localhost:8080';
let ws = null;
let username = localStorage.getItem('chat_username') || '';
let userColor = localStorage.getItem('chat_color') || '#a5b4fc';
let messageOffset = 0;
let typingTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isSendingMessage = false;
let currentUserId = localStorage.getItem('chat_userId') || null;

// Generate unique session ID for each browser window
let sessionId = localStorage.getItem('chat_sessionId');
if (!sessionId) {
  sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('chat_sessionId', sessionId);
}

// DOM Elements
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const connectionStatus = document.getElementById('connectionStatus');
const onlineCount = document.getElementById('onlineCount');
const typingIndicator = document.getElementById('typingIndicator');
const typingUsers = document.getElementById('typingUsers');
const usersList = document.getElementById('usersList');
const usersSidebar = document.getElementById('usersSidebar');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const usernameBtn = document.getElementById('usernameBtn');
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const colorOptions = document.getElementById('colorOptions');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');

// User colors for selection
const availableColors = [
  '#a5b4fc', '#fbcfe8', '#bbf7d0', '#fef3c7',
  '#fed7aa', '#fecaca', '#ddd6fe', '#bae6fd',
  '#fda4af', '#86efac', '#c4b5fd', '#93c5fd'
];

// Track processed message IDs to prevent duplicates
const processedMessageIds = new Set();

// Initialize color picker
function initColorPicker() {
  colorOptions.innerHTML = '';
  availableColors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'color-option';
    colorOption.style.backgroundColor = color;
    if (color === userColor) {
      colorOption.classList.add('selected');
    }
    
    colorOption.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      colorOption.classList.add('selected');
      userColor = color;
    });
    
    colorOptions.appendChild(colorOption);
  });
}

// Show username modal if not set
function checkUsername() {
  if (!username) {
    usernameInput.value = '';
    usernameModal.classList.add('show');
    usernameInput.focus();
  } else {
    connectWebSocket();
  }
}

// Save username and connect
saveUsernameBtn.addEventListener('click', () => {
  const newUsername = usernameInput.value.trim() || `User${Math.floor(Math.random() * 1000)}`;
  if (newUsername) {
    username = newUsername;
    localStorage.setItem('chat_username', username);
    localStorage.setItem('chat_color', userColor);
    usernameModal.classList.remove('show');
    
    // Generate NEW session ID when username changes
    sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_sessionId', sessionId);
    currentUserId = null;
    localStorage.removeItem('chat_userId');
    
    connectWebSocket();
  }
});

// Open username modal
usernameBtn.addEventListener('click', () => {
  usernameModal.classList.add('show');
  usernameInput.value = username;
  usernameInput.focus();
});

// Close modal when clicking outside
usernameModal.addEventListener('click', (e) => {
  if (e.target === usernameModal) {
    usernameModal.classList.remove('show');
  }
});

// WebSocket connection
function connectWebSocket() {
  updateConnectionStatus('connecting', '🟡 Connecting...');
  
  const wsUrl = `${WS_SERVER}?username=${encodeURIComponent(username)}&color=${encodeURIComponent(userColor)}&sessionId=${encodeURIComponent(sessionId)}`;
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WebSocket connected, Session ID:', sessionId);
    updateConnectionStatus('connected', '🟢 Connected');
    reconnectAttempts = 0;
    isSendingMessage = false;
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateConnectionStatus('disconnected', '🔴 Connection Error');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    updateConnectionStatus('disconnected', '🔴 Disconnected');
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        connectWebSocket();
      }, 3000 * reconnectAttempts);
    }
  };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
  console.log('Received message:', data.type, data);
  
  switch (data.type) {
    case 'system':
      if (data.userId) {
        currentUserId = data.userId;
        localStorage.setItem('chat_userId', currentUserId);
        console.log('User ID received from server:', currentUserId);
      }
      addSystemMessage(data.content);
      if (data.users) {
        updateUserList(data.users);
      }
      break;
      
    case 'message':
      if (!processedMessageIds.has(data.id)) {
        processedMessageIds.add(data.id);
        if (processedMessageIds.size > 100) {
          const firstId = Array.from(processedMessageIds)[0];
          processedMessageIds.delete(firstId);
        }
        
        addMessage(data, data.userId === currentUserId ? 'user' : 'other');
      }
      break;
      
    case 'user_joined':
      if (data.userId === currentUserId) {
        console.log('Our user joined with ID:', data.userId);
      } else {
        addSystemMessage(`${data.user.username} joined the chat`);
      }
      if (data.user) {
        updateUserList([data.user]);
      }
      break;
      
    case 'user_left':
      if (data.userId !== currentUserId) {
        addSystemMessage(`${data.username} left the chat`);
      }
      // Users list will be updated by users_update
      break;
      
    case 'users_update':
      updateUserList(data.users);
      break;
      
    case 'typing':
      if (data.userId !== currentUserId) {
        updateTypingIndicator(data);
      }
      break;
      
    case 'history':
      processedMessageIds.clear();
      data.messages.forEach(msg => processedMessageIds.add(msg.id));
      loadMessageHistory(data.messages);
      break;
      
    case 'older_messages':
      data.messages.forEach(msg => processedMessageIds.add(msg.id));
      prependMessages(data.messages);
      loadMoreBtn.textContent = data.hasMore ? 
        'Load Older Messages' : 'No More Messages';
      loadMoreBtn.disabled = !data.hasMore;
      break;
      
    case 'user_info':
      if (data.userId) {
        currentUserId = data.userId;
        localStorage.setItem('chat_userId', currentUserId);
        console.log('User ID set from server:', currentUserId);
      }
      break;
  }
}

// Update connection status display
function updateConnectionStatus(status, text) {
  connectionStatus.textContent = text;
  connectionStatus.className = `status ${status}`;
}

// Update online user count
function updateOnlineCount(count) {
  onlineCount.textContent = count;
}

// Update user list in sidebar
function updateUserList(users) {
  usersList.innerHTML = '';
  
  if (users.length === 0) {
    usersList.innerHTML = '<li>No users online</li>';
    return;
  }
  
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="user-dot" style="background-color: ${user.color}"></span>
      <span class="username">${user.username}</span>
      ${user.id === currentUserId ? ' (You)' : ''}
      ${user.online ? '🟢' : '⚫'}
    `;
    usersList.appendChild(li);
  });
  
  updateOnlineCount(users.length);
}

// Add message to chat
function addMessage(data, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const time = new Date(data.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const displayName = type === 'user' ? 'You' : data.username;
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="message-sender" style="color: ${data.color}">
        ${displayName}
      </span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-content">${escapeHtml(data.content)}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Add system message
function addSystemMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system';
  messageDiv.innerHTML = `<span>${escapeHtml(text)}</span>`;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Load message history
function loadMessageHistory(messages) {
  chatMessages.innerHTML = '';
  messages.forEach(msg => {
    addMessage(msg, msg.userId === currentUserId ? 'user' : 'other');
  });
  scrollToBottom();
}

// Prepend older messages
function prependMessages(messages) {
  const scrollPosition = chatMessages.scrollHeight - chatMessages.scrollTop;
  
  messages.reverse().forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.userId === currentUserId ? 'user' : 'other'}`;
    
    const time = new Date(msg.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const displayName = msg.userId === currentUserId ? 'You' : msg.username;
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-sender" style="color: ${msg.color}">
          ${displayName}
        </span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content">${escapeHtml(msg.content)}</div>
    `;
    
    chatMessages.insertBefore(messageDiv, chatMessages.firstChild);
  });
  
  messageOffset += messages.length;
  
  chatMessages.scrollTop = chatMessages.scrollHeight - scrollPosition;
}

// Update typing indicator
function updateTypingIndicator(data) {
  if (data.isTyping && data.userId !== currentUserId) {
    typingIndicator.classList.add('show');
    typingUsers.textContent = `${data.username} is typing...`;
  } else {
    typingIndicator.classList.remove('show');
  }
}

// Send typing status
function sendTypingStatus(isTyping) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'typing',
      isTyping: isTyping
    }));
  }
}

// Handle message input
let isTyping = false;
messageInput.addEventListener('input', () => {
  if (!isTyping) {
    sendTypingStatus(true);
    isTyping = true;
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingStatus(false);
    isTyping = false;
    typingTimeout = null;
  }, 1000);
});

// Handle form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const message = messageInput.value.trim();
  if (!message || !ws || ws.readyState !== WebSocket.OPEN) return;
  
  if (isSendingMessage) return;
  
  isSendingMessage = true;
  
  ws.send(JSON.stringify({
    type: 'message',
    content: message
  }));
  
  messageInput.value = '';
  sendTypingStatus(false);
  clearTimeout(typingTimeout);
  isTyping = false;
  typingTimeout = null;
  
  setTimeout(() => {
    isSendingMessage = false;
  }, 500);
});

// Also allow sending with Enter key
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Load older messages
loadMoreBtn.addEventListener('click', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'load_more',
      offset: messageOffset
    }));
  }
});

// Scroll to bottom of chat
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
function init() {
  initColorPicker();
  checkUsername();
  
  messageInput.focus();
  
  if (window.innerWidth <= 768) {
    const userCount = document.querySelector('.user-count');
    if (userCount) {
      userCount.addEventListener('click', () => {
        usersSidebar.classList.toggle('show');
      });
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

// Reconnect on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && 
      (!ws || ws.readyState !== WebSocket.OPEN)) {
    connectWebSocket();
  }
});