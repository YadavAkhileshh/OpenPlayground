const SCENARIOS = [
    {
        id: 1,
        app: "Flashlight Pro",
        icon: "ri-flashlight-line",
        title: "Requires Camera Access",
        text: "Flashlight Pro needs access to your camera LED to function as a flashlight. It also collects anonymous usage data to improve battery efficiency.",
        type: "clean",
        trap: false
    },
    {
        id: 2,
        app: "WeatherNow",
        icon: "ri-sun-cloudy-line",
        title: "Location Services",
        text: "To provide accurate local forecasts, WeatherNow requires precise location access. We may share this location data with advertising partners to show relevant local offers.",
        type: "clean",
        trap: false
    },
    {
        id: 3,
        app: "StepCounter",
        icon: "ri-run-line",
        title: "Health Data Access",
        text: "StepCounter needs to read your motion activity. By continuing, you agree to our Terms of Service. Note: We retain the right to sell motion profiles to insurance providers for premium adjustments.",
        type: "long_text",
        trap: true,
        trapText: "Sold health data to insurers."
    },
    {
        id: 4,
        app: "SocialConnect",
        icon: "ri-user-smile-line",
        title: "Contact Sync",
        text: "Find your friends easily! syncing contacts allows us to store your address book on our servers forever. You cannot delete this data later once uploaded.",
        type: "grey_decline",
        trap: true,
        trapText: "Uploaded permanent contact list."
    },
    {
        id: 5,
        app: "FreeWiFi Manager",
        icon: "ri-wifi-line",
        title: "Network Config",
        text: "Install SSL certificate to optimize connection speed? This allows FreeWiFi Manager to decrypt and inspect all secure traffic including banking details for 'security purposes'.",
        type: "hidden_decline",
        trap: true,
        trapText: "Installed root certificate (Spyware)."
    },
    {
        id: 6,
        app: "PhotoFilterz",
        icon: "ri-camera-lens-line",
        title: "Gallery Access",
        text: "PhotoFilterz needs full gallery access. By clicking 'Continue', you grant us a perpetual, royalty-free license to use any photos you edit in our global marketing campaigns without attribution.",
        type: "swap_buttons",
        trap: true,
        trapText: "Lost copyright to personal photos."
    },
    {
        id: 7,
        app: "BatterySaver",
        icon: "ri-battery-charge-line",
        title: "Optimization",
        text: "Enable 'Aggressive Mode' to save power. This will disable emergency alerts and prevent background syncing for messaging apps.",
        type: "confusing_checkbox",
        trap: true,
        trapText: "Disabled emergency alerts."
    },
    {
        id: 8,
        app: "CryptoWallet",
        icon: "ri-bit-coin-line",
        title: "Security Update",
        text: "A critical security update is available. Do not uncheck the box below if you do not wish to opt-out of our new 'Shared Processing' feature which uses your device for background mining.",
        type: "double_negative",
        trap: true,
        trapText: "Enrolled in botnet mining."
    },
    {
        id: 9,
        app: "GlobalNews",
        icon: "ri-newspaper-line",
        title: "Newsletter",
        text: "Stay updated! Join our premium newsletter. 7-day free trial, then $99/week automatically charged to carrier. Cancellation requires a written letter to our Cayman Islands office.",
        type: "visual_interference",
        trap: true,
        trapText: "Subscribed to $400/mo service."
    },
    {
        id: 10,
        app: "System UI",
        icon: "ri-settings-3-line",
        title: "Critical Error",
        text: "System instability detected. Immediate factory reset recommended to prevent permanent hardware damage. Click 'Confirm' to erase all data or 'Cancel' to risk failure.",
        type: "fake_urgency",
        trap: true,
        trapText: "Wiped device data unnecessarily."
    }
];

// State
let currentLevel = 0;
let userLog = [];
let startTime = 0;
let score = 100;

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const simScreen = document.getElementById('simulation-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const progressFill = document.getElementById('progress-fill');
const levelIndicator = document.getElementById('level-indicator');

// Initialization
startBtn.addEventListener('click', startGame);

function startGame() {
    introScreen.classList.remove('active');
    simScreen.classList.add('active');
    currentLevel = 0;
    userLog = [];
    score = 100;
    renderLevel(0);
}

function renderLevel(index) {
    if (index >= SCENARIOS.length) {
        endGame();
        return;
    }

    const scenario = SCENARIOS[index];
    const modalBody = document.getElementById('modal-body');
    const modalActions = document.getElementById('modal-actions');
    const appIcon = document.getElementById('app-icon');
    const appName = document.getElementById('modal-app-name');

    // Update Header
    appIcon.innerHTML = `<i class="${scenario.icon}"></i>`;
    appName.innerText = scenario.app;

    // Update Progress
    const pct = ((index) / SCENARIOS.length) * 100;
    progressFill.style.width = `${pct}%`;
    levelIndicator.innerText = `0${index + 1}/10`;

    // Render Content based on dark pattern type
    renderContent(scenario, modalBody, modalActions);

    startTime = Date.now();

    // Scroll trap reset
    const scrollArea = document.getElementById('terms-content');
    if (scrollArea) scrollArea.scrollTop = 0;
}

function renderContent(scenario, bodyContainer, actionContainer) {
    // Inject Terms text
    // We make the text long/short based on level
    let contentHTML = `<p>${scenario.text}</p>`;
    if (scenario.type === 'long_text' || scenario.id > 3) {
        contentHTML += `<br><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>`.repeat(3);
    }

    // Special Pattern: Confusing Checkbox
    if (scenario.type === 'confusing_checkbox') {
        contentHTML += `
        <div class="switch-container">
            <input type="checkbox" id="trap-checkbox" checked>
            <label for="trap-checkbox">I confirm I have read and understand the risks.</label>
        </div>`;
    }

    // Special Pattern: Double Negative
    if (scenario.type === 'double_negative') {
        contentHTML += `
        <div class="switch-container">
            <input type="checkbox" id="trap-checkbox">
            <label for="trap-checkbox">Do not check this box if you wish to opt-out of data sharing.</label>
        </div>`;
    }

    bodyContainer.innerHTML = `<h3>${scenario.title}</h3><div class="scroll-area" id="terms-content">${contentHTML}</div>`;

    // Buttons
    // Default Buttons
    let btnPrimary = `<button class="primary-btn btn-full" onclick="handleDecision(true)">Accept</button>`;
    let btnSecondary = `<button class="secondary-btn btn-full" onclick="handleDecision(false)">Decline</button>`;

    // Modifications
    if (scenario.type === 'grey_decline') {
        btnSecondary = `<button class="ghost-btn" style="font-size:0.7rem" onclick="handleDecision(false)">No thanks</button>`;
    }

    if (scenario.type === 'hidden_decline') {
        btnSecondary = `<button class="ghost-btn" style="opacity:0.3; transform:scale(0.8)" onclick="handleDecision(false)">Cancel</button>`;
    }

    if (scenario.type === 'swap_buttons') {
        // Swapped visual weight
        const temp = btnPrimary;
        btnPrimary = `<button class="primary-btn btn-full" onclick="handleDecision(false)">Cancel</button>`; // Visual primary is actually cancel/safe? No, usually "Accept" is green.
        // Wait, standard dark pattern is: Green button = Accept Bad Thing. Grey button = Reject.
        // Swap pattern: The button on the right is usually Continue, so we put Cancel there.
        actionContainer.innerHTML = `<div class="btn-row">
            <button class="secondary-btn btn-full" onclick="handleDecision(true)">Accept</button>
            <button class="primary-btn btn-full" onclick="handleDecision(false)">Cancel</button>
        </div>`;
        return;
    }

    if (scenario.type === 'fake_urgency') {
        bodyContainer.innerHTML += `<p class="text-danger" style="margin-top:1rem; font-weight:bold; animation: blink 1s infinite">TIME REMAINING: <span id="timer">10</span>s</p>`;
    }

    actionContainer.innerHTML = `<div class="btn-row">${btnSecondary}${btnPrimary}</div>`;
}

function handleDecision(accepted) {
    const timeTaken = (Date.now() - startTime) / 1000;
    const scenario = SCENARIOS[currentLevel];

    // Analyze Result
    let hitTrap = false;

    if (accepted && scenario.trap) {
        // Basic trap: They accepted a bad thing
        hitTrap = true;
    }

    // Checkbox logic overrides
    const checkbox = document.getElementById('trap-checkbox');
    if (scenario.type === 'confusing_checkbox' && accepted) {
        // If they left it checked (default), they agreed? 
        // Text: "I confirm I have read..." -> usually good?
        // Let's assume the trap is hidden in the text, so accepting IS the trap.
    }

    if (scenario.type === 'double_negative' && accepted) {
        if (!checkbox.checked) {
            // "Do not check if you wish to opt-out"
            // Not checked = Opt-out failed? No.
            // "Do not check to opt-out" -> Check to Opt-in? 
            // "Do not check this box if you wish to opt-out"
            // If I want to opt-out, I check? "Do not check... if you wish to opt-out" -> If I leave it unchecked, I am opting out?
            // "Do not UNCHECK to reject" (another classic).

            // Let's stick to simple: If they Accepted the modal, and didn't opt-out via checkbox.
            // In double negative: "Do not check... to opt-out". So Unchecked = Opt-Out. Checked = Opt-In?
            // Usually it's "Uncheck this box to receive emails". Default Checked.

            // For this sim: We simplify. If they clicked Accept, they hit the trap unless they did specific widget interaction.
            // For now, let's say "Accept" = Trap triggered for all levels > 2
            hitTrap = true;
        } else {
            hitTrap = true; // Checked it? Maybe that was bad too
        }
    }

    // Scoring
    // Fast accept on long text = blindly accepted
    const scrollArea = document.getElementById('terms-content');
    const scrolled = scrollArea ? (scrollArea.scrollTop / (scrollArea.scrollHeight - scrollArea.clientHeight)) : 1;

    if (accepted) {
        if (timeTaken < 2) score -= 5; // Too fast
        if (scrolled < 0.5 && scenario.type === 'long_text') score -= 5; // Didn't read
        if (hitTrap) {
            score -= 10;
            userLog.push(scenario.trapText);
        }
    }

    currentLevel++;
    renderLevel(currentLevel);
}

function endGame() {
    simScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Color
    let color = '#00ff9d';
    if (score < 70) color = '#ffce00';
    if (score < 40) color = '#ff0055';

    document.getElementById('score-stroke').style.stroke = color;
    document.getElementById('score-stroke').style.strokeDasharray = `${score}, 100`;
    document.getElementById('final-score').innerText = `${score}%`;
    document.getElementById('final-score').style.fill = color;

    // Log
    const logList = document.getElementById('incident-log');
    if (userLog.length === 0) {
        logList.innerHTML = `<li style="color:var(--success)">No incidents detected. Systems nominal.</li>`;
    } else {
        logList.innerHTML = userLog.map(item => `<li>${item}</li>`).join('');
    }
}
