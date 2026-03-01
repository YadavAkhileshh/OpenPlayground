const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const express = require('express');
const path = require('path');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket server
const wss = new WebSocket.Server({ server, perMessageDeflate: false });

// Store connected users and message history
const users = new Map(); // Map of WebSocket connection to user info
const messageHistory = [];
const typingUsers = new Map();
const MAX_HISTORY = 200;
let userCounter = 0;

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'];

// User colors for avatar differentiation
const userColors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#00f2fe', '#43e97b', '#fa709a', '#fee140',
    '#30cfd0', '#330867', '#a8edea', '#fed6e3'
];

/* =====================
   WEBSOCKET CONNECTION
   ===================== */

wss.on('connection', (ws, req) => {
    // Parse query parameters
    const params = url.parse(req.url, true).query;
    const username = params.username || `User${++userCounter}`;
    const language = SUPPORTED_LANGUAGES.includes(params.language) ? params.language : 'en';
    const userId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const userColor = userColors[userCounter % userColors.length];

    const userInfo = {
        id: userId,
        username: username,
        language: language,
        color: userColor,
        isTyping: false,
        ws: ws
    };

    users.set(ws, userInfo);

    console.log(`✅ ${username} connected (Language: ${language}, Total: ${users.size})`);

    // Broadcast user joined event
    broadcastUserUpdate({
        type: 'user-joined',
        user: sanitizeUser(userInfo)
    });

    // Send current users list to new user
    ws.send(JSON.stringify({
        type: 'users-update',
        users: Array.from(users.values()).map(sanitizeUser)
    }));

    // Send recent message history
    messageHistory.slice(-20).forEach(msg => {
        ws.send(JSON.stringify(msg));
    });

    /* =====================
       MESSAGE HANDLERS
       ===================== */

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'message':
                    handleChatMessage(ws, userInfo, message);
                    break;

                case 'typing':
                    handleTyping(ws, userInfo, true);
                    break;

                case 'typing-stop':
                    handleTyping(ws, userInfo, false);
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Message parsing error:', error);
        }
    });

    ws.on('close', () => {
        users.delete(ws);
        typingUsers.delete(ws);
        console.log(`❌ ${username} disconnected (Total: ${users.size})`);

        // Broadcast user left event
        broadcastUserUpdate({
            type: 'user-left',
            userId: userId,
            username: username
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

/* =====================
   MESSAGE HANDLERS
   ===================== */

function handleChatMessage(ws, userInfo, message) {
    const text = message.text.trim();

    if (!text || text.length > 500) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Message must be between 1 and 500 characters'
        }));
        return;
    }

    // Stop typing if user was typing
    if (typingUsers.has(ws)) {
        typingUsers.delete(ws);
        broadcastTyping(userInfo, false);
    }

    // Create message object
    const chatMessage = {
        type: 'message',
        userId: userInfo.id,
        username: userInfo.username,
        text: text,
        language: userInfo.language,
        userColor: userInfo.color,
        timestamp: new Date(),
        isOwn: false
    };

    // Store in history
    messageHistory.push(chatMessage);
    if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift();
    }

    // Broadcast to all users
    const messageToSend = JSON.stringify(chatMessage);
    users.forEach((user, client) => {
        if (client.readyState === WebSocket.OPEN) {
            // Mark as own message for sender
            const msg = JSON.parse(messageToSend);
            msg.isOwn = (client === ws);

            client.send(JSON.stringify(msg));

            // Send translation if different language
            if (user.language !== userInfo.language) {
                translateAndSend(client, text, userInfo.language, user.language, userInfo.username);
            }
        }
    });
}

function handleTyping(ws, userInfo, isTyping) {
    if (isTyping) {
        typingUsers.set(ws, userInfo);
    } else {
        typingUsers.delete(ws);
    }

    broadcastTyping(userInfo, isTyping);
}

function broadcastTyping(userInfo, isTyping) {
    const typingMessage = JSON.stringify({
        type: 'typing',
        username: userInfo.username,
        isTyping: isTyping
    });

    users.forEach((user, ws) => {
        if (ws.readyState === WebSocket.OPEN && user.id !== userInfo.id) {
            ws.send(typingMessage);
        }
    });
}

/* =====================
   TRANSLATION HANDLER
   ===================== */

async function translateAndSend(client, text, fromLang, toLang, senderName) {
    try {
        const translated = await translateText(text, fromLang, toLang);

        if (translated && translated !== text) {
            client.send(JSON.stringify({
                type: 'translation',
                original: text,
                translated: translated,
                from: fromLang,
                to: toLang,
                sender: senderName,
                timestamp: new Date()
            }));
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
}

// Simple translation using free API (Google Translate via API)
async function translateText(text, fromLang, toLang) {
    if (fromLang === toLang) {
        return text;
    }

    try {
        // Using a simple translation approach with public API
        // In production, use proper translation service like Google Cloud Translation, Azure Translator, etc.
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        );

        if (!response.ok) {
            throw new Error('Translation API error');
        }

        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }

        return null;
    } catch (error) {
        console.error('Translation failed:', error);
        return null;
    }
}

/* =====================
   BROADCAST FUNCTIONS
   ===================== */

function broadcastUserUpdate(update) {
    const usersUpdate = {
        type: 'users-update',
        users: Array.from(users.values()).map(sanitizeUser),
        ...update
    };

    users.forEach((user, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(usersUpdate));
        }
    });
}

/* =====================
   UTILITY FUNCTIONS
   ===================== */

function sanitizeUser(user) {
    return {
        id: user.id,
        username: user.username,
        language: user.language,
        color: user.color,
        isTyping: user.isTyping || false
    };
}

/* =====================
   SERVER START
   ===================== */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`\n🚀 Real-Time Language Translator Chat Server Running!`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 WebSocket: ws://localhost:${PORT}`);
    console.log(`\n⏳ Waiting for connections...\n`);
});