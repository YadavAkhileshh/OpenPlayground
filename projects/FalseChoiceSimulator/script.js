// False Choice Simulator - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        currentScenario: 0,
        choices: [],
        scenarios: [
            {
                id: 1,
                title: "The Restaurant Menu",
                description: "You're at a restaurant with a friend. The menu offers two options: a $25 steak or a $24 chicken dish. Both are priced similarly to make the steak seem like a better value, but cheaper options were intentionally omitted.",
                choices: [
                    { id: "steak", label: "Choose the Steak ($25)", description: "Premium cut with sides - appears as the better value" },
                    { id: "chicken", label: "Choose the Chicken ($24)", description: "Grilled chicken with similar sides - only $1 cheaper" }
                ],
                constraints: "You were only shown two similarly-priced options. The restaurant actually has 8 other dishes priced between $12-$18 that were not shown on your menu. This is an example of Decoy Effect - presenting two options where one seems superior due to strategic comparison.",
                bias: "Decoy Effect",
                hiddenAlternatives: ["Ask for full menu", "Choose a different restaurant", "Order appetizers only", "Split dishes with friend"]
            },
            {
                id: 2,
                title: "Political Vote",
                description: "In an election, you're presented with two candidates with very similar policies. Media coverage focuses only on these two, ignoring third-party candidates with different approaches.",
                choices: [
                    { id: "candidateA", label: "Vote for Candidate A", description: "Established party with moderate policies" },
                    { id: "candidateB", label: "Vote for Candidate B", description: "Opposition party with similar moderate stance" }
                ],
                constraints: "The media's focus on only two candidates creates an illusion of binary choice. There are actually 4 other candidates with diverse policies that receive less than 1% of news coverage. This demonstrates the False Dilemma bias.",
                bias: "False Dilemma",
                hiddenAlternatives: ["Vote third party", "Write-in candidate", "Abstain from voting", "Focus on local elections"]
            },
            {
                id: 3,
                title: "Software Subscription",
                description: "A software company offers two plans: 'Basic' at $9.99/month with limited features, and 'Pro' at $19.99/month with all features. No intermediate option exists.",
                choices: [
                    { id: "basic", label: "Choose Basic Plan ($9.99)", description: "Limited features, might not meet all needs" },
                    { id: "pro", label: "Choose Pro Plan ($19.99)", description: "All features but double the price" }
                ],
                constraints: "The company intentionally removed their $14.99 'Standard' plan to push users toward the more expensive option. This is a classic example of Price Anchoring and Hobson's Choice.",
                bias: "Price Anchoring",
                hiddenAlternatives: ["Use free alternative", "Purchase lifetime license", "Share account with team", "Request educational discount"]
            },
            {
                id: 4,
                title: "Healthcare Options",
                description: "Your doctor presents two treatment options: an expensive new medication or invasive surgery. Traditional, cheaper alternatives aren't mentioned.",
                choices: [
                    { id: "medication", label: "Choose New Medication", description: "Expensive but non-invasive treatment" },
                    { id: "surgery", label: "Choose Surgery", description: "Invasive procedure with long recovery" }
                ],
                constraints: "Your doctor receives incentives for prescribing the new medication. There are 3 established, cheaper treatment options with similar efficacy rates that weren't presented. This demonstrates Authority Bias and Hidden Incentives.",
                bias: "Authority Bias",
                hiddenAlternatives: ["Get second opinion", "Ask about generic drugs", "Try lifestyle changes first", "Seek alternative therapy"]
            },
            {
                id: 5,
                title: "Career Decision",
                description: "Your employer offers you a choice: relocate to a different city for a promotion or stay in your current role without growth opportunities.",
                choices: [
                    { id: "relocate", label: "Accept Relocation", description: "Career growth but personal disruption" },
                    { id: "stay", label: "Stay in Current Role", description: "Stability but limited advancement" }
                ],
                constraints: "This is a false dichotomy. There are multiple alternatives: negotiating remote work, seeking a different promotion path, or finding employment elsewhere. This illustrates Binary Thinking bias.",
                bias: "Binary Thinking",
                hiddenAlternatives: ["Request remote option", "Propose new role", "Seek external offer", "Create side business"]
            }
        ]
    };

    // DOM Elements
    const scenarioTitle = document.getElementById('scenarioTitle');
    const scenarioDescription = document.getElementById('scenarioDescription');
    const choiceContainer = document.getElementById('choiceContainer');
    const constraintsPanel = document.getElementById('constraintsPanel');
    const choicesCount = document.getElementById('choicesCount');
    const constrainedCount = document.getElementById('constrainedCount');
    const freeCount = document.getElementById('freeCount');
    const historyList = document.getElementById('historyList');
    const scenarioNumber = document.querySelector('.scenario-number');
    const progressFill = document.querySelector('.progress-fill');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // Initialize
    loadScenario(state.currentScenario);
    updateStats();

    // Event Listeners
    document.getElementById('prevScenario').addEventListener('click', prevScenario);
    document.getElementById('nextScenario').addEventListener('click', nextScenario);
    document.getElementById('revealTruth').addEventListener('click', revealConstraints);
    document.getElementById('exportBtn').addEventListener('click', exportResults);
    document.getElementById('resetBtn').addEventListener('click', resetExperiment);

    // Scenario Navigation
    function loadScenario(index) {
        const scenario = state.scenarios[index];
        
        scenarioTitle.textContent = scenario.title;
        scenarioDescription.textContent = scenario.description;
        scenarioNumber.textContent = `Scenario ${index + 1} of ${state.scenarios.length}`;
        progressFill.style.width = `${((index + 1) / state.scenarios.length) * 100}%`;
        
        renderChoices(scenario.choices);
        hideConstraints();
    }

    function renderChoices(choices) {
        choiceContainer.innerHTML = '';
        
        choices.forEach(choice => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-option';
            choiceElement.setAttribute('data-choice', choice.id);
            
            choiceElement.innerHTML = `
                <div class="choice-icon"><i class="fas ${choice.id === 'steak' ? 'fa-drumstick-bite' : choice.id === 'chicken' ? 'fa-utensils' : 'fa-check-circle'}"></i></div>
                <div class="choice-content">
                    <h3>${choice.label}</h3>
                    <p>${choice.description}</p>
                </div>
                <div class="choice-select"><i class="fas fa-check"></i></div>
            `;
            
            choiceElement.addEventListener('click', () => selectChoice(choice.id));
            choiceContainer.appendChild(choiceElement);
        });
    }

    function selectChoice(choiceId) {
        // Remove previous selection
        document.querySelectorAll('.choice-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-choice="${choiceId}"]`);
        selectedOption.classList.add('selected');
        
        // Record choice
        const scenario = state.scenarios[state.currentScenario];
        const choice = scenario.choices.find(c => c.id === choiceId);
        
        state.choices.push({
            scenario: scenario.title,
            choice: choice.label,
            bias: scenario.bias,
            timestamp: new Date().toLocaleTimeString()
        });
        
        updateStats();
        showNotification(`Choice recorded: ${choice.label.split('(')[0].trim()}`);
    }

    function prevScenario() {
        if (state.currentScenario > 0) {
            state.currentScenario--;
            loadScenario(state.currentScenario);
            hideConstraints();
        }
    }

    function nextScenario() {
        if (state.currentScenario < state.scenarios.length - 1) {
            state.currentScenario++;
            loadScenario(state.currentScenario);
            hideConstraints();
        } else {
            showNotification("You've completed all scenarios! Review your results.");
        }
    }

    function revealConstraints() {
        const scenario = state.scenarios[state.currentScenario];
        
        constraintsPanel.style.display = 'block';
        constraintsPanel.querySelector('.constraints-content').innerHTML = `
            <p><strong>The False Choice:</strong> ${scenario.constraints.split('. ')[0]}.</p>
            <p><strong>Hidden Alternatives:</strong> ${scenario.hiddenAlternatives.join(', ')}.</p>
            <p><strong>Psychological Bias:</strong> This is an example of <strong>${scenario.bias}</strong> - ${scenario.constraints.split('. ').slice(1).join('. ')}</p>
            <p><strong>Real Choice:</strong> You could have considered the hidden alternatives or questioned the presented options.</p>
        `;
        constraintsPanel.querySelector('.bias-tag').textContent = scenario.bias;
        
        // Mark as constrained choice
        if (state.choices.length > 0) {
            const lastChoice = state.choices[state.choices.length - 1];
            if (lastChoice.scenario === scenario.title) {
                lastChoice.constrained = true;
                updateStats();
            }
        }
    }

    function hideConstraints() {
        constraintsPanel.style.display = 'none';
    }

    // Statistics and History
    function updateStats() {
        choicesCount.textContent = state.choices.length;
        
        const constrainedChoices = state.choices.filter(c => c.constrained).length;
        constrainedCount.textContent = constrainedChoices;
        freeCount.textContent = state.choices.length - constrainedChoices;
        
        updateHistory();
    }

    function updateHistory() {
        if (state.choices.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No choices made yet. Start the experiment!</div>';
            return;
        }
        
        historyList.innerHTML = state.choices.slice().reverse().map(choice => `
            <div class="history-item">
                <div class="history-content">
                    <div class="history-choice">${choice.choice.split('(')[0].trim()}</div>
                    <div class="history-scenario">${choice.scenario} • ${choice.timestamp}</div>
                </div>
                <div class="history-bias ${choice.constrained ? 'constrained' : ''}">
                    ${choice.constrained ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>'}
                </div>
            </div>
        `).join('');
    }

    // Export Functionality
    function exportResults() {
        const data = {
            experiment: "False Choice Simulator Results",
            timestamp: new Date().toISOString(),
            totalChoices: state.choices.length,
            constrainedChoices: state.choices.filter(c => c.constrained).length,
            freeChoices: state.choices.filter(c => !c.constrained).length,
            choices: state.choices,
            scenariosCompleted: state.currentScenario + 1
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `false-choice-results-${new Date().toISOString().slice(0, 10)}.json`;
        downloadLink.click();
        
        showNotification('Results exported successfully!');
    }

    function resetExperiment() {
        if (confirm('Are you sure you want to reset the experiment? All your choices will be lost.')) {
            state.currentScenario = 0;
            state.choices = [];
            loadScenario(0);
            updateStats();
            hideConstraints();
            showNotification('Experiment reset successfully!');
        }
    }

    // Notification System
    function showNotification(message) {
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize with first choice selected (for demo purposes)
    setTimeout(() => {
        if (state.choices.length === 0) {
            document.querySelector('.choice-option').click();
        }
    }, 1000);
});