# Real-Time Language Translator Chat

A multi-user chat platform built with WebSocket that automatically translates messages between users in real-time.

## Features

✨ **Real-Time Chat**: Instant message delivery with WebSocket
🌍 **Auto Translation**: Messages automatically translated between users' languages
👥 **Multi-User Support**: Connect multiple users simultaneously
🎨 **Beautiful UI**: Modern, responsive design with gradient themes
⚙️ **Language Selection**: Support for 12+ languages
📝 **Typing Indicators**: See when other users are typing
📱 **Responsive**: Works on desktop, tablet, and mobile devices
💾 **Message History**: Recent messages preserved when new users join

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Dynamic interactive UI
- **WebSocket API**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for serving static files
- **WebSocket (ws library)**: Real-time bidirectional communication
- **MyMemory API**: Free translation service (no API key required)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone/Download the project**
   ```bash
   cd Real-Time-Language-Translator-Chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

4. **Open in browser**
   - Navigate to: `http://localhost:3000`
   - Open multiple tabs/windows to simulate multiple users

## Usage

1. **Enter your username** (e.g., "Alice")
2. **Select your language** from the dropdown
3. **Click "Connect to Chat"** to join the chat room
4. **Type a message** and press Enter or click Send
5. **See translations** for messages from users with different languages
6. **Open another tab** and repeat steps 1-3 to add another user

## Project Structure

```
Real-Time-Language-Translator-Chat/
├── index.html           # Main HTML file
├── styles.css           # All styling
├── script.js            # Frontend JavaScript
├── server.js            # Backend Node.js server
├── package.json         # Node dependencies
├── project.json         # Project metadata
└── README.md            # This file
```

## How It Works

### Architecture Flow

```
User A (English)  ──┐
                      │ WebSocket
User B (Spanish)  ──┼──── Server ──── Translation API (MyMemory)
                      │
User C (French)   ──┘
```

### Message Flow

1. **User sends message** in their language
2. **Server receives** message via WebSocket
3. **Server broadcasts** message to all users
4. **For each user with different language**: Server translates message
5. **Translation sent** to client with original message
6. **Client displays** both original and translation

### Real-Time Features

- **Typing Indicators**: Shows when users are typing
- **Live User List**: Updates as users join/leave
- **Connection Status**: Shows connection state
- **Message History**: Last 20 messages shown to new users
- **Automatic Reconnect-friendly**: Messages preserved in history

## Configuration

### Server Configuration
- **PORT**: Default 3000 (can be set via `PORT` environment variable)
- **MAX_HISTORY**: 200 messages stored on server
- **Supported Languages**: 12 languages configured

### Frontend Configuration
- **Local Storage**: Saves username, language, and preferences
- **Message Limit**: 500 characters per message
- **Auto-Translate**: Can be toggled on/off
- **Show Original**: Toggle to show/hide original messages

## Translation Service

This project uses **MyMemory API** for translations:
- **Free**: No API key required
- **Language Pairs**: Supports 12+ languages
- **Rate Limit**: Reasonable free tier limits
- **No Authentication**: Public API access

**To use a premium translation service**, replace the `translateText` function in `server.js` with:
- Google Cloud Translation API
- Azure Translator
- Microsoft Translator
- AWS Translate

## Troubleshooting

### Connection Issues
- Ensure server is running on `localhost:3000`
- Check browser console for WebSocket errors (F12)
- Verify firewall isn't blocking WebSocket connections

### Translation Not Working
- Check internet connection (MyMemory API requires internet)
- Verify language pairs are supported
- Check browser console for API errors

### Messages Not Appearing
- Ensure all users are connected (green "Connected" status)
- Check message length (max 500 characters)
- Verify WebSocket connection is open

## Performance Considerations

- **Message History**: Limited to 200 messages to prevent memory bloat
- **Concurrent Users**: Tested with 50+ simultaneous connections
- **Translation Cache**: Could be implemented for repeated phrases
- **Message Compression**: WebSocket configured with perMessageDeflate disabled for low-latency

## Future Enhancements

- 🔐 User authentication and persistent profiles
- 💬 Private messages and group chats
- 📁 File/image sharing
- 🎙️ Voice message support
- 📚 Message search and filters
- 🌙 Dark mode toggle
- 🔔 Desktop notifications
- 📊 Translation statistics
- 🤖 AI-powered conversation suggestions
- 🎭 Emoji picker integration

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use and modify

## Contributing

Contributions welcome! Feel free to submit issues and pull requests.

## Development Tips

### Adding More Languages
Edit `server.js` and add to `SUPPORTED_LANGUAGES` array:
```javascript
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'NEW_LANG'];
```

Also update `index.html` with a new `<option>` in the language select.

### Debugging
1. Open Browser DevTools (F12)
2. Check Network tab for WebSocket connections
3. Check Console for JavaScript errors
4. Server logs show connection/message info

### Testing Multiple Users Locally
- Open `http://localhost:3000` in multiple browsers/tabs
- Use different usernames and languages
- Send messages to verify translation

## Security Notes

- **Input Sanitization**: HTML special characters are escaped
- **Message Limits**: Max 500 characters per message
- **No Authentication**: This is a demo project
- **Public Translation API**: No sensitive data protection

For production use, add:
- User authentication
- Message encryption
- Rate limiting
- HTTPS/WSS
- CORS configuration
- Input validation and sanitization

Enjoy chatting across languages! 🌍🗣️