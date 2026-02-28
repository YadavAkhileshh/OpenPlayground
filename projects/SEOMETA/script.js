
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const pageTitle = document.getElementById('pageTitle');
            const pageDescription = document.getElementById('pageDescription');
            const pageUrl = document.getElementById('pageUrl');
            const pageKeywords = document.getElementById('pageKeywords');
            const siteName = document.getElementById('siteName');
            const authorName = document.getElementById('authorName');
            const pageImage = document.getElementById('pageImage');
            const robotsMeta = document.getElementById('robotsMeta');
            const ogTags = document.getElementById('ogTags');
            const twitterTags = document.getElementById('twitterTags');
            const canonicalTag = document.getElementById('canonicalTag');
            const viewportTag = document.getElementById('viewportTag');
            const charsetTag = document.getElementById('charsetTag');
            const themeColor = document.getElementById('themeColor');
            const themeColorValue = document.getElementById('themeColorValue');
            const themeColorText = document.getElementById('themeColorText');
            const customTags = document.getElementById('customTags');
            const generateBtn = document.getElementById('generateBtn');
            const resetBtn = document.getElementById('resetBtn');
            const copyBtn = document.getElementById('copyBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const toggleAdvanced = document.getElementById('toggleAdvanced');
            const advancedContent = document.getElementById('advancedContent');
            const advancedIcon = document.getElementById('advancedIcon');
            
            // Preview elements
            const previewGoogleTitle = document.getElementById('previewGoogleTitle');
            const previewGoogleUrl = document.getElementById('previewGoogleUrl');
            const previewGoogleDesc = document.getElementById('previewGoogleDesc');
            const previewFbImage = document.getElementById('previewFbImage');
            const previewFbDomain = document.getElementById('previewFbDomain');
            const previewFbTitle = document.getElementById('previewFbTitle');
            const previewFbDesc = document.getElementById('previewFbDesc');
            const previewTwImage = document.getElementById('previewTwImage');
            const previewTwDomain = document.getElementById('previewTwDomain');
            const previewTwTitle = document.getElementById('previewTwTitle');
            const previewTwDesc = document.getElementById('previewTwDesc');
            
            // SEO Score elements
            const titleScore = document.getElementById('titleScore');
            const descScore = document.getElementById('descScore');
            const overallScore = document.getElementById('overallScore');
            
            // Social tabs
            const socialTabs = document.querySelectorAll('.social-tab');
            const socialTabContents = document.querySelectorAll('.social-tab-content');
            
            // Notification
            const notification = document.getElementById('notification');
            
            // Character counters
            const titleCount = document.getElementById('titleCount');
            const descCount = document.getElementById('descCount');
            
            // Initialize with example data
            const exampleData = {
                pageTitle: 'Best SEO Tools for 2026 - Complete Guide',
                pageDescription: 'Discover the best SEO tools for 2026. Our complete guide helps you improve website ranking, analyze competitors, and optimize content for search engines.',
                pageUrl: 'https://example.com/best-seo-tools-2026',
                pageKeywords: 'SEO tools, search engine optimization, 2026, guide, website ranking',
                siteName: 'SEO Mastery',
                authorName: 'John Doe',
                pageImage: 'https://example.com/images/seo-tools-2026.jpg'
            };
            
            // Set example data
            Object.keys(exampleData).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = exampleData[key];
            });
            
            // Update character counters
            function updateCharCounters() {
                const titleLength = pageTitle.value.length;
                const descLength = pageDescription.value.length;
                
                titleCount.textContent = `${titleLength}/60`;
                descCount.textContent = `${descLength}/160`;
                
                // Update colors based on length
                if (titleLength === 0) {
                    titleCount.className = 'char-count';
                } else if (titleLength < 50 || titleLength > 60) {
                    titleCount.className = 'char-count warning';
                } else {
                    titleCount.className = 'char-count success';
                }
                
                if (descLength === 0) {
                    descCount.className = 'char-count';
                } else if (descLength < 140 || descLength > 160) {
                    descCount.className = 'char-count warning';
                } else {
                    descCount.className = 'char-count success';
                }
                
                // Update SEO scores
                updateSeoScores(titleLength, descLength);
            }
            
            // Update SEO scores
            function updateSeoScores(titleLength, descLength) {
                // Title score (0-100)
                let titleScoreValue = 100;
                if (titleLength === 0) titleScoreValue = 0;
                else if (titleLength < 30) titleScoreValue = 40;
                else if (titleLength < 50) titleScoreValue = 70;
                else if (titleLength <= 60) titleScoreValue = 95;
                else if (titleLength <= 70) titleScoreValue = 80;
                else titleScoreValue = 50;
                
                // Description score (0-100)
                let descScoreValue = 100;
                if (descLength === 0) descScoreValue = 0;
                else if (descLength < 100) descScoreValue = 50;
                else if (descLength < 140) descScoreValue = 70;
                else if (descLength <= 160) descScoreValue = 95;
                else if (descLength <= 200) descScoreValue = 80;
                else descScoreValue = 60;
                
                // Overall score
                const overallScoreValue = Math.round((titleScoreValue + descScoreValue) / 2);
                
                // Update display
                titleScore.textContent = `${titleScoreValue}%`;
                descScore.textContent = `${descScoreValue}%`;
                overallScore.textContent = `${overallScoreValue}%`;
                
                // Update score colors
                titleScore.className = `score-circle ${getScoreClass(titleScoreValue)}`;
                descScore.className = `score-circle ${getScoreClass(descScoreValue)}`;
                overallScore.className = `score-circle ${getScoreClass(overallScoreValue)}`;
            }
            
            function getScoreClass(score) {
                if (score >= 80) return 'score-good';
                if (score >= 60) return 'score-warning';
                return 'score-poor';
            }
            
            // Update previews
            function updatePreviews() {
                // Get domain from URL
                let domain = 'example.com';
                if (pageUrl.value) {
                    try {
                        const url = new URL(pageUrl.value);
                        domain = url.hostname.replace('www.', '');
                    } catch(e) {
                        // Invalid URL, use as-is
                        domain = pageUrl.value.replace(/https?:\/\//, '').replace('www.', '').split('/')[0];
                    }
                }
                
                // Update Google preview
                previewGoogleTitle.textContent = pageTitle.value || 'Your Page Title';
                previewGoogleUrl.textContent = (pageUrl.value || 'https://example.com').replace('https://', '').replace('http://', '');
                previewGoogleDesc.textContent = pageDescription.value || 'Your meta description will appear here in Google search results.';
                
                // Update Facebook preview
                previewFbDomain.textContent = domain;
                previewFbTitle.textContent = pageTitle.value || 'Your Page Title';
                previewFbDesc.textContent = pageDescription.value || 'Your meta description will appear here when shared on Facebook.';
                
                // Update Twitter preview
                previewTwDomain.textContent = domain;
                previewTwTitle.textContent = pageTitle.value || 'Your Page Title';
                previewTwDesc.textContent = pageDescription.value || 'Your meta description will appear here when shared on Twitter.';
            }
            
            // Generate meta tags
            function generateMetaTags() {
                // Validate required fields
                if (!pageTitle.value.trim() || !pageDescription.value.trim()) {
                    showNotification('Please fill in at least the title and description', 'error');
                    return;
                }
                
                // Update previews first
                updatePreviews();
                
                // Get values
                const title = pageTitle.value.trim();
                const description = pageDescription.value.trim();
                const url = pageUrl.value.trim() || 'https://example.com';
                const keywords = pageKeywords.value.trim();
                const site = siteName.value.trim() || 'My Website';
                const author = authorName.value.trim();
                const image = pageImage.value.trim() || 'https://example.com/image.jpg';
                const robots = robotsMeta.value;
                const themeColorVal = themeColorText.value;
                
                // Build meta tags
                let metaTags = `<!-- Generated by SEO Meta Tag Generator -->
<!-- https://example.com/seo-tool -->
`;
                
                // Charset
                if (charsetTag.checked) {
                    metaTags += `<meta charset="UTF-8">
`;
                }
                
                // Viewport
                if (viewportTag.checked) {
                    metaTags += `<meta name="viewport" content="width=device-width, initial-scale=1.0">
`;
                }
                
                // Title
                metaTags += `<title>${escapeHtml(title)}</title>
`;
                
                // Description
                metaTags += `<meta name="description" content="${escapeHtml(description)}">
`;
                
                // Keywords
                if (keywords) {
                    metaTags += `<meta name="keywords" content="${escapeHtml(keywords)}">
`;
                }
                
                // Author
                if (author) {
                    metaTags += `<meta name="author" content="${escapeHtml(author)}">
`;
                }
                
                // Robots
                metaTags += `<meta name="robots" content="${robots}">
`;
                
                // Theme color
                if (themeColor.checked && themeColorVal) {
                    metaTags += `<meta name="theme-color" content="${themeColorVal}">
`;
                }
                
                // Canonical URL
                if (canonicalTag.checked && url) {
                    metaTags += `<link rel="canonical" href="${escapeHtml(url)}">
`;
                }
                
                // Open Graph Tags
                if (ogTags.checked) {
                    metaTags += `
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:site_name" content="${escapeHtml(site)}">
`;
                }
                
                // Twitter Card Tags
                if (twitterTags.checked) {
                    metaTags += `<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${escapeHtml(url)}">
<meta property="twitter:title" content="${escapeHtml(title)}">
<meta property="twitter:description" content="${escapeHtml(description)}">
<meta property="twitter:image" content="${escapeHtml(image)}">
`;
                }
                
                // Custom tags
                if (customTags.value.trim()) {
                    metaTags += `
<!-- Custom Meta Tags -->
${customTags.value.trim()}
`;
                }
                
                // Update code output
                displayCodeOutput(metaTags);
                
                // Show notification
                showNotification('Meta tags generated successfully!');
            }
            
            // Display code output with syntax highlighting
            function displayCodeOutput(code) {
                const codeOutput = document.getElementById('codeOutput');
                const lines = code.split('\n');
                
                let html = '';
                let lineNumber = 1;
                
                lines.forEach(line => {
                    let highlightedLine = highlightCode(line);
                    html += `<div class="code-line"><span class="line-number">${lineNumber}</span>${highlightedLine}</div>`;
                    lineNumber++;
                });
                
                codeOutput.innerHTML = html;
            }
            
            // Simple syntax highlighting for HTML
            function highlightCode(line) {
                // Remove existing HTML entities
                line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                // Highlight tags
                line = line.replace(/(&lt;\/?[a-zA-Z][^&]*&gt;)/g, '<span class="code-tag">$1</span>');
                
                // Highlight attributes
                line = line.replace(/([a-zA-Z\-]+)=/g, '<span class="code-attr">$1</span>=');
                
                // Highlight attribute values
                line = line.replace(/="([^"]*)"/g, '=<span class="code-value">"$1"</span>');
                
                // Highlight comments
                line = line.replace(/&lt;!--(.*?)--&gt;/g, '<span class="code-tag">&lt;!--</span>$1<span class="code-tag">--&gt;</span>');
                
                return line;
            }
            
            // Escape HTML special characters
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML.replace(/"/g, '&quot;');
            }
            
            // Copy code to clipboard
            function copyToClipboard() {
                const codeOutput = document.getElementById('codeOutput');
                const textToCopy = codeOutput.innerText;
                
                navigator.clipboard.writeText(textToCopy)
                    .then(() => showNotification('Code copied to clipboard!'))
                    .catch(err => showNotification('Failed to copy code', 'error'));
            }
            
            // Download as HTML file
            function downloadAsHtml() {
                const codeOutput = document.getElementById('codeOutput');
                const textToDownload = codeOutput.innerText;
                const title = pageTitle.value.trim() || 'meta-tags';
                const filename = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-meta-tags.html';
                
                const blob = new Blob([textToDownload], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification(`Downloaded as ${filename}`);
            }
            
            // Reset form
            function resetForm() {
                pageTitle.value = exampleData.pageTitle;
                pageDescription.value = exampleData.pageDescription;
                pageUrl.value = exampleData.pageUrl;
                pageKeywords.value = exampleData.pageKeywords;
                siteName.value = exampleData.siteName;
                authorName.value = exampleData.authorName;
                pageImage.value = exampleData.pageImage;
                robotsMeta.value = 'index, follow';
                ogTags.checked = true;
                twitterTags.checked = true;
                canonicalTag.checked = false;
                viewportTag.checked = true;
                charsetTag.checked = true;
                themeColor.checked = false;
                themeColorValue.value = '#2c3e50';
                themeColorText.value = '#2c3e50';
                customTags.value = '';
                
                updateCharCounters();
                updatePreviews();
                generateMetaTags();
                
                showNotification('Form reset to default values');
            }
            
            // Show notification
            function showNotification(message, type = 'success') {
                notification.textContent = message;
                notification.className = 'notification';
                
                if (type === 'error') {
                    notification.classList.add('error');
                } else {
                    notification.classList.remove('error');
                }
                
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Event Listeners
            pageTitle.addEventListener('input', updateCharCounters);
            pageDescription.addEventListener('input', updateCharCounters);
            
            pageTitle.addEventListener('input', updatePreviews);
            pageDescription.addEventListener('input', updatePreviews);
            pageUrl.addEventListener('input', updatePreviews);
            
            generateBtn.addEventListener('click', generateMetaTags);
            resetBtn.addEventListener('click', resetForm);
            copyBtn.addEventListener('click', copyToClipboard);
            downloadBtn.addEventListener('click', downloadAsHtml);
            
            // Toggle advanced options
            toggleAdvanced.addEventListener('click', function() {
                advancedContent.classList.toggle('expanded');
                advancedIcon.classList.toggle('fa-chevron-down');
                advancedIcon.classList.toggle('fa-chevron-up');
            });
            
            // Social tab switching
            socialTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Update active tab
                    socialTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show corresponding content
                    socialTabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabId}Preview`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
            
            // Theme color sync
            themeColorValue.addEventListener('input', function() {
                themeColorText.value = this.value;
            });
            
            themeColorText.addEventListener('input', function() {
                themeColorValue.value = this.value;
            });
            
            // Initialize
            updateCharCounters();
            updatePreviews();
            generateMetaTags();
        });
