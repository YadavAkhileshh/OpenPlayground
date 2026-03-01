/* =====================
   GLOBAL VARIABLES
   ===================== */

let ws = null;
let currentUser = null;
let connectedUsers = new Map();
let messageHistory = [];
let typingTimeout = null;
let autoTranslate = true;
let showOriginal = true;

// Language code to name mapping
const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi'
};

/* =====================
   DOM ELEMENTS
   ===================== */

const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const usernameInput = document.getElementById('username');
const userLanguageSelect = document.getElementById('userLanguage');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesList = document.getElementById('messagesList');
const usersList = document.getElementById('usersList');
const userCount = document.getElementById('userCount');
const userStatus = document.getElementById('userStatus');
const charCount = document.getElementById('charCount');
const autoTranslateCheckbox = document.getElementById('autoTranslate');
const showOriginalCheckbox = document.getElementById('showOriginal');
const typingIndicator = document.getElementById('typingIndicator');
const typingUser = document.getElementById('typingUser');
const translationsList = document.getElementById('translationsList');

/* =====================
   INITIALIZATION
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
    connectBtn.addEventListener('click', handleConnect);
    disconnectBtn.addEventListener('click', handleDisconnect);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    messageInput.addEventListener('input', handleTyping);
    messageInput.addEventListener('input', updateCharCount);
    autoTranslateCheckbox.addEventListener('change', (e) => {
        autoTranslate = e.target.checked;
    });
    showOriginalCheckbox.addEventListener('change', (e) => {
        showOriginal = e.target.checked;
    });

    // Load saved preferences
    loadPreferences();
});

/* =====================
   CONNECTION HANDLERS
   ===================== */

function handleConnect() {
    const username = usernameInput.value.trim() || 'User';
    const language = userLanguageSelect.value;

    if (!username) {
        showError('Please enter a username');
        return;
    }

    // Check if running locally or on server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}?username=${encodeURIComponent(username)}&language=${language}`;

    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            currentUser = { username, language };
            updateConnectionStatus(true);
            clearMessages();
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'flex';
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
            savePreferences();
            showSystemMessage(`${username} connected successfully! 👋`);
        };

        ws.onmessage = (event) => {
            handleWebSocketMessage(JSON.parse(event.data));
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            showError('Connection error. Please try again.');
            updateConnectionStatus(false);
        };

        ws.onclose = () => {
            updateConnectionStatus(false);
            connectBtn.style.display = 'flex';
            disconnectBtn.style.display = 'none';
            messageInput.disabled = true;
            sendBtn.disabled = true;
            currentUser = null;
            connectedUsers.clear();
            updateUsersList();
            showSystemMessage('Disconnected from chat');
        };
    } catch (error) {
        showError('Failed to connect: ' + error.message);
    }
}

function handleDisconnect() {
    if (ws) {
        ws.close();
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'user-joined':
            addUser(data.user);
            showSystemMessage(`${data.user.username} joined the chat 👋`);
            break;

        case 'user-left':
            removeUser(data.userId);
            showSystemMessage(`${data.username} left the chat 👋`);
            break;

        case 'users-update':
            updateConnectedUsers(data.users);
            break;

        case 'message':
            displayMessage(data);
            break;

        case 'typing':
            handleTypingIndicator(data);
            break;

        case 'translation':
            handleTranslation(data);
            break;

        case 'system':
            showSystemMessage(data.message);
            break;

        case 'error':
            showError(data.message);
            break;

        default:
            console.log('Unknown message type:', data.type);
    }
}

/* =====================
   MESSAGE HANDLING
   ===================== */

function sendMessage() {
    const message = messageInput.value.trim();

    if (!message || !ws || ws.readyState !== WebSocket.OPEN) {
        return;
    }

    ws.send(JSON.stringify({
        type: 'message',
        text: message,
        language: currentUser.language
    }));

    messageInput.value = '';
    charCount.textContent = '0';
    clearTypingTimeout();
}

function displayMessage(data) {
    // Remove welcome message if it exists
    const welcomeMsg = messagesList.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.isOwn ? 'own' : ''}`;

    const user = connectedUsers.get(data.userId) || { username: data.username, color: data.userColor };

    const avatarColor = data.userColor || user.color;
    const firstLetter = (data.username || user.username).charAt(0).toUpperCase();

    let messageHTML = `
        <div class="message-avatar" style="background-color: ${avatarColor}">
            ${firstLetter}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${data.username || user.username}</span>
                <span class="message-time">${new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span class="message-lang">${languageNames[data.language] || 'Unknown'}</span>
            </div>
            <div class="message-bubble">${escapeHtml(data.text)}</div>
    `;

    // Show translated message if available
    if (data.translation && data.translation !== data.text && showOriginal) {
        messageHTML += `
            <div class="message-translation">
                <strong>Translation:</strong> ${escapeHtml(data.translation)}
            </div>
        `;
    }

    messageHTML += '</div>';
    messageDiv.innerHTML = messageHTML;

    messagesList.appendChild(messageDiv);
    messagesList.scrollTop = messagesList.scrollHeight;

    // Store in history
    messageHistory.push(data);
    if (messageHistory.length > 200) {
        messageHistory.shift();
    }
}

function showSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        text-align: center;
        padding: 10px;
        color: #999;
        font-size: 12px;
        font-style: italic;
        margin: 5px 0;
    `;
    messageDiv.textContent = message;
    messagesList.appendChild(messageDiv);
    messagesList.scrollTop = messagesList.scrollHeight;
}

function clearMessages() {
    messagesList.innerHTML = `
        <div class="welcome-message">
            <i class="ri-chat-smile-line"></i>
            <h2>Welcome to Language Translator Chat</h2>
            <p>Connect to start chatting with users around the world.</p>
            <p>Your messages will be automatically translated in real-time! 🌍</p>
        </div>
    `;
    messageHistory = [];
}

/* =====================
   TYPING INDICATORS
   ===================== */

function handleTyping(e) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    clearTypingTimeout();

    ws.send(JSON.stringify({
        type: 'typing',
        username: currentUser.username
    }));

    typingTimeout = setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'typing-stop',
                username: currentUser.username
            }));
        }
    }, 2000);
}

function handleTypingIndicator(data) {
    if (data.isTyping) {
        typingUser.textContent = data.username;
        typingIndicator.style.display = 'flex';
    } else {
        typingIndicator.style.display = 'none';
    }
}

function clearTypingTimeout() {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }
}

/* =====================
   TRANSLATION PANEL
   ===================== */

function handleTranslation(data) {
    const translationDiv = document.createElement('div');
    translationDiv.className = 'translation-item';

    const timestamp = new Date(data.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    translationDiv.innerHTML = `
        <div class="translation-title">
            <i class="ri-translate-2"></i>
            ${data.from} → ${data.to} (${timestamp})
        </div>
        <div class="translation-text"><strong>Original:</strong> ${escapeHtml(data.original)}</div>
        <div class="translation-text"><strong>Translated:</strong> ${escapeHtml(data.translated)}</div>
    `;

    // Remove empty state message
    const emptyState = translationsList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    translationsList.insertBefore(translationDiv, translationsList.firstChild);

    // Keep only last 10 translations
    while (translationsList.children.length > 10) {
        translationsList.removeChild(translationsList.lastChild);
    }
}

/* =====================
   USER MANAGEMENT
   ===================== */

function updateConnectedUsers(users) {
    connectedUsers.clear();
    users.forEach(user => {
        connectedUsers.set(user.id, user);
    });
    updateUsersList();
    userCount.textContent = users.length;
}

function addUser(user) {
    connectedUsers.set(user.id, user);
    updateUsersList();
    userCount.textContent = connectedUsers.size;
}

function removeUser(userId) {
    connectedUsers.delete(userId);
    updateUsersList();
    userCount.textContent = connectedUsers.size;
}

function updateUsersList() {
    usersList.innerHTML = '';

    if (connectedUsers.size === 0) {
        usersList.innerHTML = '<p class="empty-state">No users connected</p>';
        return;
    }

    connectedUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';

        const firstLetter = user.username.charAt(0).toUpperCase();

        userItem.innerHTML = `
            <div class="user-avatar" style="background-color: ${user.color}">
                ${firstLetter}
            </div>
            <div class="user-details">
                <div class="user-name" title="${user.username}">${user.username}</div>
                <div class="user-status">${languageNames[user.language] || 'Unknown'}</div>
            </div>
        `;

        usersList.appendChild(userItem);
    });
}

/* =====================
   UI UTILITIES
   ===================== */

function updateConnectionStatus(connected) {
    if (connected) {
        userStatus.innerHTML = '<i class="ri-wifi-line"></i> Connected';
        userStatus.classList.remove('disconnected');
        userStatus.classList.add('connected');
    } else {
        userStatus.innerHTML = '<i class="ri-wifi-off-line"></i> Disconnected';
        userStatus.classList.remove('connected');
        userStatus.classList.add('disconnected');
    }
}

function updateCharCount() {
    charCount.textContent = messageInput.value.length;
}

function showError(message) {
    const modal = document.getElementById('errorModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    modal.classList.add('show');
    modalOverlay.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('errorModal');
    const modalOverlay = document.getElementById('modalOverlay');
    modal.classList.remove('show');
    modalOverlay.classList.remove('show');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* =====================
   PREFERENCES
   ===================== */

function savePreferences() {
    localStorage.setItem('chatUsername', usernameInput.value);
    localStorage.setItem('chatLanguage', userLanguageSelect.value);
    localStorage.setItem('autoTranslate', autoTranslateCheckbox.checked);
    localStorage.setItem('showOriginal', showOriginalCheckbox.checked);
}

function loadPreferences() {
    const savedUsername = localStorage.getItem('chatUsername');
    const savedLanguage = localStorage.getItem('chatLanguage');
    const savedAutoTranslate = localStorage.getItem('autoTranslate');
    const savedShowOriginal = localStorage.getItem('showOriginal');

    if (savedUsername) {
        usernameInput.value = savedUsername;
    }
    if (savedLanguage) {
        userLanguageSelect.value = savedLanguage;
    }
    if (savedAutoTranslate !== null) {
        autoTranslateCheckbox.checked = savedAutoTranslate === 'true';
        autoTranslate = autoTranslateCheckbox.checked;
    }
    if (savedShowOriginal !== null) {
        showOriginalCheckbox.checked = savedShowOriginal === 'true';
        showOriginal = showOriginalCheckbox.checked;
    }
}