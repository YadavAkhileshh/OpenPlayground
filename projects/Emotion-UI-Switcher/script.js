
        // Emotion theme configurations
        const themes = {
            calm: {
                name: "Calm",
                description: "This UI uses soft, natural colors and slow animations to create a peaceful, relaxing environment. The spacious layout and gentle transitions help reduce cognitive load and promote tranquility.",
                properties: {
                    '--primary-color': '#a3d9b1',
                    '--secondary-color': '#7bc8a6',
                    '--background-color': '#f8fffa',
                    '--text-color': '#2d5a3c',
                    '--accent-color': '#5ca08e',
                    '--card-color': '#ffffff',
                    '--button-color': '#7bc8a6',
                    '--button-text-color': '#ffffff',
                    '--animation-speed': '0.5s',
                    '--border-radius': '12px',
                    '--font-weight': '400',
                    '--spacing': '1.5',
                    '--shadow': '0 4px 12px rgba(163, 217, 177, 0.2)',
                    '--motion-intensity': '0.5',
                    '--background-effect': 'linear-gradient(135deg, #f8fffa 0%, #e6f7ed 100%)'
                }
            },
            focus: {
                name: "Focus",
                description: "Designed for concentration, this mode minimizes distractions with a clean, high-contrast interface. Reduced motion and enhanced readability help maintain attention on the task at hand.",
                properties: {
                    '--primary-color': '#3a506b',
                    '--secondary-color': '#1c2541',
                    '--background-color': '#f0f4f8',
                    '--text-color': '#1c2541',
                    '--accent-color': '#5bc0be',
                    '--card-color': '#ffffff',
                    '--button-color': '#3a506b',
                    '--button-text-color': '#ffffff',
                    '--animation-speed': '0.2s',
                    '--border-radius': '8px',
                    '--font-weight': '500',
                    '--spacing': '1.6',
                    '--shadow': '0 2px 8px rgba(28, 37, 65, 0.1)',
                    '--motion-intensity': '0.2',
                    '--background-effect': 'linear-gradient(135deg, #f0f4f8 0%, #e1e8f0 100%)'
                }
            },
            energetic: {
                name: "Energetic",
                description: "Vibrant colors and dynamic animations create an energetic, stimulating interface. This mode is designed to feel lively and engaging, with bold visual elements that capture attention.",
                properties: {
                    '--primary-color': '#ff6b6b',
                    '--secondary-color': '#ff9e6d',
                    '--background-color': '#fff9f0',
                    '--text-color': '#333333',
                    '--accent-color': '#ff9e6d',
                    '--card-color': '#ffffff',
                    '--button-color': '#ff6b6b',
                    '--button-text-color': '#ffffff',
                    '--animation-speed': '0.3s',
                    '--border-radius': '16px',
                    '--font-weight': '600',
                    '--spacing': '1.4',
                    '--shadow': '0 8px 20px rgba(255, 107, 107, 0.25)',
                    '--motion-intensity': '1.5',
                    '--background-effect': 'linear-gradient(135deg, #fff9f0 0%, #ffe8cc 100%)'
                }
            },
            sad: {
                name: "Sad",
                description: "Muted tones and subtle transitions create a soft, contemplative atmosphere. This UI is designed to feel comforting and gentle, with reduced visual stimulation for moments of reflection.",
                properties: {
                    '--primary-color': '#95a7c4',
                    '--secondary-color': '#7a8fb3',
                    '--background-color': '#f5f7fc',
                    '--text-color': '#4a5568',
                    '--accent-color': '#7a8fb3',
                    '--card-color': '#ffffff',
                    '--button-color': '#95a7c4',
                    '--button-text-color': '#ffffff',
                    '--animation-speed': '0.8s',
                    '--border-radius': '10px',
                    '--font-weight': '400',
                    '--spacing': '1.7',
                    '--shadow': '0 4px 10px rgba(149, 167, 196, 0.15)',
                    '--motion-intensity': '0.3',
                    '--background-effect': 'linear-gradient(135deg, #f5f7fc 0%, #e8edf9 100%)'
                }
            },
            happy: {
                name: "Happy",
                description: "A bright, cheerful palette with playful UI elements creates an uplifting user experience. This mode uses vibrant colors and joyful animations to evoke positivity and delight.",
                properties: {
                    '--primary-color': '#ffd166',
                    '--secondary-color': '#ffb347',
                    '--background-color': '#fffdf5',
                    '--text-color': '#5a4a42',
                    '--accent-color': '#ffb347',
                    '--card-color': '#ffffff',
                    '--button-color': '#ffd166',
                    '--button-text-color': '#5a4a42',
                    '--animation-speed': '0.4s',
                    '--border-radius': '20px',
                    '--font-weight': '500',
                    '--spacing': '1.5',
                    '--shadow': '0 6px 16px rgba(255, 209, 102, 0.3)',
                    '--motion-intensity': '1.2',
                    '--background-effect': 'linear-gradient(135deg, #fffdf5 0%, #fff5e6 100%)'
                }
            }
        };

        // DOM elements
        const emotionButtons = document.querySelectorAll('.emotion-btn');
        const emotionDescription = document.getElementById('emotion-description');
        const root = document.documentElement;
        const speedIndicator = document.getElementById('speed-indicator');
        
        // Property display elements
        const primaryColorEl = document.getElementById('primary-color');
        const animationSpeedEl = document.getElementById('animation-speed');
        const fontWeightEl = document.getElementById('font-weight');
        const lineSpacingEl = document.getElementById('line-spacing');

        // Set initial emotion from localStorage or default to 'calm'
        let currentEmotion = localStorage.getItem('selectedEmotion') || 'calm';

        // Function to apply an emotion theme
        function applyEmotion(emotion) {
            // Update active button
            emotionButtons.forEach(btn => {
                if (btn.dataset.emotion === emotion) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Apply CSS custom properties
            const theme = themes[emotion];
            Object.entries(theme.properties).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });

            // Update emotion description
            emotionDescription.innerHTML = `<p><strong>${theme.name} Mode:</strong> ${theme.description}</p>`;

            // Update property displays
            primaryColorEl.textContent = theme.properties['--primary-color'];
            animationSpeedEl.textContent = theme.properties['--animation-speed'];
            fontWeightEl.textContent = theme.properties['--font-weight'];
            lineSpacingEl.textContent = theme.properties['--spacing'];

            // Update speed indicator text
            const speed = theme.properties['--motion-intensity'];
            if (speed <= 0.3) {
                speedIndicator.textContent = 'Slow';
            } else if (speed <= 0.7) {
                speedIndicator.textContent = 'Normal';
            } else {
                speedIndicator.textContent = 'Fast';
            }

            // Save to localStorage
            localStorage.setItem('selectedEmotion', emotion);
            currentEmotion = emotion;
            
            // Add a subtle animation to the UI preview card
            const uiPreview = document.querySelector('.ui-preview');
            uiPreview.style.transform = 'scale(1.02)';
            setTimeout(() => {
                uiPreview.style.transform = 'scale(1)';
            }, 200);
        }

        // Add event listeners to emotion buttons
        emotionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const emotion = button.dataset.emotion;
                applyEmotion(emotion);
            });
        });

        // Initialize with saved emotion
        document.addEventListener('DOMContentLoaded', () => {
            applyEmotion(currentEmotion);
            
            // Add some interactive effects to the buttons in the preview
            const previewButtons = document.querySelectorAll('.ui-preview .btn');
            previewButtons.forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('float') && !this.classList.contains('pulse')) {
                        this.style.transform = 'translateY(0)';
                    }
                });
            });
            
            // Add focus effect to input
            const sampleInput = document.getElementById('sample-input');
            sampleInput.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 0 0 3px var(--primary-color)';
            });
            
            sampleInput.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });

        // Add a simple console message for demonstration
        console.log('Emotion-Based UI Switcher loaded!');
        console.log('Try selecting different emotions to see how the UI adapts.');
    