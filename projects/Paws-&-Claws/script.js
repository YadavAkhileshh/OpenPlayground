// --- Database ---
const breedDatabase = [
    { name: "Samoyed", traits: { climate: "cold", space: "house", activity: "high" }, tags: "Fluffy • Vocal • Active" },
    { name: "Indian Spitz", traits: { climate: "hot", space: "apartment", activity: "low" }, tags: "Adaptable • Alert • Low Maintenance" },
    { name: "Golden Retriever", traits: { climate: "moderate", space: "house", activity: "high" }, tags: "Friendly • Loyal • Energetic" },
    { name: "Shiba Inu", traits: { climate: "moderate", space: "apartment", activity: "medium" }, tags: "Independent • Clean • Agile" }
];

const questions = [
    {
        id: "climate",
        text: "What is your local climate like?",
        options: [
            { text: "Hot (e.g., Summer all year)", value: "hot" },
            { text: "Cold (e.g., Snowy/Chilly)", value: "cold" },
            { text: "Moderate (Four seasons)", value: "moderate" }
        ]
    },
    {
        id: "space",
        text: "What kind of living space do you have?",
        options: [
            { text: "Apartment (No yard)", value: "apartment" },
            { text: "House with a fenced yard", value: "house" }
        ]
    },
    {
        id: "activity",
        text: "How active are you daily?",
        options: [
            { text: "Low (Short walks)", value: "low" },
            { text: "Medium (Daily 1hr walks)", value: "medium" },
            { text: "High (Running/Hiking)", value: "high" }
        ]
    }
];

// --- State ---
let currentQuestionIndex = 0;
let userAnswers = {};

// --- DOM Elements ---
const viewStart = document.getElementById('view-start');
const viewQuiz = document.getElementById('view-quiz');
const viewResults = document.getElementById('view-results');
const questionText = document.getElementById('questionText');
const optionsGrid = document.getElementById('optionsGrid');
const progressFill = document.getElementById('progressFill');
const resultsList = document.getElementById('resultsList');

// --- SPA Navigation ---
function switchView(hideEl, showEl) {
    hideEl.classList.remove('active');
    hideEl.classList.add('hidden');
    showEl.classList.remove('hidden');
    showEl.classList.add('active');
}

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = {};
    switchView(viewStart, viewQuiz);
    renderQuestion();
}

function resetQuiz() {
    switchView(viewResults, viewStart);
}

// --- Quiz Logic ---
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.innerText = q.text;
    optionsGrid.innerHTML = '';

    // Update Progress
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => handleAnswer(q.id, opt.value);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(questionId, answerValue) {
    userAnswers[questionId] = answerValue;
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        progressFill.style.width = `100%`;
        setTimeout(() => calculateResults(), 300); // Slight delay for UI smoothness
    }
}

// --- Algorithm Engine ---
function calculateResults() {
    let scoredBreeds = breedDatabase.map(breed => {
        let score = 100;

        // 1. Climate Rule (Heavily weighted)
        if (userAnswers.climate === "hot" && breed.traits.climate === "cold") {
            score -= 40; // Massive penalty for double-coated dogs in heat
        } else if (userAnswers.climate !== breed.traits.climate && breed.traits.climate !== "moderate") {
            score -= 15;
        }

        // 2. Space Rule
        if (userAnswers.space === "apartment" && breed.traits.space === "house") {
            score -= 25; // High energy big dogs struggle in apartments
        }

        // 3. Activity Rule
        if (userAnswers.activity === "low" && breed.traits.activity === "high") {
            score -= 30; // Recipe for destructive behavior
        } else if (userAnswers.activity === "high" && breed.traits.activity === "low") {
            score -= 10;
        }

        // Cap score bounds
        score = Math.max(10, Math.min(100, score));

        return { ...breed, finalScore: score };
    });

    // Sort descending
    scoredBreeds.sort((a, b) => b.finalScore - a.finalScore);

    renderResults(scoredBreeds);
    switchView(viewQuiz, viewResults);
}

function renderResults(scoredBreeds) {
    resultsList.innerHTML = '';

    // Show top 3
    scoredBreeds.slice(0, 3).forEach(breed => {
        let colorClass = 'med';
        if (breed.finalScore >= 80) colorClass = '';
        if (breed.finalScore < 50) colorClass = 'low';

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-info">
                <div class="breed-name">${breed.name}</div>
                <div class="breed-tags">${breed.tags}</div>
            </div>
            <div class="match-score ${colorClass}">${breed.finalScore}%</div>
        `;
        resultsList.appendChild(card);
    });
}