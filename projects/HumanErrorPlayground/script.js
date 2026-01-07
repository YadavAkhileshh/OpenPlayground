// Human Error Playground
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resetSessionBtn = document.getElementById('resetSession');
    const ethicsBtn = document.getElementById('ethicsBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    const currentYearEl = document.getElementById('currentYear');
    
    // Stats Elements
    const clickErrorsEl = document.getElementById('clickErrors');
    const formErrorsEl = document.getElementById('formErrors');
    const navErrorsEl = document.getElementById('navErrors');
    const decisionErrorsEl = document.getElementById('decisionErrors');
    const sessionTimeEl = document.getElementById('sessionTime');
    const patternAnalysisEl = document.getElementById('patternAnalysis');
    
    // Feedback Elements
    const buttonFeedbackEl = document.getElementById('buttonFeedback');
    const formFeedbackEl = document.getElementById('formFeedback');
    const navFeedbackEl = document.getElementById('navFeedback');
    const decisionFeedbackEl = document.getElementById('decisionFeedback');
    
    // Insight Elements
    const insightListEl = document.getElementById('insightList');
    
    // Form Elements
    const confusingForm = document.getElementById('confusingForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Decision Elements
    const selectAllBtn = document.getElementById('selectAll');
    const selectNoneBtn = document.getElementById('selectNone');
    const savePreferencesBtn = document.getElementById('savePreferences');
    const allCheckboxes = document.querySelectorAll('.decision-options input[type="checkbox"]');
    
    // Navigation Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const navSelectionEl = document.getElementById('navSelection');
    
    // App State
    let sessionData = {
        startTime: new Date(),
        errors: {
            buttons: 0,
            form: 0,
            navigation: 0,
            decisions: 0
        },
        patterns: {
            rushedClicks: 0,
            ignoredHints: 0,
            ambiguousChoices: 0,
            cognitiveLoad: 0
        },
        insights: []
    };
    
    // Button analysis data
    const buttonAnalysis = {
        save: { label: 'Save Changes', commonMistake: 'Confused with Cancel', frequency: 0.15 },
        discard: { label: 'Delete', commonMistake: 'Accidental clicks', frequency: 0.25 },
        cancel: { label: 'Cancel', commonMistake: 'Confused with Save', frequency: 0.20 },
        submit: { label: 'Submit Form', commonMistake: 'Rushed submission', frequency: 0.30 },
        reset: { label: 'Reset Form', commonMistake: 'Accidental data loss', frequency: 0.10 }
    };
    
    // Common error patterns
    const errorPatterns = [
        {
            type: 'button',
            title: 'Similar Button Styles',
            description: 'When primary and secondary actions look too similar, users often click the wrong button.',
            solution: 'Use distinct colors and sizes for different action types.'
        },
        {
            type: 'form',
            title: 'Real-time vs. Submit Validation',
            description: 'Users often miss validation errors that only appear on submission.',
            solution: 'Provide immediate, clear feedback for each field.'
        },
        {
            type: 'navigation',
            title: 'Unclear Hierarchy',
            description: 'When navigation lacks visual hierarchy, users struggle to find important items.',
            solution: 'Use size, spacing, and icons to indicate importance.'
        },
        {
            type: 'decision',
            title: 'Choice Overload',
            description: 'Too many options presented at once leads to decision paralysis.',
            solution: 'Use progressive disclosure and smart defaults.'
        }
    ];
    
    // Initialize App
    function init() {
        setCurrentYear();
        setupEventListeners();
        updateSessionTime();
        initializeInsights();
        startSessionTimer();
    }
    
    // Set current year in footer
    function setCurrentYear() {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Button challenge
        const ambiguousButtons = document.querySelectorAll('.ambiguous-btn');
        ambiguousButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.dataset.action;
                analyzeButtonClick(action, this);
            });
        });
        
        // Form challenge
        confusingForm.addEventListener('submit', handleFormSubmit);
        emailInput.addEventListener('blur', validateEmail);
        passwordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
        
        // Navigation challenge
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                analyzeNavigationClick(this);
            });
        });
        
        // Decision challenge
        selectAllBtn.addEventListener('click', selectAllOptions);
        selectNoneBtn.addEventListener('click', selectNoneOptions);
        savePreferencesBtn.addEventListener('click', analyzeDecisionPattern);
        
        // Reset session
        resetSessionBtn.addEventListener('click', resetSession);
        
        // Footer buttons
        ethicsBtn.addEventListener('click', showEthicsStatement);
        learnMoreBtn.addEventListener('click', showLearnMore);
        
        // Checkbox changes for decision fatigue
        allCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', trackDecisionPattern);
        });
    }
    
    // Update session time display
    function updateSessionTime() {
        const now = new Date();
        const diff = Math.floor((now - sessionData.startTime) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        
        if (minutes === 0) {
            sessionTimeEl.textContent = `Session started ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        } else {
            sessionTimeEl.textContent = `Session started ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
    }
    
    // Start session timer
    function startSessionTimer() {
        setInterval(updateSessionTime, 10000); // Update every 10 seconds
    }
    
    // Initialize insights
    function initializeInsights() {
        insightListEl.innerHTML = '';
        
        errorPatterns.forEach(pattern => {
            const insightItem = document.createElement('div');
            insightItem.className = 'insight-item';
            insightItem.innerHTML = `
                <div class="insight-icon">
                    <i class="fas fa-${getPatternIcon(pattern.type)}"></i>
                </div>
                <div class="insight-content">
                    <h4>${pattern.title}</h4>
                    <p>${pattern.description} ${pattern.solution}</p>
                </div>
            `;
            insightListEl.appendChild(insightItem);
        });
    }
    
    // Get pattern icon
    function getPatternIcon(type) {
        const icons = {
            button: 'mouse-pointer',
            form: 'edit',
            navigation: 'compass',
            decision: 'brain'
        };
        return icons[type] || 'exclamation-triangle';
    }
    
    // Analyze button click
    function analyzeButtonClick(action, button) {
        sessionData.errors.buttons++;
        clickErrorsEl.textContent = sessionData.errors.buttons;
        
        const analysis = buttonAnalysis[action] || { label: action, commonMistake: 'Unknown pattern', frequency: 0.1 };
        
        // Add visual feedback
        button.classList.add('success-highlight');
        setTimeout(() => button.classList.remove('success-highlight'), 1000);
        
        // Update feedback
        buttonFeedbackEl.innerHTML = `
            <p><strong>You clicked: "${analysis.label}"</strong></p>
            <p><em>Common mistake:</em> ${analysis.commonMistake}</p>
            <p><em>Frequency:</em> ${Math.round(analysis.frequency * 100)}% of users make similar errors</p>
            <p class="tip">Design tip: Use color coding and spacing to differentiate action types</p>
        `;
        buttonFeedbackEl.classList.add('feedback-update');
        
        // Track pattern
        if (analysis.frequency > 0.2) {
            sessionData.patterns.rushedClicks++;
        }
        
        // Add insight if not already present
        const insightExists = sessionData.insights.some(i => i.type === 'button');
        if (!insightExists) {
            sessionData.insights.push({
                type: 'button',
                title: 'Button Ambiguity',
                description: 'You experienced button confusion - a common issue when visual hierarchy is unclear.'
            });
            updatePatternAnalysis();
        }
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        let errors = [];
        sessionData.errors.form++;
        formErrorsEl.textContent = sessionData.errors.form;
        
        // Check email (optional but often misread)
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            errors.push('Email format is invalid');
            emailInput.classList.add('error-highlight');
            sessionData.patterns.ignoredHints++;
        } else {
            emailInput.classList.remove('error-highlight');
        }
        
        // Check password
        if (!passwordInput.value) {
            errors.push('Password is required');
            passwordInput.classList.add('error-highlight');
        } else if (passwordInput.value.length < 8) {
            errors.push('Password must be at least 8 characters');
            passwordInput.classList.add('error-highlight');
            sessionData.patterns.ignoredHints++;
        } else {
            passwordInput.classList.remove('error-highlight');
        }
        
        // Check password match
        if (passwordInput.value !== confirmPasswordInput.value) {
            errors.push('Passwords do not match');
            confirmPasswordInput.classList.add('error-highlight');
            sessionData.patterns.rushedClicks++;
        } else {
            confirmPasswordInput.classList.remove('error-highlight');
        }
        
        // Check terms
        if (!termsCheckbox.checked) {
            errors.push('You must agree to the terms');
            termsCheckbox.parentElement.classList.add('error-highlight');
            sessionData.patterns.ignoredHints++;
        } else {
            termsCheckbox.parentElement.classList.remove('error-highlight');
        }
        
        // Show feedback
        if (errors.length > 0) {
            formFeedbackEl.innerHTML = `
                <p><strong>Form validation found ${errors.length} issue${errors.length !== 1 ? 's' : ''}:</strong></p>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
                <p class="tip">Design tip: Show validation errors in real-time, not just on submission</p>
            `;
            sessionData.patterns.ambiguousChoices += errors.length;
        } else {
            formFeedbackEl.innerHTML = `
                <p><strong>Form submitted successfully!</strong></p>
                <p><em>Note:</em> The "optional" email label caused ${sessionData.patterns.ignoredHints > 0 ? 'some' : 'no'} confusion</p>
                <p class="tip">Design tip: Clearly distinguish between required and optional fields</p>
            `;
            submitBtn.classList.add('success-highlight');
            setTimeout(() => submitBtn.classList.remove('success-highlight'), 2000);
        }
        
        formFeedbackEl.classList.add('feedback-update');
        
        // Add insight if not already present
        const insightExists = sessionData.insights.some(i => i.type === 'form');
        if (!insightExists) {
            sessionData.insights.push({
                type: 'form',
                title: 'Form Validation Patterns',
                description: 'You encountered common form validation issues that affect many users.'
            });
            updatePatternAnalysis();
        }
    }
    
    // Validate email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validate email on blur
    function validateEmail() {
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            emailInput.classList.add('error-highlight');
            formFeedbackEl.innerHTML = `<p>Email format looks incorrect. This field is optional but often causes confusion.</p>`;
        } else {
            emailInput.classList.remove('error-highlight');
        }
    }
    
    // Validate password
    function validatePassword() {
        if (passwordInput.value.length > 0 && passwordInput.value.length < 8) {
            passwordInput.classList.add('error-highlight');
        } else {
            passwordInput.classList.remove('error-highlight');
        }
    }
    
    // Validate password match
    function validatePasswordMatch() {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.classList.add('error-highlight');
        } else {
            confirmPasswordInput.classList.remove('error-highlight');
        }
    }
    
    // Analyze navigation click
    function analyzeNavigationClick(link) {
        sessionData.errors.navigation++;
        navErrorsEl.textContent = sessionData.errors.navigation;
        
        const linkText = link.textContent.trim();
        const isActive = link.classList.contains('active');
        const isSubtle = link.classList.contains('subtle');
        const isDanger = link.classList.contains('danger');
        
        // Update selection display
        navSelectionEl.innerHTML = `
            <div class="selection-result">
                <strong>You selected:</strong> ${linkText}<br>
                <em>Visual cues:</em> ${isActive ? 'Active state' : 'Normal'} ${isSubtle ? '| Subtle styling' : ''} ${isDanger ? '| Danger color' : ''}
            </div>
        `;
        
        // Add visual feedback
        link.classList.add('success-highlight');
        setTimeout(() => link.classList.remove('success-highlight'), 1000);
        
        // Update feedback
        let analysis = '';
        if (isSubtle) {
            analysis = 'Subtle navigation items are often overlooked by users.';
            sessionData.patterns.ignoredHints++;
        } else if (isDanger) {
            analysis = 'Danger actions in navigation can cause anxiety and accidental clicks.';
            sessionData.patterns.rushedClicks++;
        } else if (isActive) {
            analysis = 'Clear active states help users understand their location.';
        } else {
            analysis = 'Standard navigation items are usually easiest to understand.';
        }
        
        navFeedbackEl.innerHTML = `
            <p><strong>Navigation selection analyzed</strong></p>
            <p>${analysis}</p>
            <p class="tip">Design tip: Group related items and use consistent visual hierarchy</p>
        `;
        navFeedbackEl.classList.add('feedback-update');
        
        // Add insight if not already present
        const insightExists = sessionData.insights.some(i => i.type === 'navigation');
        if (!insightExists) {
            sessionData.insights.push({
                type: 'navigation',
                title: 'Navigation Clarity',
                description: 'You experienced navigation ambiguity - a common issue in complex interfaces.'
            });
            updatePatternAnalysis();
        }
    }
    
    // Select all options
    function selectAllOptions() {
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        decisionFeedbackEl.innerHTML = `
            <p><strong>All options selected</strong></p>
            <p>Selecting all options is common when users feel overwhelmed by choices.</p>
            <p class="tip">Design tip: Provide "smart defaults" instead of requiring manual selection</p>
        `;
        sessionData.patterns.cognitiveLoad++;
    }
    
    // Select none options
    function selectNoneOptions() {
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        decisionFeedbackEl.innerHTML = `
            <p><strong>All options deselected</strong></p>
            <p>Deselecting all options often happens when users want to avoid commitment.</p>
            <p class="tip">Design tip: Make the safest or most common option the default</p>
        `;
        sessionData.patterns.cognitiveLoad++;
    }
    
    // Track decision pattern
    function trackDecisionPattern() {
        const selectedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length;
        const totalCount = allCheckboxes.length;
        
        // Update feedback based on selection pattern
        if (selectedCount === totalCount) {
            decisionFeedbackEl.innerHTML = `<p>All ${totalCount} options selected. This pattern suggests decision fatigue.</p>`;
        } else if (selectedCount === 0) {
            decisionFeedbackEl.innerHTML = `<p>No options selected. Users often avoid decisions when overwhelmed.</p>`;
        } else if (selectedCount === 1) {
            decisionFeedbackEl.innerHTML = `<p>Only 1 option selected. Minimalist approach to complex decisions.</p>`;
        }
        
        sessionData.patterns.ambiguousChoices++;
    }
    
    // Analyze decision pattern
    function analyzeDecisionPattern() {
        sessionData.errors.decisions++;
        decisionErrorsEl.textContent = sessionData.errors.decisions;
        
        const selectedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length;
        const totalCount = allCheckboxes.length;
        const percentage = Math.round((selectedCount / totalCount) * 100);
        
        let pattern = '';
        if (percentage === 100) pattern = 'Select All pattern';
        else if (percentage === 0) pattern = 'Select None pattern';
        else if (percentage < 33) pattern = 'Minimal selection pattern';
        else if (percentage < 66) pattern = 'Moderate selection pattern';
        else pattern = 'Comprehensive selection pattern';
        
        decisionFeedbackEl.innerHTML = `
            <p><strong>Decision pattern detected: ${pattern}</strong></p>
            <p>You selected ${selectedCount} of ${totalCount} options (${percentage}%).</p>
            <p><em>Cognitive load:</em> ${sessionData.patterns.cognitiveLoad} decision fatigue moments detected</p>
            <p class="tip">Design tip: Reduce options to 7 or fewer to prevent decision paralysis</p>
        `;
        decisionFeedbackEl.classList.add('feedback-update');
        
        // Add visual feedback
        savePreferencesBtn.classList.add('success-highlight');
        setTimeout(() => savePreferencesBtn.classList.remove('success-highlight'), 2000);
        
        // Add insight if not already present
        const insightExists = sessionData.insights.some(i => i.type === 'decision');
        if (!insightExists) {
            sessionData.insights.push({
                type: 'decision',
                title: 'Decision Complexity',
                description: 'You experienced choice overload - a common cause of user frustration.'
            });
            updatePatternAnalysis();
        }
    }
    
    // Update pattern analysis
    function updatePatternAnalysis() {
        if (sessionData.insights.length === 0) {
            patternAnalysisEl.innerHTML = `
                <p>Interact with the challenges above to see personalized insights about your interaction patterns.</p>
            `;
            return;
        }
        
        let html = '<p><strong>Based on your interactions:</strong></p><ul>';
        
        sessionData.insights.forEach(insight => {
            html += `<li><strong>${insight.title}:</strong> ${insight.description}</li>`;
        });
        
        html += '</ul>';
        
        // Add summary of patterns
        const totalPatterns = Object.values(sessionData.patterns).reduce((a, b) => a + b, 0);
        if (totalPatterns > 0) {
            html += `<p><strong>Pattern frequency:</strong></p><ul>`;
            if (sessionData.patterns.rushedClicks > 0) {
                html += `<li>Rushed clicks: ${sessionData.patterns.rushedClicks} occurrence${sessionData.patterns.rushedClicks !== 1 ? 's' : ''}</li>`;
            }
            if (sessionData.patterns.ignoredHints > 0) {
                html += `<li>Ignored hints: ${sessionData.patterns.ignoredHints} occurrence${sessionData.patterns.ignoredHints !== 1 ? 's' : ''}</li>`;
            }
            if (sessionData.patterns.ambiguousChoices > 0) {
                html += `<li>Ambiguous choices: ${sessionData.patterns.ambiguousChoices} occurrence${sessionData.patterns.ambiguousChoices !== 1 ? 's' : ''}</li>`;
            }
            if (sessionData.patterns.cognitiveLoad > 0) {
                html += `<li>Cognitive overload: ${sessionData.patterns.cognitiveLoad} occurrence${sessionData.patterns.cognitiveLoad !== 1 ? 's' : ''}</li>`;
            }
            html += `</ul>`;
        }
        
        patternAnalysisEl.innerHTML = html;
    }
    
    // Reset session
    function resetSession() {
        if (confirm('Reset the session and clear all interaction data?')) {
            sessionData = {
                startTime: new Date(),
                errors: {
                    buttons: 0,
                    form: 0,
                    navigation: 0,
                    decisions: 0
                },
                patterns: {
                    rushedClicks: 0,
                    ignoredHints: 0,
                    ambiguousChoices: 0,
                    cognitiveLoad: 0
                },
                insights: []
            };
            
            // Reset UI
            clickErrorsEl.textContent = '0';
            formErrorsEl.textContent = '0';
            navErrorsEl.textContent = '0';
            decisionErrorsEl.textContent = '0';
            
            // Reset feedback
            buttonFeedbackEl.innerHTML = '<p>Click any button to see analysis of common click patterns</p>';
            formFeedbackEl.innerHTML = '<p>Try submitting the form to see common validation patterns</p>';
            navFeedbackEl.innerHTML = '<p>Navigation clarity affects how quickly users find what they need</p>';
            decisionFeedbackEl.innerHTML = '<p>Too many choices can overwhelm users and lead to random selections</p>';
            
            // Reset form
            confusingForm.reset();
            emailInput.classList.remove('error-highlight');
            passwordInput.classList.remove('error-highlight');
            confirmPasswordInput.classList.remove('error-highlight');
            termsCheckbox.parentElement.classList.remove('error-highlight');
            
            // Reset checkboxes
            allCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset navigation selection
            navSelectionEl.innerHTML = '<span class="selection-hint">Click any navigation item</span>';
            
            // Reset pattern analysis
            updatePatternAnalysis();
            
            // Update session time
            updateSessionTime();
        }
    }
    
    // Show ethics statement
    function showEthicsStatement(e) {
        e.preventDefault();
        alert('Ethics Statement\n\nThis playground is designed with ethical principles:\n\n1. No user shaming: Errors are framed as design issues, not user failures\n2. Educational focus: All insights are for learning about UX design\n3. Privacy protection: No data is collected or stored externally\n4. Transparency: The experimental nature is clearly communicated\n5. Beneficence: The goal is to improve user experiences everywhere');
    }
    
    // Show learn more information
    function showLearnMore(e) {
        e.preventDefault();
        alert('About Human Error Playground\n\nThis tool explores:\n\n• Common UI patterns that lead to errors\n• Why users make certain mistakes\n• How better design can prevent frustration\n• The psychology behind interface interactions\n\nIt\'s based on research in human-computer interaction, cognitive psychology, and user experience design.');
    }
    
    // Initialize the app
    init();
});