
        const categoryFilter = document.getElementById('categoryFilter');
        const headingFontSelect = document.getElementById('headingFontSelect');
        const bodyFontSelect = document.getElementById('bodyFontSelect');
        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const lineHeightSlider = document.getElementById('lineHeight');
        const lineHeightValue = document.getElementById('lineHeightValue');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const randomPairingBtn = document.getElementById('randomPairingBtn');
        const savePairingBtn = document.getElementById('savePairingBtn');
        const copyCssBtn = document.getElementById('copyCssBtn');
        const copyAllCssBtn = document.getElementById('copyAllCssBtn');
        const testHeadingBtn = document.getElementById('testHeadingBtn');
        const testBodyBtn = document.getElementById('testBodyBtn');
        const currentPairingPreview = document.getElementById('currentPairingPreview');
        const pairingsGrid = document.getElementById('pairingsGrid');
        const favoritesList = document.getElementById('favoritesList');
        const emptyFavorites = document.getElementById('emptyFavorites');
        const cssOutput = document.getElementById('cssOutput');
        const contrastRatio = document.getElementById('contrastRatio');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const colorItems = document.querySelectorAll('.color-item');
        
        // App data
        let currentPairing = null;
        let allPairings = [];
        let filteredPairings = [];
        let favorites = JSON.parse(localStorage.getItem('fontHarmonyFavorites')) || [];
        let availableFonts = [];
        let textColor = '#111827';
        
        // Font pairings data
        const fontPairings = [
            {
                id: 1,
                name: "Modern Professional",
                heading: "Inter",
                body: "Open Sans",
                category: "sans-sans",
                description: "Clean and professional, perfect for corporate websites and applications.",
                headingWeights: [400, 500, 600, 700, 800],
                bodyWeights: [300, 400, 500, 600, 700],
                rating: 4.8
            },
            {
                id: 2,
                name: "Elegant Editorial",
                heading: "Playfair Display",
                body: "Source Sans Pro",
                category: "serif-sans",
                description: "Classic serif heading with clean sans body - great for blogs and magazines.",
                headingWeights: [400, 500, 600, 700],
                bodyWeights: [300, 400, 600, 700],
                rating: 4.7
            },
            {
                id: 3,
                name: "Minimalist",
                heading: "Montserrat",
                body: "Roboto",
                category: "sans-sans",
                description: "Clean and minimal, works well for portfolios and modern websites.",
                headingWeights: [300, 400, 500, 600, 700],
                bodyWeights: [300, 400, 500, 700],
                rating: 4.5
            },
            {
                id: 4,
                name: "Classic Serif",
                heading: "Libre Baskerville",
                body: "Lora",
                category: "serif-serif",
                description: "Traditional serif pairing perfect for formal documents and publications.",
                headingWeights: [400, 700],
                bodyWeights: [400, 500, 600, 700],
                rating: 4.3
            },
            {
                id: 5,
                name: "Friendly & Approachable",
                heading: "Nunito",
                body: "Karla",
                category: "sans-sans",
                description: "Rounded and friendly fonts that create a warm, approachable feel.",
                headingWeights: [300, 400, 600, 700],
                bodyWeights: [400, 500, 600, 700],
                rating: 4.6
            },
            {
                id: 6,
                name: "Bold & Modern",
                heading: "Poppins",
                body: "Inter",
                category: "sans-sans",
                description: "Geometric sans-serif fonts that work well for tech startups and modern brands.",
                headingWeights: [300, 400, 500, 600, 700],
                bodyWeights: [300, 400, 500, 600, 700, 800],
                rating: 4.7
            },
            {
                id: 7,
                name: "Editorial Elegance",
                heading: "Merriweather",
                body: "Open Sans",
                category: "serif-sans",
                description: "Highly readable serif heading with a versatile sans body font.",
                headingWeights: [300, 400, 700],
                bodyWeights: [300, 400, 500, 600, 700],
                rating: 4.4
            },
            {
                id: 8,
                name: "Clean & Simple",
                heading: "Raleway",
                body: "Work Sans",
                category: "sans-sans",
                description: "Elegant and clean fonts with excellent readability for UI design.",
                headingWeights: [300, 400, 500, 600, 700],
                bodyWeights: [300, 400, 500, 600],
                rating: 4.5
            },
            {
                id: 9,
                name: "Modern Display",
                heading: "Rubik",
                body: "Nunito",
                category: "display-body",
                description: "A contemporary geometric heading with a friendly rounded body font.",
                headingWeights: [400, 500, 600],
                bodyWeights: [300, 400, 600, 700],
                rating: 4.2
            },
            {
                id: 10,
                name: "Playful & Creative",
                heading: "Poppins",
                body: "Karla",
                category: "playful",
                description: "Friendly and modern fonts perfect for creative agencies and portfolios.",
                headingWeights: [300, 400, 500, 600, 700],
                bodyWeights: [400, 500, 600, 700],
                rating: 4.6
            }
        ];
        
        // Available Google Fonts
        const googleFonts = [
            { name: "Inter", category: "sans-serif", weights: [300, 400, 500, 600, 700, 800] },
            { name: "Poppins", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
            { name: "Playfair Display", category: "serif", weights: [400, 500, 600, 700] },
            { name: "Roboto", category: "sans-serif", weights: [300, 400, 500, 700] },
            { name: "Montserrat", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
            { name: "Open Sans", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
            { name: "Lora", category: "serif", weights: [400, 500, 600, 700] },
            { name: "Merriweather", category: "serif", weights: [300, 400, 700] },
            { name: "Raleway", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
            { name: "Source Sans Pro", category: "sans-serif", weights: [300, 400, 600, 700] },
            { name: "Nunito", category: "sans-serif", weights: [300, 400, 600, 700] },
            { name: "Work Sans", category: "sans-serif", weights: [300, 400, 500, 600] },
            { name: "Libre Baskerville", category: "serif", weights: [400, 700] },
            { name: "Karla", category: "sans-serif", weights: [400, 500, 600, 700] },
            { name: "Rubik", category: "sans-serif", weights: [400, 500, 600] }
        ];
        
        // Initialize the app
        function initApp() {
            allPairings = [...fontPairings];
            filteredPairings = [...fontPairings];
            availableFonts = [...googleFonts];
            
            // Set current pairing to first one
            currentPairing = allPairings[0];
            
            // Populate font selects
            populateFontSelects();
            
            // Load initial preview
            updateCurrentPairingPreview();
            
            // Load pairings grid
            renderPairingsGrid();
            
            // Load favorites
            renderFavorites();
            
            // Set up event listeners
            setupEventListeners();
            
            // Update CSS output
            updateCssOutput();
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Font size slider
            fontSizeSlider.addEventListener('input', function() {
                fontSizeValue.textContent = `${this.value}px`;
                updateCurrentPairingPreview();
                updateCssOutput();
            });
            
            // Line height slider
            lineHeightSlider.addEventListener('input', function() {
                lineHeightValue.textContent = this.value;
                updateCurrentPairingPreview();
                updateCssOutput();
            });
            
            // Apply filters button
            applyFiltersBtn.addEventListener('click', applyFilters);
            
            // Random pairing button
            randomPairingBtn.addEventListener('click', generateRandomPairing);
            
            // Save pairing button
            savePairingBtn.addEventListener('click', saveToFavorites);
            
            // Copy CSS buttons
            copyCssBtn.addEventListener('click', () => copyCssToClipboard('current'));
            copyAllCssBtn.addEventListener('click', () => copyCssToClipboard('all'));
            
            // Test buttons
            testHeadingBtn.addEventListener('click', testCustomHeading);
            testBodyBtn.addEventListener('click', testCustomBody);
            
            // Tabs
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show corresponding content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabId}Tab`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
            
            // Color palette
            colorItems.forEach(item => {
                item.addEventListener('click', function() {
                    const color = this.getAttribute('data-color');
                    
                    // Update selected color
                    colorItems.forEach(i => i.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    // Update text color
                    textColor = color;
                    updateCurrentPairingPreview();
                    updateContrastRatio();
                    updateCssOutput();
                });
            });
            
            // Category filter
            categoryFilter.addEventListener('change', applyFilters);
        }
        
        // Populate font select dropdowns
        function populateFontSelects() {
            // Clear existing options
            headingFontSelect.innerHTML = '<option value="any">Any Heading Font</option>';
            bodyFontSelect.innerHTML = '<option value="any">Any Body Font</option>';
            
            // Add font options
            availableFonts.forEach(font => {
                const headingOption = document.createElement('option');
                headingOption.value = font.name;
                headingOption.textContent = font.name;
                headingFontSelect.appendChild(headingOption);
                
                const bodyOption = document.createElement('option');
                bodyOption.value = font.name;
                bodyOption.textContent = font.name;
                bodyFontSelect.appendChild(bodyOption);
            });
        }
        
        // Update current pairing preview
        function updateCurrentPairingPreview() {
            if (!currentPairing) return;
            
            const fontSize = fontSizeSlider.value;
            const lineHeight = lineHeightSlider.value;
            
            currentPairingPreview.innerHTML = `
                <div class="pairing-header">
                    <div class="pairing-name">${currentPairing.name}</div>
                    <div class="pairing-category">${getCategoryLabel(currentPairing.category)}</div>
                </div>
                <div class="font-display">
                    <div class="heading-font" style="font-family: '${currentPairing.heading}'; font-size: ${fontSize * 2}px; line-height: ${lineHeight}; color: ${textColor}">
                        The quick brown fox jumps over the lazy dog
                    </div>
                    <div class="body-font" style="font-family: '${currentPairing.body}'; font-size: ${fontSize}px; line-height: ${lineHeight}; color: ${textColor}">
                        <p>This is how body text will look with this font pairing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </div>
                </div>
                <div class="font-info">
                    <div>
                        <div class="font-name">${currentPairing.heading}</div>
                        <div class="font-weights">Weights: ${currentPairing.headingWeights.join(', ')}</div>
                    </div>
                    <div>
                        <div class="font-name">${currentPairing.body}</div>
                        <div class="font-weights">Weights: ${currentPairing.bodyWeights.join(', ')}</div>
                    </div>
                </div>
            `;
        }
        
        // Render pairings grid
        function renderPairingsGrid() {
            pairingsGrid.innerHTML = '';
            
            filteredPairings.forEach(pairing => {
                const isSelected = currentPairing && pairing.id === currentPairing.id;
                
                const card = document.createElement('div');
                card.className = `pairing-card ${isSelected ? 'selected' : ''}`;
                card.setAttribute('data-id', pairing.id);
                
                card.innerHTML = `
                    <div class="pairing-card-header">
                        <div class="pairing-card-name">${pairing.name}</div>
                        <div class="pairing-card-category">${getCategoryLabel(pairing.category)}</div>
                    </div>
                    <div class="pairing-card-preview">
                        <div class="pairing-card-heading" style="font-family: '${pairing.heading}'">
                            ${pairing.heading}
                        </div>
                        <div class="pairing-card-body" style="font-family: '${pairing.body}'">
                            ${pairing.description}
                        </div>
                    </div>
                    <div class="pairing-card-footer">
                        <div>${pairing.heading} + ${pairing.body}</div>
                        <div><i class="fas fa-star"></i> ${pairing.rating}</div>
                    </div>
                `;
                
                card.addEventListener('click', function() {
                    // Update current pairing
                    const pairingId = parseInt(this.getAttribute('data-id'));
                    currentPairing = allPairings.find(p => p.id === pairingId);
                    
                    // Update UI
                    updateCurrentPairingPreview();
                    updateCssOutput();
                    
                    // Update selected state
                    document.querySelectorAll('.pairing-card').forEach(c => {
                        c.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Switch to preview tab
                    tabs.forEach(t => t.classList.remove('active'));
                    document.querySelector('.tab[data-tab="preview"]').classList.add('active');
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === 'previewTab') {
                            content.classList.add('active');
                        }
                    });
                });
                
                pairingsGrid.appendChild(card);
            });
        }
        
        // Render favorites list
        function renderFavorites() {
            favoritesList.innerHTML = '';
            
            if (favorites.length === 0) {
                emptyFavorites.style.display = 'block';
                return;
            }
            
            emptyFavorites.style.display = 'none';
            
            favorites.forEach((favorite, index) => {
                const favoriteItem = document.createElement('div');
                favoriteItem.className = 'favorite-item';
                
                favoriteItem.innerHTML = `
                    <div class="favorite-fonts">
                        <div class="favorite-heading" style="font-family: '${favorite.heading}'">${favorite.heading}</div>
                        <div class="favorite-body" style="font-family: '${favorite.body}'">${favorite.body}</div>
                    </div>
                    <button class="favorite-remove" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add click event to load this pairing
                favoriteItem.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('favorite-remove') && !e.target.closest('.favorite-remove')) {
                        // Find the full pairing data
                        const pairing = allPairings.find(p => 
                            p.heading === favorite.heading && p.body === favorite.body
                        );
                        
                        if (pairing) {
                            currentPairing = pairing;
                            updateCurrentPairingPreview();
                            updateCssOutput();
                            
                            // Switch to preview tab
                            tabs.forEach(t => t.classList.remove('active'));
                            document.querySelector('.tab[data-tab="preview"]').classList.add('active');
                            tabContents.forEach(content => {
                                content.classList.remove('active');
                                if (content.id === 'previewTab') {
                                    content.classList.add('active');
                                }
                            });
                        }
                    }
                });
                
                // Add remove event
                const removeBtn = favoriteItem.querySelector('.favorite-remove');
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    removeFromFavorites(index);
                });
                
                favoritesList.appendChild(favoriteItem);
            });
        }
        
        // Apply filters
        function applyFilters() {
            const category = categoryFilter.value;
            const headingFont = headingFontSelect.value;
            const bodyFont = bodyFontSelect.value;
            
            // Filter pairings
            filteredPairings = allPairings.filter(pairing => {
                // Category filter
                if (category !== 'all' && pairing.category !== category) {
                    return false;
                }
                
                // Heading font filter
                if (headingFont !== 'any' && pairing.heading !== headingFont) {
                    return false;
                }
                
                // Body font filter
                if (bodyFont !== 'any' && pairing.body !== bodyFont) {
                    return false;
                }
                
                return true;
            });
            
            // Update grid
            renderPairingsGrid();
        }
        
        // Generate random pairing
        function generateRandomPairing() {
            const randomIndex = Math.floor(Math.random() * allPairings.length);
            currentPairing = allPairings[randomIndex];
            
            // Update UI
            updateCurrentPairingPreview();
            updateCssOutput();
            
            // Update selected state in grid
            document.querySelectorAll('.pairing-card').forEach(card => {
                const cardId = parseInt(card.getAttribute('data-id'));
                card.classList.toggle('selected', cardId === currentPairing.id);
            });
        }
        
        // Save current pairing to favorites
        function saveToFavorites() {
            if (!currentPairing) return;
            
            // Check if already in favorites
            const alreadySaved = favorites.some(f => 
                f.heading === currentPairing.heading && f.body === currentPairing.body
            );
            
            if (alreadySaved) {
                alert('This pairing is already in your favorites!');
                return;
            }
            
            // Add to favorites
            favorites.push({
                heading: currentPairing.heading,
                body: currentPairing.body,
                name: currentPairing.name,
                category: currentPairing.category
            });
            
            // Save to localStorage
            localStorage.setItem('fontHarmonyFavorites', JSON.stringify(favorites));
            
            // Update UI
            renderFavorites();
            
            // Show confirmation
            alert('Pairing saved to favorites!');
        }
        
        // Remove from favorites
        function removeFromFavorites(index) {
            favorites.splice(index, 1);
            localStorage.setItem('fontHarmonyFavorites', JSON.stringify(favorites));
            renderFavorites();
        }
        
        // Update CSS output
        function updateCssOutput() {
            if (!currentPairing) return;
            
            const fontSize = fontSizeSlider.value;
            const lineHeight = lineHeightSlider.value;
            
            const css = `/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=${currentPairing.heading.replace(/ /g, '+')}:wght@${currentPairing.headingWeights.join(';')}&display=swap');
@import url('https://fonts.googleapis.com/css2?family=${currentPairing.body.replace(/ /g, '+')}:wght@${currentPairing.bodyWeights.join(';')}&display=swap');

/* Font Variables */
:root {
  --heading-font: '${currentPairing.heading}', ${currentPairing.heading.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};
  --body-font: '${currentPairing.body}', ${currentPairing.body.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};
  --text-color: ${textColor};
  --base-font-size: ${fontSize}px;
  --line-height: ${lineHeight};
}

/* Typography Styles */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

h1 {
  font-size: calc(var(--base-font-size) * 2.5);
}

h2 {
  font-size: calc(var(--base-font-size) * 2);
}

h3 {
  font-size: calc(var(--base-font-size) * 1.75);
}

h4 {
  font-size: calc(var(--base-font-size) * 1.5);
}

h5 {
  font-size: calc(var(--base-font-size) * 1.25);
}

h6 {
  font-size: var(--base-font-size);
}

body {
  font-family: var(--body-font);
  font-size: var(--base-font-size);
  line-height: var(--line-height);
  color: var(--text-color);
  font-weight: 400;
}

p {
  margin-bottom: 1.5em;
}

strong, b {
  font-weight: 700;
}

/* Example class for specific text */
.lead-text {
  font-size: calc(var(--base-font-size) * 1.25);
  font-weight: 300;
  line-height: 1.4;
}

.small-text {
  font-size: calc(var(--base-font-size) * 0.875);
}`;
            
            // Syntax highlighting (basic)
            const highlightedCss = css
                .replace(/\/(\*[\s\S]*?\*)\//g, '<span class="css-comment">$1</span>')
                .replace(/(@import|@media|@keyframes|@font-face)/g, '<span class="css-selector">$1</span>')
                .replace(/(:root|h1|h2|h3|h4|h5|h6|body|p|strong|b|\.lead-text|\.small-text)/g, '<span class="css-selector">$1</span>')
                .replace(/(font-family|font-weight|font-size|color|line-height|margin-bottom)/g, '<span class="css-property">$1</span>')
                .replace(/(url\([^)]+\)|calc\([^)]+\)|#[0-9a-fA-F]{3,6}|[0-9.]+(px|em|rem|%)?)/g, '<span class="css-value">$1</span>');
            
            cssOutput.innerHTML = highlightedCss;
        }
        
        // Copy CSS to clipboard
        async function copyCssToClipboard(type) {
            let cssText = '';
            
            if (type === 'current') {
                // Get plain CSS text (without highlighting)
                const fontSize = fontSizeSlider.value;
                const lineHeight = lineHeightSlider.value;
                
                cssText = `/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=${currentPairing.heading.replace(/ /g, '+')}:wght@${currentPairing.headingWeights.join(';')}&display=swap');
@import url('https://fonts.googleapis.com/css2?family=${currentPairing.body.replace(/ /g, '+')}:wght@${currentPairing.bodyWeights.join(';')}&display=swap');

/* Font Variables */
:root {
  --heading-font: '${currentPairing.heading}', ${currentPairing.heading.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};
  --body-font: '${currentPairing.body}', ${currentPairing.body.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};
  --text-color: ${textColor};
  --base-font-size: ${fontSize}px;
  --line-height: ${lineHeight};
}

/* Typography Styles */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

body {
  font-family: var(--body-font);
  font-size: var(--base-font-size);
  line-height: var(--line-height);
  color: var(--text-color);
}`;
            } else {
                // Copy all pairings as CSS
                cssText = '/* All Font Pairings CSS */\n\n';
                allPairings.forEach(pairing => {
                    cssText += `/* ${pairing.name} */\n`;
                    cssText += `.${pairing.name.toLowerCase().replace(/ /g, '-')}-heading {\n`;
                    cssText += `  font-family: '${pairing.heading}', ${pairing.heading.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};\n`;
                    cssText += `}\n\n`;
                    cssText += `.${pairing.name.toLowerCase().replace(/ /g, '-')}-body {\n`;
                    cssText += `  font-family: '${pairing.body}', ${pairing.body.toLowerCase().includes('sans') ? 'sans-serif' : 'serif'};\n`;
                    cssText += `}\n\n`;
                });
            }
            
            try {
                await navigator.clipboard.writeText(cssText);
                alert('CSS copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
                alert('Failed to copy CSS to clipboard. Please try again.');
            }
        }
        
        // Test custom heading
        function testCustomHeading() {
            const userText = prompt('Enter your heading text to preview:', 'The quick brown fox jumps over the lazy dog');
            if (userText) {
                const headingElement = currentPairingPreview.querySelector('.heading-font');
                headingElement.textContent = userText;
            }
        }
        
        // Test custom body text
        function testCustomBody() {
            const userText = prompt('Enter your body text to preview:', 'This is how body text will look with this font pairing. Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            if (userText) {
                const bodyElement = currentPairingPreview.querySelector('.body-font p');
                if (bodyElement) {
                    bodyElement.textContent = userText;
                }
            }
        }
        
        // Update contrast ratio
        function updateContrastRatio() {
            // Simplified contrast ratio calculation (for demo purposes)
            // In a real app, you would calculate actual contrast ratio
            const hexColor = textColor.replace('#', '');
            const r = parseInt(hexColor.substr(0, 2), 16);
            const g = parseInt(hexColor.substr(2, 2), 16);
            const b = parseInt(hexColor.substr(4, 2), 16);
            
            // Calculate relative luminance
            const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            
            // Calculate contrast ratio with white background
            const contrast = (1 + 0.05) / (luminance + 0.05);
            
            // Update display
            contrastRatio.textContent = `${contrast.toFixed(1)}:1`;
            
            // Update class based on contrast
            contrastRatio.className = 'contrast-value';
            if (contrast >= 7) {
                contrastRatio.classList.add('contrast-good');
                contrastRatio.nextElementSibling.textContent = '(Excellent)';
            } else if (contrast >= 4.5) {
                contrastRatio.classList.add('contrast-warning');
                contrastRatio.nextElementSibling.textContent = '(Good)';
            } else {
                contrastRatio.classList.add('contrast-poor');
                contrastRatio.nextElementSibling.textContent = '(Poor)';
            }
        }
        
        // Helper function to get category label
        function getCategoryLabel(category) {
            const categoryLabels = {
                'serif-serif': 'Serif + Serif',
                'sans-sans': 'Sans-serif + Sans-serif',
                'serif-sans': 'Serif + Sans-serif',
                'display-body': 'Display + Body',
                'modern': 'Modern',
                'classic': 'Classic',
                'playful': 'Playful',
                'elegant': 'Elegant'
            };
            
            return categoryLabels[category] || category;
        }
        
        // Initialize the app when page loads
        document.addEventListener('DOMContentLoaded', initApp);
    