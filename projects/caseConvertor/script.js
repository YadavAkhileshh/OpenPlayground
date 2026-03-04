document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const convertBtn = document.getElementById('convertBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearInputBtn = document.getElementById('clearInput');
    const pasteTextBtn = document.getElementById('pasteText');
    const clearResultsBtn = document.getElementById('clearResults');
    const resetAppBtn = document.getElementById('resetApp');
    const githubLink = document.getElementById('githubLink');
    
    // Option checkboxes
    const preserveOriginal = document.getElementById('preserveOriginal');
    const autoConvert = document.getElementById('autoConvert');
    const trimSpaces = document.getElementById('trimSpaces');
    
    // Counters
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    
    // Results containers
    const resultGrid = document.querySelector('.result-grid');
    const noResults = document.getElementById('noResults');
    const caseButtons = document.querySelectorAll('.case-btn');
    
    // Toast notification
    const toast = document.getElementById('toast');
    
    // Currently selected case
    let selectedCase = 'camelCase';
    
    // Initialize the app
    function initApp() {
        updateCounts();
        setupEventListeners();
        convertText(); // Convert on load with sample text
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Case selection buttons
        caseButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                caseButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                selectedCase = this.dataset.case;
                
                // Convert text if auto-convert is enabled
                if (autoConvert.checked) {
                    convertText();
                }
            });
        });
        
        // Convert button
        convertBtn.addEventListener('click', convertText);
        
        // Copy all results button
        copyAllBtn.addEventListener('click', copyAllResults);
        
        // Clear input button
        clearInputBtn.addEventListener('click', clearInput);
        
        // Paste text button
        pasteTextBtn.addEventListener('click', pasteFromClipboard);
        
        // Clear results button
        clearResultsBtn.addEventListener('click', clearResults);
        
        // Reset app button
        resetAppBtn.addEventListener('click', resetApp);
        
        // GitHub link
        githubLink.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('GitHub repository link would open here', 'info');
        });
        
        // Input text events
        inputText.addEventListener('input', function() {
            updateCounts();
            
            // Auto-convert if enabled
            if (autoConvert.checked) {
                convertText();
            }
        });
        
        // Option change events
        autoConvert.addEventListener('change', function() {
            if (this.checked) {
                convertText();
            }
        });
        
        trimSpaces.addEventListener('change', function() {
            if (autoConvert.checked) {
                convertText();
            }
        });
        
        preserveOriginal.addEventListener('change', function() {
            if (autoConvert.checked) {
                convertText();
            }
        });
    }
    
    // Update character and word counts
    function updateCounts() {
        const text = inputText.value;
        const charCountValue = text.length;
        const wordCountValue = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        charCount.textContent = `${charCountValue} character${charCountValue !== 1 ? 's' : ''}`;
        wordCount.textContent = `${wordCountValue} word${wordCountValue !== 1 ? 's' : ''}`;
    }
    
    // Clear input text
    function clearInput() {
        inputText.value = '';
        updateCounts();
        clearResults();
        showToast('Input cleared', 'info');
    }
    
    // Paste from clipboard
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            inputText.value = text;
            updateCounts();
            
            if (autoConvert.checked) {
                convertText();
            }
            
            showToast('Text pasted from clipboard', 'success');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            showToast('Unable to paste from clipboard', 'error');
        }
    }
    
    // Clear all results
    function clearResults() {
        resultGrid.innerHTML = '';
        resultGrid.style.display = 'none';
        noResults.style.display = 'flex';
        showToast('Results cleared', 'info');
    }
    
    // Reset the entire app
    function resetApp() {
        inputText.value = 'userProfileData, first_name, user-id, User Profile Data, HTTPResponseCode';
        updateCounts();
        clearResults();
        
        // Reset to default case
        caseButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-case="camelCase"]').classList.add('active');
        selectedCase = 'camelCase';
        
        // Reset options
        preserveOriginal.checked = true;
        autoConvert.checked = false;
        trimSpaces.checked = true;
        
        convertText();
        showToast('App reset to default state', 'info');
    }
    
    // Main conversion function
    function convertText() {
        const input = inputText.value.trim();
        
        if (!input) {
            clearResults();
            return;
        }
        
        // Split input by commas, newlines, or just use as single item
        let items = [];
        if (input.includes(',') || input.includes('\n')) {
            items = input.split(/[,|\n]/).map(item => item.trim()).filter(item => item !== '');
        } else {
            items = [input];
        }
        
        // Apply trim spaces option
        if (trimSpaces.checked) {
            items = items.map(item => item.replace(/\s+/g, ' ').trim());
        }
        
        // Clear previous results
        resultGrid.innerHTML = '';
        
        // Process each item
        items.forEach(item => {
            if (preserveOriginal.checked) {
                // Show original and converted
                createResultCard('Original', item);
                createResultCard(selectedCase, convertCase(item, selectedCase));
            } else {
                // Show only converted
                createResultCard(selectedCase, convertCase(item, selectedCase));
            }
        });
        
        // Show results grid
        if (resultGrid.children.length > 0) {
            resultGrid.style.display = 'grid';
            noResults.style.display = 'none';
        } else {
            resultGrid.style.display = 'none';
            noResults.style.display = 'flex';
        }
        
        // Show conversion complete message if not auto-converting
        if (!autoConvert.checked) {
            showToast(`Converted ${items.length} item${items.length !== 1 ? 's' : ''} to ${selectedCase}`, 'success');
        }
    }
    
    // Convert text to a specific case
    function convertCase(text, targetCase) {
        if (!text) return '';
        
        // First, normalize the text by detecting its current format
        const normalized = normalizeText(text);
        
        // Convert to target case
        switch(targetCase) {
            case 'camelCase':
                return toCamelCase(normalized);
            case 'PascalCase':
                return toPascalCase(normalized);
            case 'snake_case':
                return toSnakeCase(normalized);
            case 'kebab-case':
                return toKebabCase(normalized);
            case 'CONSTANT_CASE':
                return toConstantCase(normalized);
            case 'Title Case':
                return toTitleCase(normalized);
            case 'Sentence case':
                return toSentenceCase(normalized);
            case 'lower case':
                return toLowerCase(normalized);
            default:
                return text;
        }
    }
    
    // Normalize text by detecting its format and splitting into words
    function normalizeText(text) {
        // Check for various separators and split into words
        let words = [];
        
        // Check for camelCase or PascalCase
        if (/^[a-z]+([A-Z][a-z]*)+$/.test(text) || /^[A-Z][a-z]*([A-Z][a-z]*)+$/.test(text)) {
            // Split on capital letters
            words = text.split(/(?=[A-Z])/).map(word => word.toLowerCase());
        }
        // Check for snake_case
        else if (text.includes('_')) {
            words = text.split('_').map(word => word.toLowerCase());
        }
        // Check for kebab-case
        else if (text.includes('-')) {
            words = text.split('-').map(word => word.toLowerCase());
        }
        // Check for spaces (sentence, title, or just spaces)
        else if (text.includes(' ')) {
            words = text.split(' ').filter(word => word !== '');
        }
        // Otherwise, treat as a single word
        else {
            words = [text.toLowerCase()];
        }
        
        return words;
    }
    
    // Conversion functions
    function toCamelCase(words) {
        if (!words.length) return '';
        return words.map((word, index) => {
            if (index === 0) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
    }
    
    function toPascalCase(words) {
        if (!words.length) return '';
        return words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('');
    }
    
    function toSnakeCase(words) {
        return words.map(word => word.toLowerCase()).join('_');
    }
    
    function toKebabCase(words) {
        return words.map(word => word.toLowerCase()).join('-');
    }
    
    function toConstantCase(words) {
        return words.map(word => word.toUpperCase()).join('_');
    }
    
    function toTitleCase(words) {
        return words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
    function toSentenceCase(words) {
        if (!words.length) return '';
        return words.map((word, index) => {
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.toLowerCase();
        }).join(' ');
    }
    
    function toLowerCase(words) {
        return words.map(word => word.toLowerCase()).join(' ');
    }
    
    // Create a result card
    function createResultCard(title, content) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        card.innerHTML = `
            <div class="result-header">
                <h4>${title}</h4>
                <button class="copy-btn" title="Copy to clipboard">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="result-content">${content}</div>
        `;
        
        // Add click event to copy content
        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            copyToClipboard(content, title);
        });
        
        // Also copy when clicking the card itself
        card.addEventListener('click', function() {
            copyToClipboard(content, title);
        });
        
        resultGrid.appendChild(card);
    }
    
    // Copy text to clipboard
    async function copyToClipboard(text, description = 'text') {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`"${text}" copied to clipboard`, 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast(`Failed to copy ${description}`, 'error');
        }
    }
    
    // Copy all results to clipboard
    async function copyAllResults() {
        const resultCards = document.querySelectorAll('.result-card .result-content');
        if (resultCards.length === 0) {
            showToast('No results to copy', 'info');
            return;
        }
        
        const allText = Array.from(resultCards)
            .map(card => card.textContent)
            .join('\n');
        
        try {
            await navigator.clipboard.writeText(allText);
            showToast(`All ${resultCards.length} results copied to clipboard`, 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy all results', 'error');
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        // Clear any existing timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Set toast content and style
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        toast.className = `toast ${type}`;
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Add CSS for toast types
    const style = document.createElement('style');
    style.textContent = `
        .toast.success {
            background-color: #10b981;
            border-left: 4px solid #059669;
        }
        
        .toast.error {
            background-color: #ef4444;
            border-left: 4px solid #dc2626;
        }
        
        .toast.info {
            background-color: #3b82f6;
            border-left: 4px solid #2563eb;
        }
        
        .toast i {
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the app
    initApp();
});