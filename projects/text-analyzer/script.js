document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('textInput');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const fontSize = document.getElementById('fontSize');
    const lineHeight = document.getElementById('lineHeight');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const lineHeightValue = document.getElementById('lineHeightValue');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const readingSpeed = document.getElementById('readingSpeed');
    const topWordsCount = document.getElementById('topWordsCount');
    const exportBtn = document.getElementById('exportBtn');
    const exportOptionBtns = document.querySelectorAll('.export-option-btn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const themeToggle = document.getElementById('themeToggle');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const helpModal = document.getElementById('helpModal');
    
    // Stats Elements
    const previewWords = document.getElementById('previewWords');
    const previewChars = document.getElementById('previewChars');
    const liveWords = document.getElementById('liveWords');
    const liveChars = document.getElementById('liveChars');
    const lastUpdated = document.getElementById('lastUpdated');
    
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const charNoSpaces = document.getElementById('charNoSpaces');
    const sentenceCount = document.getElementById('sentenceCount');
    const paragraphCount = document.getElementById('paragraphCount');
    const avgWordLength = document.getElementById('avgWordLength');
    const wordDensity = document.getElementById('wordDensity');
    const readingMinutes = document.getElementById('readingMinutes');
    const shortRead = document.getElementById('shortRead');
    const longRead = document.getElementById('longRead');
    const topWordsList = document.getElementById('topWordsList');
    const longestWord = document.getElementById('longestWord');
    const shortestWord = document.getElementById('shortestWord');
    const uniqueWords = document.getElementById('uniqueWords');
    const repeatedWords = document.getElementById('repeatedWords');
    
    const historyList = document.getElementById('historyList');
    
    // State
    let history = [];
    const MAX_HISTORY = 10;
    let currentTheme = 'light';
    
    // Sample Texts
    const sampleTexts = {
        paragraph: `The art of writing is the art of discovering what you believe. Writing is not just about putting words on paper; it's about organizing thoughts, expressing ideas, and communicating with clarity and purpose. Every word choice matters, every sentence structure contributes to the overall message, and every paragraph should serve a specific function in the larger narrative.`,
        
        email: `Dear Team,

I hope this message finds you well. I wanted to provide a quick update on our ongoing project and discuss the next steps.

The preliminary analysis is now complete, and the results look promising. We've identified several key areas for improvement and have developed a comprehensive action plan to address them.

Please review the attached document and let me know your thoughts by Friday.

Best regards,
[Your Name]`,
        
        tweet: `Just launched our new text analyzer tool! ✨

🔤 Real-time word & character counts
⏱️ Reading time estimates
📊 Advanced text analytics
📈 Word frequency analysis

Try it now and optimize your writing! #writing #productivity #tools`,
        
        essay: `Introduction

In contemporary society, the proliferation of digital communication has fundamentally altered how individuals interact with written text. This essay examines the impact of digital tools on reading comprehension, writing proficiency, and information processing.

Analysis of Current Trends

Recent studies indicate a measurable decline in sustained attention during reading tasks. The average attention span has decreased from 12 seconds in 2000 to 8 seconds in 2023, coinciding with the rise of social media and instant messaging platforms.

Conclusion

While digital tools offer unprecedented access to information, they also present challenges for deep reading and critical analysis. A balanced approach incorporating both digital and traditional reading methods may yield optimal cognitive benefits.`
    };
    
    // Initialize
    init();
    
    // Event Listeners
    textInput.addEventListener('input', analyzeText);
    clearBtn.addEventListener('click', clearText);
    sampleBtn.addEventListener('click', loadSampleText);
    pasteBtn.addEventListener('click', pasteText);
    copyBtn.addEventListener('click', copyText);
    
    fontSize.addEventListener('input', updateFontSize);
    lineHeight.addEventListener('input', updateLineHeight);
    
    readingSpeed.addEventListener('change', analyzeText);
    topWordsCount.addEventListener('change', analyzeText);
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;
            loadPresetText(preset);
        });
    });
    
    exportBtn.addEventListener('click', exportData);
    exportOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            exportData(format);
        });
    });
    
    clearHistoryBtn.addEventListener('click', clearHistory);
    themeToggle.addEventListener('click', toggleTheme);
    helpBtn.addEventListener('click', () => helpModal.style.display = 'flex');
    closeHelpModal.addEventListener('click', () => helpModal.style.display = 'none');
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Functions
    function init() {
        // Load theme preference
        loadTheme();
        
        // Load history
        loadHistory();
        
        // Set initial font size and line height
        updateFontSize();
        updateLineHeight();
        
        // Load default sample text
        loadPresetText('paragraph');
        
        // Update timestamp
        updateTimestamp();
    }
    
    function analyzeText() {
        const text = textInput.value;
        const trimmedText = text.trim();
        
        // Update live preview
        updateLivePreview(text);
        
        // Basic counts
        const words = getWords(text);
        const wordCountValue = words.length;
        const charCountValue = text.length;
        const charNoSpacesValue = text.replace(/\s/g, '').length;
        
        // Update basic stats
        wordCount.textContent = formatNumber(wordCountValue);
        charCount.textContent = formatNumber(charCountValue);
        charNoSpaces.textContent = formatNumber(charNoSpacesValue);
        
        // Sentence count
        const sentences = getSentences(text);
        const sentenceCountValue = sentences.length;
        sentenceCount.textContent = formatNumber(sentenceCountValue);
        
        // Paragraph count
        const paragraphs = getParagraphs(text);
        const paragraphCountValue = paragraphs.length;
        paragraphCount.textContent = formatNumber(paragraphCountValue);
        
        // Average word length
        const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
        const avgWordLengthValue = wordCountValue > 0 ? (totalWordLength / wordCountValue).toFixed(1) : 0;
        avgWordLength.textContent = avgWordLengthValue;
        
        // Word density (words per sentence)
        const wordDensityValue = sentenceCountValue > 0 ? (wordCountValue / sentenceCountValue).toFixed(1) : 0;
        wordDensity.textContent = wordDensityValue;
        
        // Reading time
        updateReadingTime(wordCountValue);
        
        // Word frequency
        updateWordFrequency(words);
        
        // Text structure
        updateTextStructure(words);
        
        // Update timestamp
        updateTimestamp();
        
        // Add to history
        if (text.length > 0) {
            addToHistory(text);
        }
    }
    
    function updateLivePreview(text) {
        const words = getWords(text);
        const wordCountValue = words.length;
        const charCountValue = text.length;
        
        previewWords.textContent = formatNumber(wordCountValue);
        previewChars.textContent = formatNumber(charCountValue);
        liveWords.textContent = formatNumber(wordCountValue);
        liveChars.textContent = formatNumber(charCountValue);
    }
    
    function getWords(text) {
        return text.match(/\b[\w']+\b/g) || [];
    }
    
    function getSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }
    
    function getParagraphs(text) {
        return text.split(/\n+/).filter(p => p.trim().length > 0);
    }
    
    function updateReadingTime(wordCount) {
        const speed = parseInt(readingSpeed.value);
        const minutes = wordCount / speed;
        
        readingMinutes.textContent = minutes < 0.1 ? '<0.1' : minutes.toFixed(1);
        
        // Calculate different reading speeds
        const slowRead = (wordCount / 200).toFixed(1);
        const fastRead = (wordCount / 400).toFixed(1);
        
        shortRead.textContent = `${fastRead} min`;
        longRead.textContent = `${slowRead} min`;
    }
    
    function updateWordFrequency(words) {
        if (words.length === 0) {
            topWordsList.innerHTML = `
                <div class="frequency-empty">
                    <i class="fas fa-search"></i>
                    <p>Type some text to see word frequency</p>
                </div>
            `;
            return;
        }
        
        // Count word frequency
        const wordFrequency = {};
        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
        });
        
        // Sort by frequency
        const sortedWords = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1]);
        
        // Get top N words
        const topN = parseInt(topWordsCount.value);
        const topWords = sortedWords.slice(0, topN);
        
        // Update display
        topWordsList.innerHTML = '';
        topWords.forEach(([word, count]) => {
            const item = document.createElement('div');
            item.className = 'frequency-item';
            item.innerHTML = `
                <span class="frequency-word">${word}</span>
                <span class="frequency-count">${count}</span>
            `;
            topWordsList.appendChild(item);
        });
    }
    
    function updateTextStructure(words) {
        if (words.length === 0) {
            longestWord.textContent = '-';
            shortestWord.textContent = '-';
            uniqueWords.textContent = '0';
            repeatedWords.textContent = '0';
            return;
        }
        
        // Find longest and shortest words
        let longest = words[0];
        let shortest = words[0];
        
        words.forEach(word => {
            if (word.length > longest.length) longest = word;
            if (word.length < shortest.length) shortest = word;
        });
        
        longestWord.textContent = longest.length > 20 ? longest.substring(0, 20) + '...' : longest;
        shortestWord.textContent = shortest;
        
        // Count unique words
        const uniqueSet = new Set(words.map(w => w.toLowerCase()));
        uniqueWords.textContent = formatNumber(uniqueSet.size);
        
        // Count repeated words (words appearing more than once)
        const wordCounts = {};
        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
        });
        
        const repeatedCount = Object.values(wordCounts).filter(count => count > 1).length;
        repeatedWords.textContent = formatNumber(repeatedCount);
    }
    
    function updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdated.textContent = `Updated: ${timeString}`;
    }
    
    function clearText() {
        if (textInput.value.trim() === '' || confirm('Clear all text?')) {
            textInput.value = '';
            analyzeText();
        }
    }
    
    function loadSampleText() {
        textInput.value = sampleTexts.paragraph;
        analyzeText();
    }
    
    function loadPresetText(preset) {
        if (sampleTexts[preset]) {
            textInput.value = sampleTexts[preset];
            analyzeText();
        }
    }
    
    async function pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            analyzeText();
        } catch (err) {
            alert('Unable to paste. Please paste manually.');
        }
    }
    
    function copyText() {
        const text = textInput.value;
        if (text.trim() === '') {
            alert('Nothing to copy!');
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy text');
            });
    }
    
    function updateFontSize() {
        const size = fontSize.value + 'px';
        textInput.style.fontSize = size;
        fontSizeValue.textContent = size;
    }
    
    function updateLineHeight() {
        const height = lineHeight.value;
        textInput.style.lineHeight = height;
        lineHeightValue.textContent = height;
    }
    
    function addToHistory(text) {
        const analysis = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            words: getWords(text).length,
            chars: text.length,
            sentences: getSentences(text).length
        };
        
        history.unshift(analysis);
        
        // Keep only last MAX_HISTORY items
        if (history.length > MAX_HISTORY) {
            history.pop();
        }
        
        updateHistoryDisplay();
        saveHistory();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <div class="empty-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="empty-text">No analysis history yet</div>
                    <div class="empty-sub">Your analyses will appear here</div>
                </div>
            `;
            return;
        }
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-stats">
                    <span class="history-stat">
                        <i class="fas fa-font"></i>
                        ${item.words} words
                    </span>
                    <span class="history-stat">
                        <i class="fas fa-keyboard"></i>
                        ${item.chars} chars
                    </span>
                    <span class="history-stat">
                        <i class="fas fa-hashtag"></i>
                        ${item.sentences} sentences
                    </span>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    function clearHistory() {
        if (confirm('Clear all analysis history?')) {
            history = [];
            updateHistoryDisplay();
            saveHistory();
        }
    }
    
    function exportData(format = 'text') {
        const text = textInput.value;
        if (text.trim() === '') {
            alert('No text to export!');
            return;
        }
        
        const analysis = getCurrentAnalysis();
        let content = '';
        let filename = '';
        let type = '';
        
        switch(format) {
            case 'text':
                content = generateTextReport(analysis);
                filename = 'text-analysis.txt';
                type = 'text/plain';
                break;
                
            case 'json':
                content = JSON.stringify(analysis, null, 2);
                filename = 'text-analysis.json';
                type = 'application/json';
                break;
                
            case 'csv':
                content = generateCSVReport(analysis);
                filename = 'text-analysis.csv';
                type = 'text/csv';
                break;
                
            case 'markdown':
                content = generateMarkdownReport(analysis);
                filename = 'text-analysis.md';
                type = 'text/markdown';
                break;
        }
        
        downloadFile(content, filename, type);
    }
    
    function getCurrentAnalysis() {
        const text = textInput.value;
        const words = getWords(text);
        
        return {
            text: text,
            timestamp: new Date().toISOString(),
            wordCount: words.length,
            characterCount: text.length,
            characterCountNoSpaces: text.replace(/\s/g, '').length,
            sentenceCount: getSentences(text).length,
            paragraphCount: getParagraphs(text).length,
            averageWordLength: words.length > 0 ? 
                (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(2) : 0,
            readingTime: {
                average: words.length / 250,
                slow: words.length / 200,
                fast: words.length / 400
            }
        };
    }
    
    function generateTextReport(analysis) {
        return `TEXT ANALYSIS REPORT
====================

Generated: ${new Date().toLocaleString()}

📊 BASIC STATISTICS
-------------------
Words: ${analysis.wordCount}
Characters: ${analysis.characterCount}
Characters (no spaces): ${analysis.characterCountNoSpaces}
Sentences: ${analysis.sentenceCount}
Paragraphs: ${analysis.paragraphCount}
Average Word Length: ${analysis.averageWordLength}

⏱️ READING TIME
---------------
Average (250 WPM): ${analysis.readingTime.average.toFixed(1)} minutes
Slow (200 WPM): ${analysis.readingTime.slow.toFixed(1)} minutes
Fast (400 WPM): ${analysis.readingTime.fast.toFixed(1)} minutes

📝 ORIGINAL TEXT
---------------
${analysis.text}`;
    }
    
    function generateCSVReport(analysis) {
        return `Metric,Value
Word Count,${analysis.wordCount}
Character Count,${analysis.characterCount}
Characters (No Spaces),${analysis.characterCountNoSpaces}
Sentence Count,${analysis.sentenceCount}
Paragraph Count,${analysis.paragraphCount}
Average Word Length,${analysis.averageWordLength}
Reading Time (Average),${analysis.readingTime.average.toFixed(2)}
Reading Time (Slow),${analysis.readingTime.slow.toFixed(2)}
Reading Time (Fast),${analysis.readingTime.fast.toFixed(2)}`;
    }
    
    function generateMarkdownReport(analysis) {
        return `# Text Analysis Report

**Generated:** ${new Date().toLocaleString()}

## 📊 Basic Statistics

| Metric | Value |
|--------|-------|
| Words | ${analysis.wordCount} |
| Characters | ${analysis.characterCount} |
| Characters (no spaces) | ${analysis.characterCountNoSpaces} |
| Sentences | ${analysis.sentenceCount} |
| Paragraphs | ${analysis.paragraphCount} |
| Average Word Length | ${analysis.averageWordLength} |

## ⏱️ Reading Time

- **Average (250 WPM):** ${analysis.readingTime.average.toFixed(1)} minutes
- **Slow (200 WPM):** ${analysis.readingTime.slow.toFixed(1)} minutes
- **Fast (400 WPM):** ${analysis.readingTime.fast.toFixed(1)} minutes

## 📝 Original Text

\`\`\`
${analysis.text}
\`\`\``;
    }
    
    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'light' 
            ? '<i class="fas fa-moon"></i> Dark Mode' 
            : '<i class="fas fa-sun"></i> Light Mode';
        saveTheme();
    }
    
    function saveTheme() {
        localStorage.setItem('textAnalyzerTheme', currentTheme);
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('textAnalyzerTheme') || 'light';
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'light' 
            ? '<i class="fas fa-moon"></i> Dark Mode' 
            : '<i class="fas fa-sun"></i> Light Mode';
    }
    
    function saveHistory() {
        localStorage.setItem('textAnalyzerHistory', JSON.stringify(history));
    }
    
    function loadHistory() {
        const saved = localStorage.getItem('textAnalyzerHistory');
        if (saved) {
            try {
                history = JSON.parse(saved);
                updateHistoryDisplay();
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
    }
    
    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }
});