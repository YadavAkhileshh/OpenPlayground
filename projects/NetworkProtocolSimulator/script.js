document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');
    const protocolCards = document.querySelectorAll('.protocol-card');
    const scenarioSelect = document.getElementById('scenario');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const speedBtn = document.getElementById('speed-btn');
    const clientMessages = document.getElementById('client-messages');
    const serverMessages = document.getElementById('server-messages');
    const messageCount = document.getElementById('message-count');
    const latency = document.getElementById('latency');
    const security = document.getElementById('security');
    
    // State
    let currentProtocol = 'http';
    let currentScenario = 'simple-get';
    let isPlaying = false;
    let currentSpeed = 1;
    let messageCounter = 0;
    let simulationInterval;
    let currentStep = 0;
    
    // Conversation data for different protocols
    const conversations = {
        http: {
            name: 'HTTP Chat',
            description: 'Request/Response conversation between browser and server',
            steps: [
                {
                    sender: 'client',
                    delay: 1000,
                    content: 'GET /homepage HTTP/1.1\nHost: example.com\nI\'d like to see the homepage, please!',
                    technical: 'GET /homepage HTTP/1.1\nHost: example.com\nAccept: text/html\nUser-Agent: Browser/1.0',
                    human: 'Browser: "Hello server! Could you please show me the homepage?"',
                    analogy: 'Like asking a librarian for a specific book'
                },
                {
                    sender: 'server',
                    delay: 800,
                    content: 'HTTP/1.1 200 OK\nContent-Type: text/html\nHere\'s the homepage HTML with all the content!',
                    technical: 'HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 1256\n\n<!DOCTYPE html>...',
                    human: 'Server: "Sure! Here\'s the complete homepage with all text and structure."',
                    analogy: 'Librarian handing you the requested book'
                },
                {
                    sender: 'client',
                    delay: 600,
                    content: 'GET /style.css HTTP/1.1\nNow I need the styles to make it look pretty!',
                    technical: 'GET /style.css HTTP/1.1\nHost: example.com\nAccept: text/css',
                    human: 'Browser: "Great! Now I need the styling instructions to make it look nice."',
                    analogy: 'Asking for the book\'s illustrations'
                },
                {
                    sender: 'server',
                    delay: 700,
                    content: 'HTTP/1.1 200 OK\nContent-Type: text/css\nHere are all the styles and colors!',
                    technical: 'HTTP/1.1 200 OK\nContent-Type: text/css\nContent-Length: 456\n\nbody { color: #333; }',
                    human: 'Server: "Here are all the design rules - colors, fonts, and layouts!"',
                    analogy: 'Librarian giving you the illustrations'
                }
            ]
        },
        
        websocket: {
            name: 'WebSocket Chat',
            description: 'Real-time two-way conversation',
            steps: [
                {
                    sender: 'client',
                    delay: 1000,
                    content: 'WebSocket Handshake Request\nLet\'s start a continuous chat!',
                    technical: 'GET /chat HTTP/1.1\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==',
                    human: 'Browser: "Hey server, can we start a real-time chat session?"',
                    analogy: 'Making a phone call instead of sending letters'
                },
                {
                    sender: 'server',
                    delay: 800,
                    content: 'WebSocket Handshake Accepted\nConnection established! We can chat freely now.',
                    technical: 'HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=',
                    human: 'Server: "Phone line is open! We can talk back and forth instantly."',
                    analogy: 'Phone call answered and connected'
                },
                {
                    sender: 'client',
                    delay: 500,
                    content: '{"type": "message", "text": "Hello server!"}',
                    technical: 'WebSocket Frame: FIN=1, OPCODE=1, PAYLOAD="Hello server!"',
                    human: 'Browser: (Instant message) "Hello!"',
                    analogy: 'Speaking during a phone call'
                },
                {
                    sender: 'server',
                    delay: 400,
                    content: '{"type": "message", "text": "Hi browser! How can I help?"}',
                    technical: 'WebSocket Frame: FIN=1, OPCODE=1, PAYLOAD="Hi browser! How can I help?"',
                    human: 'Server: (Instant reply) "Hi! What do you need?"',
                    analogy: 'Immediate response in phone call'
                },
                {
                    sender: 'client',
                    delay: 600,
                    content: '{"type": "data", "update": "New message arrived!"}',
                    technical: 'WebSocket Frame: FIN=1, OPCODE=1, PAYLOAD="New message arrived!"',
                    human: 'Browser: "Someone just sent a new message in the chat!"',
                    analogy: 'Sharing live updates during call'
                }
            ]
        },
        
        https: {
            name: 'HTTPS Handshake',
            description: 'Secure introduction with encryption',
            steps: [
                {
                    sender: 'client',
                    delay: 1000,
                    content: 'ClientHello\nHello server! Let\'s talk securely. Here are the encryption methods I support.',
                    technical: 'ClientHello\nTLS Version: 1.3\nCipher Suites: TLS_AES_128_GCM_SHA256\nRandom: 32 bytes',
                    human: 'Browser: "Hello! I\'d like to start a secure conversation. Here are the secret code methods I know."',
                    analogy: 'Saying "Let\'s speak in code" and showing your codebook'
                },
                {
                    sender: 'server',
                    delay: 1200,
                    content: 'ServerHello + Certificate\nHello! Let\'s use this encryption method. Here\'s my ID card to prove who I am.',
                    technical: 'ServerHello\nTLS Version: 1.3\nCipher Suite: TLS_AES_128_GCM_SHA256\nCertificate: x509 cert\nServerKeyExchange',
                    human: 'Server: "Great! Let\'s use AES-128 encryption. Here\'s my official ID to prove I\'m really example.com."',
                    analogy: 'Agreeing on a code and showing your passport'
                },
                {
                    sender: 'client',
                    delay: 1500,
                    content: 'Key Exchange + Finished\nI verify your ID. Let\'s generate a shared secret key. Ready for encrypted chat!',
                    technical: 'ClientKeyExchange: Pre-master secret encrypted with server public key\nChangeCipherSpec\nFinished: verify_data',
                    human: 'Browser: "Your ID checks out! Let\'s create a shared secret key. Now we can speak privately!"',
                    analogy: 'Verifying passport and creating a shared secret code'
                },
                {
                    sender: 'server',
                    delay: 1000,
                    content: 'Finished\nSecret key confirmed! All future messages will be encrypted. Secure channel established!',
                    technical: 'ChangeCipherSpec\nFinished: verify_data\nEncrypted HTTP can now begin',
                    human: 'Server: "Perfect! Our secret key is set. From now on, everything is encrypted. We\'re secure!"',
                    analogy: 'Confirming the secret code. Now speaking in encrypted language.'
                }
            ]
        },
        
        dns: {
            name: 'DNS Lookup',
            description: 'Finding addresses in the internet directory',
            steps: [
                {
                    sender: 'client',
                    delay: 1000,
                    content: 'DNS Query: example.com\nI need to find the address for "example.com". Who knows where it is?',
                    technical: 'DNS Question\nQNAME: example.com\nQTYPE: A (IPv4 Address)\nQCLASS: IN (Internet)',
                    human: 'Browser: "I want to visit example.com, but I need its IP address first. Where can I find it?"',
                    analogy: 'Looking up a phone number in a directory'
                },
                {
                    sender: 'dns',
                    delay: 800,
                    content: 'Checking cache... Not found here. Let me ask the root DNS servers.',
                    technical: 'Cache Miss\nRecursive query to root server\nRoot server responds with .com TLD server',
                    human: 'Local DNS: "I don\'t have it cached. Let me ask the main internet address book."',
                    analogy: 'Local phone book doesn\'t have it, asking the national directory'
                },
                {
                    sender: 'dns',
                    delay: 1200,
                    content: '.com servers say: Ask ns1.example.com\nThey point me to example.com\'s own name server.',
                    technical: 'TLD Server Response\nAuthoritative nameserver: ns1.example.com\nReferral to authoritative server',
                    human: 'DNS Server: "The .com directory says: Ask example.com\'s own address manager."',
                    analogy: 'National directory gives you the company\'s direct line'
                },
                {
                    sender: 'dns',
                    delay: 1000,
                    content: 'Got it! example.com = 93.184.216.34\nHere\'s the exact IP address for you.',
                    technical: 'Authoritative Response\nAnswer: example.com. 300 IN A 93.184.216.34\nTTL: 300 seconds',
                    human: 'DNS Server: "Found it! example.com lives at 93.184.216.34. I\'ll remember this for 5 minutes."',
                    analogy: 'Company gives you the exact office address and building number'
                },
                {
                    sender: 'client',
                    delay: 600,
                    content: 'Thanks! Now I know where to go: 93.184.216.34',
                    technical: 'Cache Updated\nNow browser can connect to 93.184.216.34:80',
                    human: 'Browser: "Perfect! Now I know the exact address. Let me connect to the server!"',
                    analogy: 'Writing down the address before visiting'
                }
            ]
        }
    };
    
    // Scenarios
    const scenarios = {
        'simple-get': {
            name: 'Simple Page Request',
            protocol: 'http',
            description: 'Basic webpage loading with HTML and CSS'
        },
        'login-form': {
            name: 'Login Form Submission',
            protocol: 'http',
            description: 'POST request with user credentials'
        },
        'chat-app': {
            name: 'Real-time Chat App',
            protocol: 'websocket',
            description: 'Live messaging with WebSocket connection'
        },
        'secure-bank': {
            name: 'Secure Bank Transaction',
            protocol: 'https',
            description: 'Encrypted HTTPS communication for sensitive data'
        },
        'custom': {
            name: 'Custom Conversation',
            protocol: 'http',
            description: 'Build your own protocol conversation'
        }
    };
    
    // Initialize
    init();
    
    function init() {
        // Set up event listeners
        themeToggle.addEventListener('click', toggleTheme);
        helpBtn.addEventListener('click', () => showHelpModal(true));
        closeModal.addEventListener('click', () => showHelpModal(false));
        
        // Protocol selection
        protocolCards.forEach(card => {
            card.addEventListener('click', () => {
                protocolCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentProtocol = card.dataset.protocol;
                updateProtocol(currentProtocol);
                resetSimulation();
            });
        });
        
        // Scenario selection
        scenarioSelect.addEventListener('change', (e) => {
            currentScenario = e.target.value;
            const scenario = scenarios[currentScenario];
            if (scenario.protocol !== currentProtocol) {
                currentProtocol = scenario.protocol;
                updateProtocol(currentProtocol);
            }
            resetSimulation();
        });
        
        // Control buttons
        playBtn.addEventListener('click', startSimulation);
        pauseBtn.addEventListener('click', pauseSimulation);
        resetBtn.addEventListener('click', resetSimulation);
        speedBtn.addEventListener('click', cycleSpeed);
        
        // Close modal on outside click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                showHelpModal(false);
            }
        });
        
        // Load initial protocol
        updateProtocol(currentProtocol);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update button icon
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.innerHTML = `<i class="${icon.className}"></i> ${newTheme === 'dark' ? 'Light' : 'Dark'} Mode`;
    }
    
    function showHelpModal(show) {
        if (show) {
            helpModal.classList.add('active');
        } else {
            helpModal.classList.remove('active');
        }
    }
    
    function updateProtocol(protocol) {
        const protocolData = conversations[protocol];
        
        // Update protocol badge
        const protocolBadge = document.querySelector('.protocol-badge');
        protocolBadge.textContent = protocol.toUpperCase();
        protocolBadge.className = `protocol-badge ${protocol}`;
        
        // Update security indicator
        security.textContent = protocol === 'https' ? 'HTTPS' : 'HTTP';
        
        // Reset simulation for new protocol
        resetSimulation();
    }
    
    function startSimulation() {
        if (isPlaying) return;
        
        isPlaying = true;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        
        const conversation = conversations[currentProtocol];
        currentStep = 0;
        messageCounter = 0;
        
        // Clear previous messages
        clientMessages.innerHTML = '';
        serverMessages.innerHTML = '';
        
        // Start simulation
        simulationInterval = setInterval(() => {
            if (currentStep < conversation.steps.length) {
                const step = conversation.steps[currentStep];
                addMessage(step);
                currentStep++;
            } else {
                pauseSimulation();
            }
        }, 1500 / currentSpeed); // Adjust speed
    }
    
    function pauseSimulation() {
        if (!isPlaying) return;
        
        isPlaying = false;
        clearInterval(simulationInterval);
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetSimulation() {
        pauseSimulation();
        
        // Clear messages
        clientMessages.innerHTML = '';
        serverMessages.innerHTML = '';
        
        // Reset counters
        messageCounter = 0;
        currentStep = 0;
        updateMessageCount();
        
        // Update latency
        latency.textContent = '0ms';
        
        // Update status indicators
        updateStatusIndicators();
    }
    
    function cycleSpeed() {
        const speeds = [0.5, 1, 2, 5];
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        currentSpeed = speeds[nextIndex];
        
        // Update button text
        speedBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ${currentSpeed}x`;
        
        // If simulation is running, update interval
        if (isPlaying) {
            pauseSimulation();
            startSimulation();
        }
    }
    
    function addMessage(step) {
        messageCounter++;
        updateMessageCount();
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${step.sender}`;
        
        // Get current time for display
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0') + ':' + 
                          now.getSeconds().toString().padStart(2, '0');
        
        // Set sender name
        let senderName = 'Browser';
        if (step.sender === 'server') senderName = 'Server';
        if (step.sender === 'dns') senderName = 'DNS Server';
        
        // Create message content
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${senderName}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">${step.content.replace(/\n/g, '<br>')}</div>
            <div class="message-meta">
                Step ${currentStep + 1} • ${step.delay}ms delay • Protocol: ${currentProtocol.toUpperCase()}
            </div>
        `;
        
        // Add to appropriate column
        if (step.sender === 'client') {
            clientMessages.appendChild(messageDiv);
        } else if (step.sender === 'server') {
            serverMessages.appendChild(messageDiv);
        } else {
            // For DNS messages, add to both columns or create special handling
            clientMessages.appendChild(messageDiv.cloneNode(true));
        }
        
        // Scroll to bottom of message containers
        clientMessages.scrollTop = clientMessages.scrollHeight;
        serverMessages.scrollTop = serverMessages.scrollHeight;
        
        // Update details panel
        updateDetailsPanel(step);
        
        // Update latency with random realistic values
        const newLatency = Math.floor(Math.random() * 100) + step.delay;
        latency.textContent = `${newLatency}ms`;
        
        // Update status indicators
        updateStatusIndicators();
        
        // Simulate typing indicator
        showTypingIndicator(step.sender === 'client' ? 'server' : 'client');
    }
    
    function updateMessageCount() {
        messageCount.textContent = messageCounter;
    }
    
    function updateDetailsPanel(step) {
        // Update technical view
        const techCode = document.querySelector('#technical-tab .code-snippet pre');
        if (techCode) {
            techCode.textContent = step.technical;
        }
        
        // Update human translation
        const humanContent = document.querySelector('#human-tab .analogy-content');
        if (humanContent) {
            humanContent.innerHTML = `
                <h4>Human Translation</h4>
                <p class="analogy-text">
                    <strong>${step.sender === 'client' ? 'Browser' : step.sender === 'server' ? 'Server' : 'DNS'}:</strong> 
                    "${step.human.split(':').slice(1).join(':').trim()}"
                </p>
            `;
        }
    }
    
    function showTypingIndicator(sender) {
        // Show typing indicator for the next sender
        const chatColumn = sender === 'client' ? 
            document.querySelector('.client-chat .chat-header') : 
            document.querySelector('.server-chat .chat-header');
        
        const typingIndicator = chatColumn.querySelector('.typing-indicator');
        typingIndicator.style.display = 'flex';
        
        // Hide after a delay
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 800 / currentSpeed);
    }
    
    function updateStatusIndicators() {
        // Update participant status based on simulation state
        const clientStatus = document.querySelector('.participant.client .status');
        const serverStatus = document.querySelector('.participant.server .status');
        const dnsStatus = document.querySelector('.participant.dns-server .status');
        
        if (isPlaying) {
            clientStatus.className = 'status active';
            serverStatus.className = 'status active';
            if (currentProtocol === 'dns') {
                dnsStatus.className = 'status active';
            } else {
                dnsStatus.className = 'status offline';
            }
        } else {
            clientStatus.className = 'status idle';
            serverStatus.className = 'status idle';
            dnsStatus.className = 'status offline';
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to play/pause
        if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            if (isPlaying) {
                pauseSimulation();
            } else {
                startSimulation();
            }
        }
        
        // R to reset
        if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            resetSimulation();
        }
        
        // H for help
        if (e.code === 'KeyH' && e.ctrlKey) {
            e.preventDefault();
            showHelpModal(true);
        }
        
        // Escape to close modal
        if (e.code === 'Escape') {
            showHelpModal(false);
        }
    });
    
    // Initial status update
    updateStatusIndicators();
});