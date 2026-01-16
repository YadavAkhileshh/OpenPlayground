
const AppState = {
    currentQuestionIndex: 0,
    answers: {},
    totalQuestions: 0,
    assessmentStartTime: null
};

// Assessment Questions Database
const assessmentQuestions = [
    {
        id: 1,
        question: "How often do you feel overwhelmed by daily tasks?",
        options: [
            { value: 0, text: "Rarely or never" },
            { value: 1, text: "Occasionally" },
            { value: 2, text: "Frequently" },
            { value: 3, text: "Almost always" }
        ]
    },
    {
        id: 2,
        question: "How would you rate your sleep quality over the past week?",
        options: [
            { value: 0, text: "Excellent - I wake up refreshed" },
            { value: 1, text: "Good - Generally restful" },
            { value: 2, text: "Poor - Often tired upon waking" },
            { value: 3, text: "Very poor - Consistently exhausted" }
        ]
    },
    {
        id: 3,
        question: "How difficult is it for you to concentrate on tasks?",
        options: [
            { value: 0, text: "Not difficult at all" },
            { value: 1, text: "Somewhat difficult" },
            { value: 2, text: "Very difficult" },
            { value: 3, text: "Extremely difficult" }
        ]
    },
    {
        id: 4,
        question: "How often do you experience physical tension or headaches?",
        options: [
            { value: 0, text: "Rarely" },
            { value: 1, text: "Once or twice a week" },
            { value: 2, text: "Several times a week" },
            { value: 3, text: "Daily" }
        ]
    },
    {
        id: 5,
        question: "How motivated do you feel about your work or studies?",
        options: [
            { value: 0, text: "Very motivated" },
            { value: 1, text: "Somewhat motivated" },
            { value: 2, text: "Slightly unmotivated" },
            { value: 3, text: "Completely unmotivated" }
        ]
    },
    {
        id: 6,
        question: "How frequently do you feel irritable or short-tempered?",
        options: [
            { value: 0, text: "Rarely" },
            { value: 1, text: "Occasionally" },
            { value: 2, text: "Often" },
            { value: 3, text: "Very often" }
        ]
    },
    {
        id: 7,
        question: "Do you find it hard to make decisions, even small ones?",
        options: [
            { value: 0, text: "No, I decide easily" },
            { value: 1, text: "Sometimes" },
            { value: 2, text: "Often" },
            { value: 3, text: "Almost always" }
        ]
    },
    {
        id: 8,
        question: "How often do you engage in activities you enjoy?",
        options: [
            { value: 0, text: "Regularly" },
            { value: 1, text: "Occasionally" },
            { value: 2, text: "Rarely" },
            { value: 3, text: "Almost never" }
        ]
    },
    {
        id: 9,
        question: "How would you describe your energy levels throughout the day?",
        options: [
            { value: 0, text: "Consistently high" },
            { value: 1, text: "Generally good" },
            { value: 2, text: "Often low" },
            { value: 3, text: "Constantly exhausted" }
        ]
    },
    {
        id: 10,
        question: "How often do you feel anxious or worried?",
        options: [
            { value: 0, text: "Rarely" },
            { value: 1, text: "Sometimes" },
            { value: 2, text: "Frequently" },
            { value: 3, text: "Constantly" }
        ]
    },
    {
        id: 11,
        question: "Do you feel connected to friends and family?",
        options: [
            { value: 0, text: "Very connected" },
            { value: 1, text: "Somewhat connected" },
            { value: 2, text: "Slightly disconnected" },
            { value: 3, text: "Very isolated" }
        ]
    },
    {
        id: 12,
        question: "How often do you take breaks during work or study?",
        options: [
            { value: 0, text: "Regularly throughout the day" },
            { value: 1, text: "A few times a day" },
            { value: 2, text: "Rarely" },
            { value: 3, text: "Almost never" }
        ]
    },
    {
        id: 13,
        question: "How satisfied are you with your work-life balance?",
        options: [
            { value: 0, text: "Very satisfied" },
            { value: 1, text: "Somewhat satisfied" },
            { value: 2, text: "Dissatisfied" },
            { value: 3, text: "Very dissatisfied" }
        ]
    },
    {
        id: 14,
        question: "Do you experience physical symptoms like muscle tension or digestive issues?",
        options: [
            { value: 0, text: "Rarely or never" },
            { value: 1, text: "Occasionally" },
            { value: 2, text: "Frequently" },
            { value: 3, text: "Very frequently" }
        ]
    },
    {
        id: 15,
        question: "How hopeful do you feel about the future?",
        options: [
            { value: 0, text: "Very hopeful" },
            { value: 1, text: "Somewhat hopeful" },
            { value: 2, text: "Not very hopeful" },
            { value: 3, text: "Not hopeful at all" }
        ]
    }
];

// Result Categories with personalized feedback
const resultCategories = {
    low: {
        range: [0, 15],
        title: "Minimal Mental Fatigue",
        color: "#10b981",
        description: "You're managing stress well and maintaining good mental health. Keep up your healthy habits!",
        recommendations: [
            "Continue your current self-care routines",
            "Share your strategies with others who might benefit",
            "Stay proactive about stress management",
            "Maintain regular sleep and exercise habits"
        ]
    },
    moderate: {
        range: [16, 30],
        title: "Moderate Mental Fatigue",
        color: "#f59e0b",
        description: "You're experiencing some mental fatigue. It's important to address these signs before they escalate.",
        recommendations: [
            "Prioritize 7-9 hours of quality sleep each night",
            "Incorporate regular breaks during work or study",
            "Practice mindfulness or meditation for 10 minutes daily",
            "Engage in physical activity at least 3 times per week",
            "Consider talking to a trusted friend or counselor"
        ]
    },
    high: {
        range: [31, 45],
        title: "Significant Mental Fatigue",
        color: "#ef4444",
        description: "You're experiencing high levels of mental fatigue. It's crucial to take action and seek support.",
        recommendations: [
            "Schedule a consultation with a mental health professional",
            "Reduce non-essential commitments and obligations",
            "Establish a consistent sleep routine",
            "Practice stress-reduction techniques like deep breathing or yoga",
            "Connect with supportive friends or family members",
            "Consider taking a short break if possible",
            "Avoid excessive caffeine and ensure proper nutrition"
        ]
    }
};

// ==================================================
// DOM Element References
// ==================================================

const elements = {
    welcomeScreen: null,
    assessmentSection: null,
    resultsSection: null,
    startBtn: null,
    prevBtn: null,
    nextBtn: null,
    submitBtn: null,
    retakeBtn: null,
    downloadBtn: null,
    questionsContainer: null,
    progressBar: null,
    toast: null,
    toastMessage: null
};

// ==================================================
// Initialization
// ==================================================

function initializeApp() {
    // Cache DOM elements
    elements.welcomeScreen = document.getElementById('welcomeScreen');
    elements.assessmentSection = document.getElementById('assessmentSection');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.startBtn = document.getElementById('startBtn');
    elements.prevBtn = document.getElementById('prevBtn');
    elements.nextBtn = document.getElementById('nextBtn');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.retakeBtn = document.getElementById('retakeBtn');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.questionsContainer = document.getElementById('questionsContainer');
    elements.progressBar = document.getElementById('progressBar');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toastMessage');

    // Set total questions
    AppState.totalQuestions = assessmentQuestions.length;

    // Attach event listeners
    attachEventListeners();

    // Generate questions
    renderQuestions();
}

// ==================================================
// Event Listeners
// ==================================================

function attachEventListeners() {
    elements.startBtn.addEventListener('click', startAssessment);
    elements.prevBtn.addEventListener('click', handlePrevious);
    elements.nextBtn.addEventListener('click', handleNext);
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.retakeBtn.addEventListener('click', resetAssessment);
    elements.downloadBtn.addEventListener('click', downloadResults);
}

// ==================================================
// Question Rendering
// ==================================================

function renderQuestions() {
    const fragment = document.createDocumentFragment();

    assessmentQuestions.forEach((question, index) => {
        const questionBlock = createQuestionElement(question, index);
        fragment.appendChild(questionBlock);
    });

    elements.questionsContainer.appendChild(fragment);

    // Show first question
    showQuestion(0);
}

function createQuestionElement(question, index) {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.dataset.questionIndex = index;

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `
        <span class="question-number">${index + 1}</span>
        <span>${escapeHtml(question.question)}</span>
    `;

    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'options-group';
    optionsGroup.setAttribute('role', 'radiogroup');
    optionsGroup.setAttribute('aria-labelledby', `question-${question.id}`);

    question.options.forEach((option, optIndex) => {
        const label = document.createElement('label');
        label.className = 'option-label';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${question.id}`;
        radio.value = option.value;
        radio.id = `q${question.id}-opt${optIndex}`;
        radio.addEventListener('change', () => handleAnswerChange(question.id, option.value));

        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = option.text;

        label.appendChild(radio);
        label.appendChild(optionText);
        optionsGroup.appendChild(label);
    });

    block.appendChild(questionText);
    block.appendChild(optionsGroup);

    return block;
}

// ==================================================
// Navigation Functions
// ==================================================

function startAssessment() {
    AppState.assessmentStartTime = new Date();
    elements.welcomeScreen.classList.add('hidden');
    elements.assessmentSection.classList.remove('hidden');
    updateProgress();
}

function showQuestion(index) {
    const questionBlocks = document.querySelectorAll('.question-block');

    questionBlocks.forEach((block, i) => {
        if (i === index) {
            block.classList.remove('hidden');
            block.classList.add('active');
        } else {
            block.classList.add('hidden');
            block.classList.remove('active');
        }
    });

    updateNavigationButtons();
    updateProgress();
}

function handlePrevious() {
    if (AppState.currentQuestionIndex > 0) {
        AppState.currentQuestionIndex--;
        showQuestion(AppState.currentQuestionIndex);
    }
}

function handleNext() {
    const currentQuestionId = assessmentQuestions[AppState.currentQuestionIndex].id;
    // Check if answer exists (using hasOwnProperty to handle value of 0)
    if (!AppState.answers.hasOwnProperty(currentQuestionId)) {
        showToast('Please select an answer before proceeding');
        return;
    }

    if (AppState.currentQuestionIndex < AppState.totalQuestions - 1) {
        AppState.currentQuestionIndex++;
        showQuestion(AppState.currentQuestionIndex);
    }
}

function updateNavigationButtons() {
    // Previous button
    elements.prevBtn.disabled = AppState.currentQuestionIndex === 0;

    // Next/Submit button visibility
    const isLastQuestion = AppState.currentQuestionIndex === AppState.totalQuestions - 1;

    if (isLastQuestion) {
        elements.nextBtn.classList.add('hidden');
        elements.submitBtn.classList.remove('hidden');
    } else {
        elements.nextBtn.classList.remove('hidden');
        elements.submitBtn.classList.add('hidden');
    }
}

// ==================================================
// Answer Handling
// ==================================================

function handleAnswerChange(questionId, value) {
    AppState.answers[questionId] = parseInt(value);

    // Enable next/submit button when answer is selected
    const isLastQuestion = AppState.currentQuestionIndex === AppState.totalQuestions - 1;
    if (isLastQuestion) {
        elements.submitBtn.disabled = false;
    } else {
        elements.nextBtn.disabled = false;
    }
}

// ==================================================
// Form Submission & Results
// ==================================================

function handleSubmit(event) {
    event.preventDefault();

    // Validate all questions are answered
    if (Object.keys(AppState.answers).length !== AppState.totalQuestions) {
        showToast('Please answer all questions before submitting');
        return;
    }

    calculateAndDisplayResults();
}

function calculateAndDisplayResults() {
    const totalScore = Object.values(AppState.answers).reduce((sum, value) => sum + value, 0);
    const maxScore = AppState.totalQuestions * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Determine category
    let category = null;
    for (const [key, cat] of Object.entries(resultCategories)) {
        if (totalScore >= cat.range[0] && totalScore <= cat.range[1]) {
            category = cat;
            break;
        }
    }

    displayResults(totalScore, percentage, category);
}

function displayResults(score, percentage, category) {
    // Hide assessment, show results
    elements.assessmentSection.classList.add('hidden');
    elements.resultsSection.classList.remove('hidden');

    // Update date
    const resultsDate = document.getElementById('resultsDate');
    const now = new Date();
    resultsDate.textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Animate score
    animateScore(score);

    // Display category information
    displayCategory(category);

    // Display recommendations
    displayRecommendations(category.recommendations);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function animateScore(score) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreFill = document.getElementById('scoreFillCircle');
    const maxScore = AppState.totalQuestions * 3;

    // Animate number
    let currentScore = 0;
    const increment = score / 50;
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= score) {
            currentScore = score;
            clearInterval(timer);
        }
        scoreValue.textContent = Math.round(currentScore);
    }, 30);

    // Animate circle
    const circumference = 2 * Math.PI * 90;
    const percentage = (score / maxScore) * 100;
    const offset = circumference - (percentage / 100) * circumference;

    setTimeout(() => {
        scoreFill.style.strokeDashoffset = offset;
    }, 100);
}

function displayCategory(category) {
    const categoryContainer = document.getElementById('resultsCategory');
    categoryContainer.innerHTML = `
        <h3 class="category-title" style="color: ${category.color}">${escapeHtml(category.title)}</h3>
        <p class="category-description">${escapeHtml(category.description)}</p>
    `;
}

function displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations');

    const title = document.createElement('h3');
    title.textContent = 'Recommended Actions';

    const list = document.createElement('div');
    list.className = 'recommendation-list';

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.textContent = rec;
        list.appendChild(item);
    });

    recommendationsContainer.innerHTML = '';
    recommendationsContainer.appendChild(title);
    recommendationsContainer.appendChild(list);
}

// ==================================================
// Progress Bar
// ==================================================

function updateProgress() {
    const progress = ((AppState.currentQuestionIndex + 1) / AppState.totalQuestions) * 100;
    elements.progressBar.style.width = `${progress}%`;
}

// ==================================================
// Reset & Download Functions
// ==================================================

function resetAssessment() {
    // Reset state
    AppState.currentQuestionIndex = 0;
    AppState.answers = {};
    AppState.assessmentStartTime = null;

    // Clear all selections
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);

    // Hide results, show welcome
    elements.resultsSection.classList.add('hidden');
    elements.welcomeScreen.classList.remove('hidden');

    // Reset progress
    elements.progressBar.style.width = '0%';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadResults() {
    const totalScore = Object.values(AppState.answers).reduce((sum, value) => sum + value, 0);
    const maxScore = AppState.totalQuestions * 3;

    let category = null;
    for (const cat of Object.values(resultCategories)) {
        if (totalScore >= cat.range[0] && totalScore <= cat.range[1]) {
            category = cat;
            break;
        }
    }

    const resultsText = `
Mental Fatigue Assessment Results
=================================

Date: ${new Date().toLocaleDateString()}
Score: ${totalScore} / ${maxScore}
Category: ${category.title}

Description:
${category.description}

Recommended Actions:
${category.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
This assessment is for informational purposes only and does not constitute medical advice.
Please consult with a healthcare professional for personalized guidance.
    `.trim();

    // Create and download file
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mental-fatigue-results-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Results downloaded successfully!');
}

// ==================================================
// Utility Functions
// ==================================================

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================================================
// Initialize Application on DOM Ready
// ==================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}



if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        assessmentQuestions,
        resultCategories
    };
}
