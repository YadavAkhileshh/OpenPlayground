// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global variables
let synth = window.speechSynthesis;
let recognition = null;
let isListening = false;
let isSpeaking = false;
let recordingStartTime = null;
let recordingTimer = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let microphoneSource = null;
let audioStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let visualizerInterval = null;
let currentVolume = 0;
let smoothVolume = 0;
let isEchoCancellationEnabled = true;

// Initialize the application
function initializeApp() {
    createParticles();
    setupNavigation();
    initializeTTS();
    initializeSTT();
    updateCharacterCount();
    setupEventListeners();
}

// Create animated background particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 3;
        
        // Apply styles
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(108, 99, 255, ${Math.random() * 0.2 + 0.1});
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            animation: float ${duration}s ease-in-out ${delay}s infinite;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0); opacity: 0.3; }
            50% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px); opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            switchSection(targetId);
        });
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-sun');
                icon.classList.toggle('fa-moon');
            }
        });
    }
}

// Switch between sections
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Stop any ongoing speech or recognition
    if (isSpeaking) {
        stopSpeaking();
    }
    if (isListening) {
        stopRecognition();
    }
    
    // Stop audio visualization
    stopAudioVisualization();
}

// Initialize audio context for analysis
function initializeAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }
    return true;
}

// Start audio visualization for microphone
function startAudioVisualization() {
    if (!initializeAudioContext()) return false;
    
    // Clear any existing visualization
    stopAudioVisualization();
    
    // Start visualizer animation
    visualizerInterval = setInterval(updateVisualizer, 50);
    
    return true;
}

// Update the CSS visualizer based on audio data
function updateVisualizer() {
    if (!analyser || !dataArray) return;
    
    try {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        currentVolume = sum / dataArray.length / 255;
        
        // Smooth the volume for better visual response
        smoothVolume += (currentVolume - smoothVolume) * 0.2;
        
        // Update visualizer bars
        updateVisualizerBars();
        
        // Update volume bar
        updateVolumeBar();
        
    } catch (error) {
        console.error('Error updating visualizer:', error);
    }
}

// Update CSS visualizer bars
function updateVisualizerBars() {
    const visualizer = document.getElementById('audioVisualizer');
    if (!visualizer) return;
    
    // Create or update bars
    const barCount = 20;
    let barsHTML = '';
    
    // Calculate bar heights based on frequency data
    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const height = 20 + (amplitude * 80); // 20px to 100px
        
        // Calculate color based on amplitude
        const hue = 260 + (amplitude * 60); // Purple (260) to Blue (320)
        const opacity = 0.3 + (amplitude * 0.7);
        
        barsHTML += `
            <div class="visualizer-bar" style="
                height: ${height}%;
                background: hsla(${hue}, 90%, 60%, ${opacity});
                animation-delay: ${i * 0.05}s;
            "></div>
        `;
    }
    
    visualizer.innerHTML = `
        <div class="visualizer-bars">${barsHTML}</div>
        <div class="visualizer-info">
            <span>Live Audio</span>
            <span class="volume-level">${Math.round(smoothVolume * 100)}%</span>
        </div>
    `;
}

// Update microphone volume bar
function updateVolumeBar() {
    const volumeBar = document.getElementById('volumeBar');
    if (!volumeBar) return;
    
    const width = Math.min(100, smoothVolume * 150);
    volumeBar.style.width = `${width}%`;
    
    // Update color based on volume
    if (smoothVolume > 0.6) {
        volumeBar.style.background = 'var(--danger)';
    } else if (smoothVolume > 0.3) {
        volumeBar.style.background = 'var(--warning)';
    } else {
        volumeBar.style.background = 'var(--primary)';
    }
}

// Stop audio visualization
function stopAudioVisualization() {
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
        visualizerInterval = null;
    }
    
    // Reset visualizer to idle state
    const visualizer = document.getElementById('audioVisualizer');
    if (visualizer) {
        // Create idle animation
        const barCount = 20;
        let barsHTML = '';
        
        for (let i = 0; i < barCount; i++) {
            const height = 20 + Math.sin(Date.now() / 1000 + i * 0.3) * 10;
            barsHTML += `
                <div class="visualizer-bar" style="
                    height: ${height}%;
                    background: var(--primary);
                    opacity: 0.3;
                    animation-delay: ${i * 0.1}s;
                "></div>
            `;
        }
        
        visualizer.innerHTML = `
            <div class="visualizer-bars">${barsHTML}</div>
            <div class="visualizer-info">
                <span>Ready</span>
                <span class="volume-level">0%</span>
            </div>
        `;
    }
    
    // Reset volume bar
    const volumeBar = document.getElementById('volumeBar');
    if (volumeBar) {
        volumeBar.style.width = '0%';
        volumeBar.style.background = 'var(--primary)';
    }
}

// Start microphone audio analysis WITH ECHO CANCELLATION
function startMicrophoneAnalysis() {
    if (!initializeAudioContext()) return false;
    
    return new Promise((resolve, reject) => {
        // Request microphone with echo cancellation enabled
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
                channelCount: 1
            },
            video: false
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                audioStream = stream;
                
                // Check if echo cancellation is actually enabled
                const audioTrack = stream.getAudioTracks()[0];
                const settings = audioTrack.getSettings();
                
                console.log('Audio settings:', {
                    echoCancellation: settings.echoCancellation,
                    noiseSuppression: settings.noiseSuppression,
                    autoGainControl: settings.autoGainControl,
                    sampleRate: settings.sampleRate
                });
                
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                
                // Create microphone source
                microphoneSource = audioContext.createMediaStreamSource(stream);
                microphoneSource.connect(analyser);
                
                // Don't connect to destination to prevent feedback loop
                // analyser.connect(audioContext.destination); // REMOVED THIS LINE
                
                // Start recording with echo prevention
                startRecording(stream);
                
                // Start visualization
                startAudioVisualization();
                resolve(true);
            })
            .catch(error => {
                console.error('Microphone access denied:', error);
                
                // Try again with simpler constraints if echo cancellation fails
                if (error.name === 'OverconstrainedError') {
                    console.log('Trying without echo cancellation constraints...');
                    
                    // Try with basic constraints
                    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                        .then(stream => {
                            audioStream = stream;
                            
                            if (audioContext.state === 'suspended') {
                                audioContext.resume();
                            }
                            
                            microphoneSource = audioContext.createMediaStreamSource(stream);
                            microphoneSource.connect(analyser);
                            startRecording(stream);
                            startAudioVisualization();
                            resolve(true);
                        })
                        .catch(fallbackError => {
                            console.error('Fallback microphone access denied:', fallbackError);
                            reject(fallbackError);
                        });
                } else {
                    reject(error);
                }
            });
    });
}

// Start recording audio
function startRecording(stream) {
    try {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.start();
    } catch (error) {
        console.error('Failed to start recording:', error);
    }
}

// Stop audio analysis and cleanup
function stopAudioAnalysis() {
    if (microphoneSource) {
        microphoneSource.disconnect();
        microphoneSource = null;
    }
    
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    // Reset volume tracking
    currentVolume = 0;
    smoothVolume = 0;
}

// Initialize Text-to-Speech
function initializeTTS() {
    // Load voices
    loadVoices();
    
    // Update controls display
    updateControlValues();
    
    // Setup event listeners for TTS controls
    document.getElementById('rate').addEventListener('input', updateControlValues);
    document.getElementById('pitch').addEventListener('input', updateControlValues);
    document.getElementById('volume').addEventListener('input', updateControlValues);
    
    // Text input events
    document.getElementById('textInput').addEventListener('input', function() {
        updateCharacterCount();
        updateEstimatedTime();
    });
    
    // Control buttons
    document.getElementById('clearText').addEventListener('click', function() {
        document.getElementById('textInput').value = '';
        updateCharacterCount();
        updateEstimatedTime();
    });
    
    document.getElementById('sampleText').addEventListener('click', function() {
        const sampleText = "Welcome to VoiceForge! This advanced text-to-speech system uses cutting-edge AI technology. The audio visualizer responds to speech in real-time. You can adjust voice parameters for different effects.";
        document.getElementById('textInput').value = sampleText;
        updateCharacterCount();
        updateEstimatedTime();
    });
    
    // Action buttons
    document.getElementById('speakBtn').addEventListener('click', speakText);
    document.getElementById('pauseBtn').addEventListener('click', pauseSpeaking);
    document.getElementById('resumeBtn').addEventListener('click', resumeSpeaking);
    document.getElementById('stopBtn').addEventListener('click', stopSpeaking);
    
    // Update TTS status
    updateTTSStatus('ready');
    
    // Initialize visualizer on TTS section load
    setTimeout(() => {
        stopAudioVisualization();
    }, 100);
}

// Load available voices
function loadVoices() {
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;
    
    voiceSelect.innerHTML = '';
    
    // Add default options
    const defaultVoices = [
        'Alex (Natural Male)',
        'Samantha (Natural Female)',
        'Daniel (UK English)',
        'Google US Female',
        'Microsoft David'
    ];
    
    defaultVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = voice;
        voiceSelect.appendChild(option);
    });
    
    // Load actual voices if available
    setTimeout(() => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index + defaultVoices.length;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
        }
    }, 1000);
}

// Update control value displays
function updateControlValues() {
    const rate = document.getElementById('rate');
    const pitch = document.getElementById('pitch');
    const volume = document.getElementById('volume');
    
    if (rate) document.getElementById('rateValue').textContent = rate.value;
    if (pitch) document.getElementById('pitchValue').textContent = pitch.value;
    if (volume) document.getElementById('volumeValue').textContent = volume.value;
}

// Update character count
function updateCharacterCount() {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    
    if (textInput && charCount) {
        charCount.textContent = textInput.value.length;
        updateEstimatedTime();
    }
}

// Update estimated speaking time
function updateEstimatedTime() {
    const textInput = document.getElementById('textInput');
    const estTime = document.getElementById('estTime');
    
    if (textInput && estTime) {
        const words = textInput.value.trim().split(/\s+/).length;
        const seconds = Math.max(1, Math.round((words / 150) * 60));
        estTime.textContent = `${seconds}s`;
    }
}

// Speak the text - FIXED to prevent echo
function speakText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    
    if (text === '') {
        alert('Please enter some text to speak.');
        return;
    }
    
    // Stop any ongoing recognition FIRST to prevent echo
    if (isListening) {
        stopRecognition();
    }
    
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice parameters
    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.volume = parseFloat(document.getElementById('volume').value);
    
    // Get selected voice
    const voiceSelect = document.getElementById('voiceSelect');
    const voices = synth.getVoices();
    if (voices.length > 0 && voiceSelect) {
        const voiceIndex = parseInt(voiceSelect.value) % voices.length;
        utterance.voice = voices[voiceIndex];
    }
    
    // Event listeners
    utterance.onstart = function() {
        isSpeaking = true;
        updateTTSStatus('speaking');
        
        // Show visualizer but don't analyze TTS output (prevents echo)
        stopAudioVisualization();
        showTTSVisualizer();
    };
    
    utterance.onend = function() {
        isSpeaking = false;
        updateTTSStatus('ready');
        stopAudioVisualization();
    };
    
    utterance.onerror = function(event) {
        console.error('Speech synthesis error:', event);
        isSpeaking = false;
        updateTTSStatus('error');
        stopAudioVisualization();
    };
    
    utterance.onpause = function() {
        updateTTSStatus('paused');
    };
    
    utterance.onresume = function() {
        updateTTSStatus('speaking');
    };
    
    // Speak the text
    synth.speak(utterance);
}

// Show TTS visualizer (simulated, not analyzing actual audio)
function showTTSVisualizer() {
    const visualizer = document.getElementById('audioVisualizer');
    if (!visualizer) return;
    
    // Create a simulated visualizer for TTS
    const barCount = 20;
    let barsHTML = '';
    
    for (let i = 0; i < barCount; i++) {
        const height = 30 + Math.sin(Date.now() / 200 + i * 0.5) * 40;
        barsHTML += `
            <div class="visualizer-bar" style="
                height: ${height}%;
                background: var(--primary);
                opacity: 0.6;
                animation-delay: ${i * 0.05}s;
            "></div>
        `;
    }
    
    visualizer.innerHTML = `
        <div class="visualizer-bars">${barsHTML}</div>
        <div class="visualizer-info">
            <span>TTS Output</span>
            <span class="volume-level">Active</span>
        </div>
    `;
}

// Pause speaking
function pauseSpeaking() {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        updateTTSStatus('paused');
    }
}

// Resume speaking
function resumeSpeaking() {
    if (synth.speaking && synth.paused) {
        synth.resume();
        updateTTSStatus('speaking');
    }
}

// Stop speaking
function stopSpeaking() {
    if (synth.speaking) {
        synth.cancel();
        isSpeaking = false;
        updateTTSStatus('ready');
        stopAudioVisualization();
    }
}

// Update TTS status
function updateTTSStatus(status) {
    const statusIndicator = document.getElementById('ttsStatus');
    if (!statusIndicator) return;
    
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    const statusColors = {
        'ready': 'var(--success)',
        'speaking': 'var(--primary)',
        'paused': 'var(--warning)',
        'error': 'var(--danger)'
    };
    
    const statusLabels = {
        'ready': 'Ready',
        'speaking': 'Speaking',
        'paused': 'Paused',
        'error': 'Error'
    };
    
    if (statusDot) {
        statusDot.style.background = statusColors[status] || statusColors.ready;
        if (status === 'speaking') {
            statusDot.style.animation = 'pulse 0.5s infinite';
        } else {
            statusDot.style.animation = 'none';
        }
    }
    
    if (statusText) statusText.textContent = statusLabels[status] || statusLabels.ready;
}

// Initialize Speech-to-Text WITH ECHO PREVENTION
function initializeSTT() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported');
        document.getElementById('sttStatus').querySelector('.status-text').textContent = 'Not Supported';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Configure recognition with echo prevention
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = document.getElementById('languageSelect').value;
    recognition.maxAlternatives = 1;
    
    // Add event listener for speech start to auto-stop TTS
    document.addEventListener('speechstart', function() {
        // If TTS is speaking, stop it to prevent echo
        if (isSpeaking) {
            stopSpeaking();
        }
    });
    
    // Event handlers
    recognition.onstart = function() {
        isListening = true;
        updateSTTStatus('listening');
        updateMicUI(true);
        
        // Start microphone audio analysis
        startMicrophoneAnalysis().then(() => {
            console.log('Microphone analysis started with echo cancellation');
        }).catch(error => {
            console.error('Failed to start microphone analysis:', error);
            updateSTTStatus('error');
            updateMicUI(false);
        });
        
        startRecordingTimer();
    };
    
    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        let confidence = 0;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            confidence = Math.max(confidence, event.results[i][0].confidence);
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript = transcript;
            }
        }
        
        // Filter out common echo patterns
        finalTranscript = filterEcho(finalTranscript);
        interimTranscript = filterEcho(interimTranscript);
        
        updateTranscript(finalTranscript, interimTranscript);
        updateConfidence(confidence);
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access.');
        } else if (event.error === 'audio-capture') {
            alert('No microphone found. Please connect a microphone.');
        }
        
        updateSTTStatus('error');
        updateMicUI(false);
        stopRecordingTimer();
        stopAudioAnalysis();
        stopAudioVisualization();
    };
    
    recognition.onend = function() {
        isListening = false;
        updateSTTStatus('ready');
        updateMicUI(false);
        stopRecordingTimer();
        stopAudioAnalysis();
        stopAudioVisualization();
    };
    
    // Setup STT controls
    document.getElementById('startRecognition').addEventListener('click', startRecognition);
    document.getElementById('stopRecognition').addEventListener('click', stopRecognition);
    document.getElementById('clearTranscript').addEventListener('click', clearTranscript);
    document.getElementById('copyTranscript').addEventListener('click', copyTranscript);
    document.getElementById('saveTranscript').addEventListener('click', saveTranscript);
    document.getElementById('downloadAudio').addEventListener('click', downloadAudio);
    
    document.getElementById('languageSelect').addEventListener('change', function() {
        if (recognition) {
            recognition.lang = this.value;
        }
    });
    
    // Sensitivity slider
    document.getElementById('sensitivity').addEventListener('input', function() {
        const sensitivityValue = document.getElementById('sensitivityValue');
        const value = parseFloat(this.value);
        
        if (value >= 0.7) sensitivityValue.textContent = 'High';
        else if (value >= 0.4) sensitivityValue.textContent = 'Medium';
        else sensitivityValue.textContent = 'Low';
    });
    
    // Echo cancellation toggle
    const echoToggle = document.createElement('div');
    echoToggle.className = 'control-group';
    echoToggle.innerHTML = `
        <label><i class="fas fa-volume-mute"></i> Echo Cancellation</label>
        <div class="toggle-switch">
            <input type="checkbox" id="echoToggle" checked>
            <label for="echoToggle" class="toggle-label"></label>
        </div>
    `;
    
    const languageControls = document.querySelector('.language-controls');
    if (languageControls) {
        languageControls.appendChild(echoToggle);
        
        document.getElementById('echoToggle').addEventListener('change', function() {
            isEchoCancellationEnabled = this.checked;
        });
    }
    
    // Mic click event
    document.getElementById('micCircle').addEventListener('click', function() {
        if (!isListening) {
            startRecognition();
        } else {
            stopRecognition();
        }
    });
    
    // Update word count initially
    updateWordCount();
}

// Filter echo patterns from transcript
function filterEcho(text) {
    if (!text) return '';
    
    // Common echo patterns to remove
    const echoPatterns = [
        // Remove repeated phrases (echoes)
        /\b(\w+\s+\w+)\s+\1\b/gi,
        // Remove single word repeats (echoes)
        /\b(\w+)\s+\1\b/gi,
        // Remove common TTS output words that might echo
        /\b(welcome|hello|hi|speech|text|voice|forge)\b/gi
    ];
    
    let filteredText = text;
    
    echoPatterns.forEach(pattern => {
        filteredText = filteredText.replace(pattern, '$1');
    });
    
    // Also remove very short duplicate sentences
    const sentences = filteredText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueSentences = [];
    
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (!uniqueSentences.includes(trimmed) && trimmed.length > 3) {
            uniqueSentences.push(trimmed);
        }
    });
    
    return uniqueSentences.join('. ') + (uniqueSentences.length > 0 ? '.' : '');
}

// Start speech recognition WITH ECHO PREVENTION
function startRecognition() {
    if (!recognition) {
        alert('Speech recognition not available in your browser.');
        return;
    }
    
    // Stop any ongoing TTS first
    if (isSpeaking) {
        stopSpeaking();
    }
    
    try {
        // Request microphone with echo cancellation
        const constraints = isEchoCancellationEnabled ? {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        } : { audio: true };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(() => {
                recognition.start();
                updateSTTStatus('listening');
                updateMicUI(true);
            })
            .catch(error => {
                console.error('Microphone access denied:', error);
                
                // Try without constraints if echo cancellation fails
                if (isEchoCancellationEnabled) {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(() => {
                            recognition.start();
                            updateSTTStatus('listening');
                            updateMicUI(true);
                        })
                        .catch(fallbackError => {
                            console.error('Fallback microphone access denied:', fallbackError);
                            alert('Please allow microphone access to use speech recognition.');
                            updateSTTStatus('error');
                            updateMicUI(false);
                        });
                } else {
                    alert('Please allow microphone access to use speech recognition.');
                    updateSTTStatus('error');
                    updateMicUI(false);
                }
            });
    } catch (error) {
        console.error('Failed to start recognition:', error);
        updateSTTStatus('error');
        updateMicUI(false);
    }
}

// Stop speech recognition
function stopRecognition() {
    if (!recognition) return;
    
    try {
        recognition.stop();
        updateSTTStatus('ready');
        updateMicUI(false);
    } catch (error) {
        console.error('Failed to stop recognition:', error);
    }
}

// Update transcript
function updateTranscript(final, interim) {
    const transcriptElement = document.getElementById('transcript');
    if (!transcriptElement) return;
    
    // Remove placeholder if exists
    const placeholder = transcriptElement.querySelector('.transcript-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add final text
    if (final) {
        const finalSpan = document.createElement('span');
        finalSpan.className = 'final-text';
        finalSpan.textContent = final;
        transcriptElement.appendChild(finalSpan);
    }
    
    // Show interim results
    if (interim) {
        // Remove previous interim result
        const oldInterim = transcriptElement.querySelector('.interim-text');
        if (oldInterim) {
            oldInterim.remove();
        }
        
        const interimSpan = document.createElement('span');
        interimSpan.className = 'interim-text';
        interimSpan.textContent = interim;
        transcriptElement.appendChild(interimSpan);
        
        // Scroll to bottom
        transcriptElement.scrollTop = transcriptElement.scrollHeight;
    }
    
    updateWordCount();
}

// Clear transcript
function clearTranscript() {
    const transcriptElement = document.getElementById('transcript');
    if (transcriptElement) {
        transcriptElement.innerHTML = `
            <div class="transcript-placeholder">
                <i class="fas fa-microphone"></i>
                <p>Your transcribed text will appear here as you speak. Click the microphone to start.</p>
            </div>
        `;
    }
    updateWordCount();
    stopRecordingTimer();
    document.getElementById('confidenceValue').textContent = '0%';
    document.getElementById('recordingTime').textContent = '0s';
}

// Copy transcript to clipboard
function copyTranscript() {
    const transcript = document.getElementById('transcript').textContent;
    if (!transcript || transcript.includes('Your transcribed text')) {
        alert('No transcript to copy. Please speak first.');
        return;
    }
    
    navigator.clipboard.writeText(transcript).then(() => {
        const button = document.getElementById('copyTranscript');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text to clipboard.');
    });
}

// Save transcript as file
function saveTranscript() {
    const transcript = document.getElementById('transcript').textContent;
    if (!transcript || transcript.includes('Your transcribed text')) {
        alert('No transcript to save. Please speak first.');
        return;
    }
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Download recorded audio
function downloadAudio() {
    if (recordedChunks.length === 0) {
        alert('No audio recorded yet. Start speaking first.');
        return;
    }
    
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update microphone UI
function updateMicUI(isActive) {
    const micCircle = document.getElementById('micCircle');
    const micLabel = document.getElementById('micLabel');
    const micRing = document.getElementById('micRing');
    
    if (isActive) {
        micCircle.classList.add('active');
        micLabel.textContent = 'Listening... Speak now';
        micRing.style.animation = 'pulseRing 1.5s infinite';
        
        if (!document.querySelector('#ringAnimation')) {
            const style = document.createElement('style');
            style.id = 'ringAnimation';
            style.textContent = `
                @keyframes pulseRing {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; border-width: 2px; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; border-width: 1px; }
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        micCircle.classList.remove('active');
        micLabel.textContent = 'Click to start speaking';
        micRing.style.animation = 'none';
    }
}

// Update confidence
function updateConfidence(confidence) {
    const confidenceValue = document.getElementById('confidenceValue');
    if (confidenceValue) {
        const percentage = Math.round(confidence * 100);
        confidenceValue.textContent = `${percentage}%`;
        
        if (percentage >= 80) {
            confidenceValue.style.color = 'var(--success)';
        } else if (percentage >= 60) {
            confidenceValue.style.color = 'var(--warning)';
        } else {
            confidenceValue.style.color = 'var(--danger)';
        }
    }
}

// Update word count
function updateWordCount() {
    const transcript = document.getElementById('transcript');
    const wordCount = document.getElementById('wordCount');
    
    if (transcript && wordCount) {
        const text = transcript.textContent;
        const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        wordCount.textContent = count;
    }
}

// Update STT status
function updateSTTStatus(status) {
    const statusIndicator = document.getElementById('sttStatus');
    if (!statusIndicator) return;
    
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    const statusColors = {
        'ready': 'var(--success)',
        'listening': 'var(--primary)',
        'error': 'var(--danger)'
    };
    
    const statusLabels = {
        'ready': 'Ready',
        'listening': 'Listening...',
        'error': 'Error'
    };
    
    if (statusDot) {
        statusDot.style.background = statusColors[status] || statusColors.ready;
        if (status === 'listening') {
            statusDot.style.animation = 'pulse 0.5s infinite';
        } else {
            statusDot.style.animation = 'none';
        }
    }
    
    if (statusText) statusText.textContent = statusLabels[status] || statusLabels.ready;
}

// Start recording timer
function startRecordingTimer() {
    recordingStartTime = new Date();
    recordingTimer = setInterval(() => {
        const elapsed = Math.floor((new Date() - recordingStartTime) / 1000);
        document.getElementById('recordingTime').textContent = `${elapsed}s`;
    }, 1000);
}

// Stop recording timer
function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

// Setup additional event listeners
function setupEventListeners() {
    // Update voices when they load
    if (synth) {
        synth.onvoiceschanged = loadVoices;
    }
    
    // Initial voice load
    if (synth.getVoices().length > 0) {
        loadVoices();
    }
    
    // Update character count on page load
    updateCharacterCount();
    
    // Add visualizer CSS styles
    addVisualizerStyles();
    
    // Add echo cancellation CSS
    addEchoCancellationStyles();
}

// Add visualizer CSS styles
function addVisualizerStyles() {
    if (!document.querySelector('#visualizer-styles')) {
        const style = document.createElement('style');
        style.id = 'visualizer-styles';
        style.textContent = `
            .visualizer-bars {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                gap: 2px;
                height: 100%;
                width: 100%;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .visualizer-bar {
                width: 8px;
                min-height: 20px;
                border-radius: 4px;
                transition: height 0.1s ease;
                animation: barPulse 2s ease-in-out infinite;
            }
            
            @keyframes barPulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            
            .visualizer-info {
                position: absolute;
                bottom: 10px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .volume-level {
                color: var(--primary);
                font-weight: bold;
            }
            
            #audioVisualizer {
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add echo cancellation toggle styles
function addEchoCancellationStyles() {
    if (!document.querySelector('#echo-styles')) {
        const style = document.createElement('style');
        style.id = 'echo-styles';
        style.textContent = `
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-label {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--border-color);
                transition: .4s;
                border-radius: 24px;
            }
            
            .toggle-label:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-label {
                background-color: var(--primary);
            }
            
            input:checked + .toggle-label:before {
                transform: translateX(26px);
            }
        `;
        document.head.appendChild(style);
    }
}

// Add theme styles
if (!document.querySelector('#theme-styles')) {
    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.textContent = `
        .light-theme {
            --dark-bg: #f8f9fa;
            --darker-bg: #e9ecef;
            --card-bg: #ffffff;
            --text-primary: #212529;
            --text-secondary: #6c757d;
            --border-color: #dee2e6;
            --shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .light-theme .grid-lines {
            background-image: 
                linear-gradient(to right, rgba(108, 99, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(108, 99, 255, 0.05) 1px, transparent 1px);
        }
        
        .light-theme .text-input,
        .light-theme .dropdown,
        .light-theme input[type="range"] {
            background: var(--darker-bg);
            color: var(--text-primary);
        }
        
        .transcript-placeholder {
            color: var(--text-secondary);
            text-align: center;
            padding: 3rem 1rem;
        }
        
        .transcript-placeholder i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--border-color);
        }
        
        .transcript-placeholder p {
            line-height: 1.6;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .final-text {
            color: var(--text-primary);
        }
        
        .interim-text {
            color: var(--primary);
            opacity: 0.7;
            font-style: italic;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .status-dot {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}