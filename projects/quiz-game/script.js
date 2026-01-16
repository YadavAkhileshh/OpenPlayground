// ==================== QUESTIONS DATABASE ====================
const questionsDB = {
  web: {
    easy: [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks Text Mark Language",
        ],
        answer: 0,
      },
      {
        question: "Which tag is used to create a paragraph in HTML?",
        options: ["<paragraph>", "<p>", "<para>", "<text>"],
        answer: 1,
      },
      {
        question: "What does CSS stand for?",
        options: [
          "Computer Style Sheets",
          "Cascading Style Sheets",
          "Creative Style System",
          "Colorful Style Sheets",
        ],
        answer: 1,
      },
      {
        question: "Which HTML tag is used for the largest heading?",
        options: ["<h6>", "<heading>", "<h1>", "<head>"],
        answer: 2,
      },
      {
        question: "What is the correct HTML tag for inserting a line break?",
        options: ["<break>", "<lb>", "<br>", "<newline>"],
        answer: 2,
      },
      {
        question:
          "Which property is used to change the background color in CSS?",
        options: ["bgcolor", "background-color", "color", "background"],
        answer: 1,
      },
      {
        question: "What does the <a> tag define?",
        options: ["An image", "A hyperlink", "A paragraph", "A header"],
        answer: 1,
      },
      {
        question: "Which HTML attribute is used to define inline styles?",
        options: ["class", "styles", "style", "css"],
        answer: 2,
      },
      {
        question: "What is the correct HTML for creating a hyperlink?",
        options: [
          "<a href='url'>link</a>",
          "<link url='url'>",
          "<hyperlink>",
          "<url>link</url>",
        ],
        answer: 0,
      },
      {
        question: "Which CSS property controls the text size?",
        options: ["text-size", "font-style", "font-size", "text-style"],
        answer: 2,
      },
    ],
    medium: [
      {
        question: "Which is a JavaScript framework?",
        options: ["Django", "React", "Laravel", "Flask"],
        answer: 1,
      },
      {
        question:
          "What is the correct syntax for referring to an external script?",
        options: [
          "<script src='script.js'>",
          "<script href='script.js'>",
          "<script name='script.js'>",
          "<script file='script.js'>",
        ],
        answer: 0,
      },
      {
        question:
          "Which CSS property is used to change the font of an element?",
        options: ["font-style", "text-font", "font-family", "font-weight"],
        answer: 2,
      },
      {
        question: "How do you select an element with id 'demo' in CSS?",
        options: [".demo", "#demo", "demo", "*demo"],
        answer: 1,
      },
      {
        question:
          "What is the correct JavaScript syntax to change content of an HTML element?",
        options: [
          "document.getElement('p').innerHTML",
          "document.getElementById('p').innerHTML",
          "#p.innerHTML",
          "document.querySelector.innerHTML",
        ],
        answer: 1,
      },
      {
        question: "Which event occurs when the user clicks on an HTML element?",
        options: ["onchange", "onclick", "onmouseclick", "onhover"],
        answer: 1,
      },
      {
        question: "Which CSS property controls the space between elements?",
        options: ["spacing", "margin", "padding", "border"],
        answer: 1,
      },
      {
        question: "What is the default value of the position property?",
        options: ["relative", "fixed", "static", "absolute"],
        answer: 2,
      },
      {
        question: "How do you write a comment in JavaScript?",
        options: [
          "<!-- comment -->",
          "// comment",
          "** comment **",
          "# comment",
        ],
        answer: 1,
      },
      {
        question: "Which operator is used for strict equality in JavaScript?",
        options: ["==", "===", "=", "!="],
        answer: 1,
      },
    ],
    hard: [
      {
        question: "What is the output of typeof null in JavaScript?",
        options: ["null", "undefined", "object", "number"],
        answer: 2,
      },
      {
        question: "Which method removes the last element from an array?",
        options: ["pop()", "push()", "shift()", "unshift()"],
        answer: 0,
      },
      {
        question: "What does the 'use strict' directive do?",
        options: [
          "Makes code run faster",
          "Enables strict mode for error checking",
          "Disables console.log",
          "None of the above",
        ],
        answer: 1,
      },
      {
        question: "What is a closure in JavaScript?",
        options: [
          "A function with no parameters",
          "A function that has access to parent scope",
          "A type of loop",
          "A method to close browser",
        ],
        answer: 1,
      },
      {
        question: "Which CSS property is used to create a flex container?",
        options: [
          "display: flexbox",
          "display: flex",
          "flex: container",
          "flexbox: true",
        ],
        answer: 1,
      },
      {
        question: "What is the purpose of the 'async' keyword in JavaScript?",
        options: [
          "Makes function synchronous",
          "Makes function return a promise",
          "Stops function execution",
          "None of the above",
        ],
        answer: 1,
      },
      {
        question: "Which HTTP method is used to update a resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        answer: 2,
      },
      {
        question: "What is event bubbling in JavaScript?",
        options: [
          "Events trigger from child to parent",
          "Events trigger from parent to child",
          "Events don't propagate",
          "Events loop infinitely",
        ],
        answer: 0,
      },
      {
        question: "What is the purpose of 'z-index' in CSS?",
        options: [
          "Sets zoom level",
          "Controls stacking order",
          "Sets opacity",
          "Controls z-axis rotation",
        ],
        answer: 1,
      },
      {
        question: "Which method is used to parse JSON string to object?",
        options: [
          "JSON.parse()",
          "JSON.stringify()",
          "JSON.object()",
          "JSON.convert()",
        ],
        answer: 0,
      },
    ],
  },
  science: {
    easy: [
      {
        question: "What is the chemical symbol for water?",
        options: ["O2", "H2O", "CO2", "NaCl"],
        answer: 1,
      },
      {
        question: "What planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        answer: 2,
      },
      {
        question: "What is the largest organ in the human body?",
        options: ["Heart", "Liver", "Brain", "Skin"],
        answer: 3,
      },
      {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        answer: 1,
      },
      {
        question: "How many bones are in the adult human body?",
        options: ["106", "206", "306", "156"],
        answer: 1,
      },
      {
        question: "What is the closest star to Earth?",
        options: ["Alpha Centauri", "Sirius", "The Sun", "Proxima Centauri"],
        answer: 2,
      },
      {
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Platinum"],
        answer: 2,
      },
      {
        question: "What is the process by which plants make food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
        answer: 1,
      },
      {
        question: "What is the main gas in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        answer: 2,
      },
      {
        question: "What type of animal is a frog?",
        options: ["Mammal", "Reptile", "Amphibian", "Fish"],
        answer: 2,
      },
    ],
    medium: [
      {
        question: "What is the atomic number of Carbon?",
        options: ["4", "6", "8", "12"],
        answer: 1,
      },
      {
        question: "What is the speed of light in vacuum?",
        options: [
          "300,000 km/s",
          "150,000 km/s",
          "500,000 km/s",
          "1,000,000 km/s",
        ],
        answer: 0,
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
        answer: 2,
      },
      {
        question: "What type of bond is formed when electrons are shared?",
        options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
        answer: 1,
      },
      {
        question: "What is the pH of pure water?",
        options: ["0", "7", "14", "1"],
        answer: 1,
      },
      {
        question:
          "Which vitamin is produced by the skin when exposed to sunlight?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        answer: 2,
      },
      {
        question: "What is Newton's First Law also known as?",
        options: [
          "Law of Acceleration",
          "Law of Inertia",
          "Law of Action-Reaction",
          "Law of Gravity",
        ],
        answer: 1,
      },
      {
        question: "What is the smallest unit of matter?",
        options: ["Molecule", "Atom", "Electron", "Proton"],
        answer: 1,
      },
      {
        question: "What organelle is responsible for photosynthesis?",
        options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
        answer: 1,
      },
      {
        question: "What is the chemical formula for table salt?",
        options: ["NaCl", "KCl", "CaCl2", "MgCl2"],
        answer: 0,
      },
    ],
    hard: [
      {
        question: "What is the Heisenberg Uncertainty Principle about?",
        options: [
          "Energy conservation",
          "Position and momentum of particles",
          "Speed of light",
          "Atomic structure",
        ],
        answer: 1,
      },
      {
        question: "What is the half-life of Carbon-14?",
        options: ["1,000 years", "5,730 years", "10,000 years", "50,000 years"],
        answer: 1,
      },
      {
        question: "Which subatomic particle was discovered by J.J. Thomson?",
        options: ["Proton", "Neutron", "Electron", "Quark"],
        answer: 2,
      },
      {
        question: "What is the Chandrasekhar limit?",
        options: [
          "Maximum mass of white dwarf",
          "Speed of galaxies",
          "Age of universe",
          "Size of black holes",
        ],
        answer: 0,
      },
      {
        question: "What is the most abundant element in the universe?",
        options: ["Oxygen", "Carbon", "Helium", "Hydrogen"],
        answer: 3,
      },
      {
        question: "What is the function of mRNA in cells?",
        options: [
          "Store genetic information",
          "Carry genetic instructions",
          "Make proteins directly",
          "Replicate DNA",
        ],
        answer: 1,
      },
      {
        question: "What is the Krebs cycle also known as?",
        options: [
          "Glycolysis",
          "Citric acid cycle",
          "Calvin cycle",
          "Electron transport",
        ],
        answer: 1,
      },
      {
        question:
          "What is the theory that explains the origin of the universe?",
        options: [
          "String Theory",
          "Big Bang Theory",
          "Steady State Theory",
          "Quantum Theory",
        ],
        answer: 1,
      },
      {
        question: "What particle is responsible for the electromagnetic force?",
        options: ["Gluon", "Graviton", "Photon", "W boson"],
        answer: 2,
      },
      {
        question: "What is the unit of electrical resistance?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        answer: 2,
      },
    ],
  },
  general: {
    easy: [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: 2,
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
        answer: 2,
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: 3,
      },
      {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        answer: 2,
      },
      {
        question: "What is the currency of Japan?",
        options: ["Yuan", "Won", "Yen", "Ringgit"],
        answer: 2,
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Jane Austen",
          "Mark Twain",
        ],
        answer: 1,
      },
      {
        question: "What is the tallest mountain in the world?",
        options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
        answer: 2,
      },
      {
        question: "How many days are in a leap year?",
        options: ["364", "365", "366", "367"],
        answer: 2,
      },
      {
        question: "What is the largest country by area?",
        options: ["China", "USA", "Canada", "Russia"],
        answer: 3,
      },
      {
        question: "What color are emeralds?",
        options: ["Red", "Blue", "Green", "Yellow"],
        answer: 2,
      },
    ],
    medium: [
      {
        question: "In what year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        answer: 2,
      },
      {
        question: "Who was the first person to walk on the moon?",
        options: [
          "Buzz Aldrin",
          "Neil Armstrong",
          "Yuri Gagarin",
          "John Glenn",
        ],
        answer: 1,
      },
      {
        question: "What is the longest river in the world?",
        options: ["Amazon", "Yangtze", "Nile", "Mississippi"],
        answer: 2,
      },
      {
        question: "Which country hosted the 2016 Summer Olympics?",
        options: ["China", "UK", "Brazil", "Japan"],
        answer: 2,
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        answer: 1,
      },
      {
        question: "Who invented the telephone?",
        options: [
          "Thomas Edison",
          "Alexander Graham Bell",
          "Nikola Tesla",
          "Guglielmo Marconi",
        ],
        answer: 1,
      },
      {
        question: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        answer: 2,
      },
      {
        question: "Which ancient wonder was located in Egypt?",
        options: [
          "Hanging Gardens",
          "Colossus of Rhodes",
          "Great Pyramid of Giza",
          "Lighthouse of Alexandria",
        ],
        answer: 2,
      },
      {
        question: "What is the main ingredient in guacamole?",
        options: ["Tomato", "Avocado", "Onion", "Pepper"],
        answer: 1,
      },
      {
        question: "How many players are on a soccer team?",
        options: ["9", "10", "11", "12"],
        answer: 2,
      },
    ],
    hard: [
      {
        question: "What year was the United Nations founded?",
        options: ["1942", "1945", "1948", "1950"],
        answer: 1,
      },
      {
        question: "Who wrote 'The Art of War'?",
        options: ["Confucius", "Sun Tzu", "Lao Tzu", "Mencius"],
        answer: 1,
      },
      {
        question: "What is the deepest point in the ocean?",
        options: [
          "Puerto Rico Trench",
          "Mariana Trench",
          "Java Trench",
          "Philippine Trench",
        ],
        answer: 1,
      },
      {
        question: "Which empire was ruled by Genghis Khan?",
        options: [
          "Roman Empire",
          "Ottoman Empire",
          "Mongol Empire",
          "Persian Empire",
        ],
        answer: 2,
      },
      {
        question: "What is the national flower of Japan?",
        options: ["Rose", "Lotus", "Cherry Blossom", "Chrysanthemum"],
        answer: 2,
      },
      {
        question: "Who discovered penicillin?",
        options: [
          "Louis Pasteur",
          "Alexander Fleming",
          "Robert Koch",
          "Joseph Lister",
        ],
        answer: 1,
      },
      {
        question: "What is the capital of Mongolia?",
        options: ["Astana", "Ulaanbaatar", "Bishkek", "Tashkent"],
        answer: 1,
      },
      {
        question: "Which philosopher wrote 'The Republic'?",
        options: ["Aristotle", "Socrates", "Plato", "Epicurus"],
        answer: 2,
      },
      {
        question: "What is the smallest bone in the human body?",
        options: ["Femur", "Stapes", "Phalanx", "Patella"],
        answer: 1,
      },
      {
        question: "In which year did the Berlin Wall fall?",
        options: ["1987", "1988", "1989", "1990"],
        answer: 2,
      },
    ],
  },
  math: {
    easy: [
      {
        question: "What is 15 + 27?",
        options: ["40", "42", "44", "45"],
        answer: 1,
      },
      {
        question: "What is 8 × 7?",
        options: ["54", "56", "58", "63"],
        answer: 1,
      },
      {
        question: "What is 100 ÷ 4?",
        options: ["20", "25", "30", "40"],
        answer: 1,
      },
      {
        question: "What is the square root of 81?",
        options: ["7", "8", "9", "10"],
        answer: 2,
      },
      {
        question: "What is 50% of 200?",
        options: ["50", "100", "150", "200"],
        answer: 1,
      },
      {
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        answer: 1,
      },
      {
        question: "What is 3² (3 squared)?",
        options: ["6", "9", "12", "27"],
        answer: 1,
      },
      {
        question: "What is the perimeter of a square with side 5?",
        options: ["10", "15", "20", "25"],
        answer: 2,
      },
      {
        question: "What is 45 - 18?",
        options: ["23", "25", "27", "29"],
        answer: 2,
      },
      {
        question: "What is 12 × 12?",
        options: ["124", "132", "144", "156"],
        answer: 2,
      },
    ],
    medium: [
      {
        question: "What is the value of π (pi) to 2 decimal places?",
        options: ["3.12", "3.14", "3.16", "3.18"],
        answer: 1,
      },
      {
        question: "Solve: 2x + 5 = 15",
        options: ["x = 3", "x = 5", "x = 7", "x = 10"],
        answer: 1,
      },
      {
        question: "What is 25% of 80?",
        options: ["15", "20", "25", "30"],
        answer: 1,
      },
      {
        question: "What is the area of a triangle with base 10 and height 6?",
        options: ["30", "60", "16", "40"],
        answer: 0,
      },
      {
        question: "What is 2³ (2 cubed)?",
        options: ["4", "6", "8", "16"],
        answer: 2,
      },
      {
        question: "What is the next prime number after 17?",
        options: ["18", "19", "21", "23"],
        answer: 1,
      },
      {
        question: "What is the sum of angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        answer: 1,
      },
      {
        question: "What is 0.5 expressed as a fraction?",
        options: ["1/4", "1/3", "1/2", "2/3"],
        answer: 2,
      },
      {
        question: "What is the value of 5! (5 factorial)?",
        options: ["60", "100", "120", "150"],
        answer: 2,
      },
      {
        question: "If a = 3 and b = 4, what is a² + b²?",
        options: ["12", "25", "49", "7"],
        answer: 1,
      },
    ],
    hard: [
      {
        question: "What is the derivative of x³?",
        options: ["x²", "2x²", "3x²", "3x"],
        answer: 2,
      },
      {
        question: "What is the integral of 2x?",
        options: ["x²", "x² + C", "2x²", "2x² + C"],
        answer: 1,
      },
      {
        question: "What is log₁₀(1000)?",
        options: ["2", "3", "4", "10"],
        answer: 1,
      },
      {
        question: "What is the value of sin(90°)?",
        options: ["0", "0.5", "1", "-1"],
        answer: 2,
      },
      {
        question: "What is the quadratic formula?",
        options: [
          "(-b ± √(b²-4ac))/2a",
          "(-b ± √(b²+4ac))/2a",
          "(b ± √(b²-4ac))/2a",
          "(-b ± √(4ac-b²))/2a",
        ],
        answer: 0,
      },
      {
        question:
          "What is the sum of the infinite geometric series 1 + 1/2 + 1/4 + 1/8 + ...?",
        options: ["1", "1.5", "2", "∞"],
        answer: 2,
      },
      {
        question: "What is i² (where i is imaginary unit)?",
        options: ["1", "-1", "i", "-i"],
        answer: 1,
      },
      {
        question: "What is the determinant of a 2x2 matrix [[a,b],[c,d]]?",
        options: ["ad + bc", "ad - bc", "ac - bd", "ac + bd"],
        answer: 1,
      },
      {
        question: "What is the Pythagorean theorem?",
        options: ["a² + b² = c²", "a + b = c", "a² - b² = c²", "a² × b² = c²"],
        answer: 0,
      },
      {
        question: "What is the golden ratio approximately equal to?",
        options: ["1.414", "1.618", "2.718", "3.142"],
        answer: 1,
      },
    ],
  },
};

// ==================== DOM ELEMENTS ====================
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const reviewScreen = document.getElementById("review-screen");

// Start screen elements
const categoryBtns = document.querySelectorAll(".category-btn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const countBtns = document.querySelectorAll(".count-btn");
const timerBtns = document.querySelectorAll(".timer-btn");
const startBtn = document.getElementById("start-btn");

// Quiz screen elements
const currentCategoryEl = document.getElementById("current-category");
const currentDifficultyEl = document.getElementById("current-difficulty");
const progressFill = document.getElementById("progress-fill");
const currentNumEl = document.getElementById("current-num");
const totalNumEl = document.getElementById("total-num");
const currentScoreEl = document.getElementById("current-score");
const timerContainer = document.getElementById("timer-container");
const timerFill = document.getElementById("timer-fill");
const timerText = document.getElementById("timer-text");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const skipBtn = document.getElementById("skip-btn");
const nextBtn = document.getElementById("next-btn");
const quitBtn = document.getElementById("quit-btn");
const hintContainer = document.getElementById("hint-container");
const hintBtn = document.getElementById("hint-btn");

// Result screen elements
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultSubtitle = document.getElementById("result-subtitle");
const scoreCircle = document.getElementById("score-circle");
const finalScore = document.getElementById("final-score");
const finalTotal = document.getElementById("final-total");
const scorePercentage = document.getElementById("score-percentage");
const correctCount = document.getElementById("correct-count");
const wrongCount = document.getElementById("wrong-count");
const skippedCount = document.getElementById("skipped-count");
const timeTaken = document.getElementById("time-taken");
const retryBtn = document.getElementById("retry-btn");
const homeBtn = document.getElementById("home-btn");
const reviewBtn = document.getElementById("review-btn");

// Review screen elements
const reviewList = document.getElementById("review-list");
const closeReviewBtn = document.getElementById("close-review");
const backResultsBtn = document.getElementById("back-results-btn");

// Stats elements
const bestScoreEl = document.getElementById("best-score");
const gamesPlayedEl = document.getElementById("games-played");
const avgScoreEl = document.getElementById("avg-score");

// Share buttons
const shareTwitterBtn = document.getElementById("share-twitter");
const shareWhatsappBtn = document.getElementById("share-whatsapp");
const shareFacebookBtn = document.getElementById("share-facebook");
const shareCopyBtn = document.getElementById("share-copy");

// Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// Confetti
const confettiCanvas = document.getElementById("confetti-canvas");

// ==================== GAME STATE ====================
let selectedCategory = "web";
let selectedDifficulty = "medium";
let selectedCount = 10;
let selectedTime = 30;

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let skipped = 0;
let answers = [];
let selectedAnswer = null;
let isAnswered = false;
let hintUsed = false;

let timerInterval = null;
let timeLeft = 0;
let startTime = null;
let totalTime = 0;

let stats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
};

// ==================== INITIALIZATION ====================
function init() {
  loadStats();
  updateStatsDisplay();
  setupEventListeners();
}

function setupEventListeners() {
  // Category selection
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
    });
  });

  // Difficulty selection
  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      difficultyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDifficulty = btn.dataset.difficulty;
    });
  });

  // Question count selection
  countBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      countBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCount = parseInt(btn.dataset.count) || 20;
    });
  });

  // Timer selection
  timerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      timerBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTime = parseInt(btn.dataset.time);
    });
  });

  // Start button
  if (startBtn) {
    startBtn.addEventListener("click", startQuiz);
  }

  // Quiz buttons
  if (nextBtn) nextBtn.addEventListener("click", handleNext);
  if (skipBtn) skipBtn.addEventListener("click", handleSkip);
  if (quitBtn) quitBtn.addEventListener("click", quitQuiz);
  if (hintBtn) hintBtn.addEventListener("click", useHint);

  // Result buttons
  if (retryBtn) retryBtn.addEventListener("click", startQuiz);
  if (homeBtn) homeBtn.addEventListener("click", goHome);
  if (reviewBtn) reviewBtn.addEventListener("click", showReview);

  // Review buttons
  if (closeReviewBtn) closeReviewBtn.addEventListener("click", hideReview);
  if (backResultsBtn) backResultsBtn.addEventListener("click", hideReview);

  // Share buttons
  if (shareTwitterBtn) shareTwitterBtn.addEventListener("click", shareTwitter);
  if (shareWhatsappBtn)
    shareWhatsappBtn.addEventListener("click", shareWhatsApp);
  if (shareFacebookBtn)
    shareFacebookBtn.addEventListener("click", shareFacebook);
  if (shareCopyBtn) shareCopyBtn.addEventListener("click", copyLink);
}

// ==================== QUIZ FUNCTIONS ====================
function startQuiz() {
  // Reset state
  currentQuestionIndex = 0;
  score = 0;
  skipped = 0;
  answers = [];
  selectedAnswer = null;
  isAnswered = false;
  hintUsed = false;
  startTime = Date.now();

  // Get questions for selected category and difficulty
  const categoryQuestions = questionsDB[selectedCategory][selectedDifficulty];

  // Shuffle and select questions
  questions = shuffleArray([...categoryQuestions]).slice(0, selectedCount);

  // Update UI
  updateQuizHeader();
  totalNumEl.textContent = questions.length;
  currentScoreEl.textContent = "0";

  // Show/hide timer
  if (selectedTime > 0) {
    timerContainer.classList.remove("hidden");
  } else {
    timerContainer.classList.add("hidden");
  }

  // Show/hide hint for easy mode
  if (selectedDifficulty === "easy") {
    hintContainer.classList.remove("hidden");
  } else {
    hintContainer.classList.add("hidden");
  }

  // Switch screens
  hideAllScreens();
  quizScreen.classList.remove("hidden");

  // Load first question
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestionIndex];

  // Reset state for new question
  selectedAnswer = null;
  isAnswered = false;
  hintUsed = false;
  nextBtn.disabled = true;

  // Update progress
  const progress = (currentQuestionIndex / questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  currentNumEl.textContent = currentQuestionIndex + 1;
  questionNumber.textContent = `Q${currentQuestionIndex + 1}`;

  // Update question text
  questionText.textContent = question.question;

  // Create options
  optionsContainer.innerHTML = "";
  const letters = ["A", "B", "C", "D"];

  question.options.forEach((option, index) => {
    const optionEl = document.createElement("div");
    optionEl.className = "option";
    optionEl.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
        `;
    optionEl.addEventListener("click", () => selectOption(index, optionEl));
    optionsContainer.appendChild(optionEl);
  });

  // Reset hint button
  if (hintBtn) {
    hintBtn.disabled = false;
  }

  // Start timer
  if (selectedTime > 0) {
    startTimer();
  }
}

function selectOption(index, element) {
  if (isAnswered) return;

  // Remove previous selection
  document.querySelectorAll(".option").forEach((opt) => {
    opt.classList.remove("selected");
  });

  // Add selection
  element.classList.add("selected");
  selectedAnswer = index;
  nextBtn.disabled = false;
}

function handleNext() {
  if (selectedAnswer === null || isAnswered) return;

  // Prevent multiple clicks
  isAnswered = true;
  stopTimer();

  const question = questions[currentQuestionIndex];
  const correct = question.answer;
  const options = document.querySelectorAll(".option");

  // Disable all options
  options.forEach((opt) => opt.classList.add("disabled"));

  // Show correct/wrong
  options.forEach((opt, index) => {
    if (index === correct) {
      opt.classList.add("correct");
    } else if (index === selectedAnswer && selectedAnswer !== correct) {
      opt.classList.add("wrong");
    }
  });

  // Update score
  if (selectedAnswer === correct) {
    score++;
    currentScoreEl.textContent = score;
  }

  // Store answer
  answers.push({
    question: question.question,
    options: question.options,
    correct: correct,
    selected: selectedAnswer,
    isCorrect: selectedAnswer === correct,
  });

  // Move to next question after delay
  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 1200);
}

function handleSkip() {
  if (isAnswered) return;

  isAnswered = true;
  stopTimer();
  skipped++;

  const question = questions[currentQuestionIndex];

  // Store as skipped
  answers.push({
    question: question.question,
    options: question.options,
    correct: question.answer,
    selected: -1,
    isCorrect: false,
    skipped: true,
  });

  // Show correct answer
  const options = document.querySelectorAll(".option");
  options.forEach((opt, index) => {
    opt.classList.add("disabled");
    if (index === question.answer) {
      opt.classList.add("correct");
    }
  });

  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 1000);
}

function useHint() {
  if (hintUsed || isAnswered) return;

  hintUsed = true;
  hintBtn.disabled = true;

  const question = questions[currentQuestionIndex];
  const correctAnswer = question.answer;
  const options = document.querySelectorAll(".option");

  // Get wrong answer indices
  let wrongIndices = [];
  for (let i = 0; i < 4; i++) {
    if (i !== correctAnswer) {
      wrongIndices.push(i);
    }
  }

  // Randomly select 2 wrong answers to remove
  shuffleArray(wrongIndices);
  const toRemove = wrongIndices.slice(0, 2);

  toRemove.forEach((index) => {
    options[index].classList.add("hint-removed");
  });
}

function startTimer() {
  timeLeft = selectedTime;

  // Immediately set timer bar to full without transition
  timerFill.style.transition = 'none';
  timerFill.style.width = '100%';
  setTimeout(() => {
    timerFill.style.transition = '';
  }, 0);

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      stopTimer();
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const percentage = (timeLeft / selectedTime) * 100;
  timerFill.style.width = `${percentage}%`;
  timerText.textContent = `${timeLeft}s`;

  // Update color based on time
  timerFill.classList.remove("warning", "danger");
  if (percentage <= 30) {
    timerFill.classList.add("danger");
  } else if (percentage <= 50) {
    timerFill.classList.add("warning");
  }
}

function handleTimeUp() {
  if (isAnswered) return;

  isAnswered = true;

  const question = questions[currentQuestionIndex];

  // Store as wrong/skipped
  answers.push({
    question: question.question,
    options: question.options,
    correct: question.answer,
    selected: selectedAnswer !== null ? selectedAnswer : -1,
    isCorrect: false,
    timedOut: true,
  });

  // Show correct answer
  const options = document.querySelectorAll(".option");
  options.forEach((opt, index) => {
    opt.classList.add("disabled");
    if (index === question.answer) {
      opt.classList.add("correct");
    }
    if (
      selectedAnswer !== null &&
      index === selectedAnswer &&
      selectedAnswer !== question.answer
    ) {
      opt.classList.add("wrong");
    }
  });

  showToast("Time's up!");

  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 1500);
}

function endQuiz() {
  stopTimer();
  totalTime = Math.floor((Date.now() - startTime) / 1000);

  // Update stats
  stats.gamesPlayed++;
  stats.totalScore += score;
  if (score > stats.bestScore) {
    stats.bestScore = score;
  }
  saveStats();

  // Show results
  showResults();
}

function showResults() {
  hideAllScreens();
  resultScreen.classList.remove("hidden");

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const wrong = total - score - skipped;

  // Update result display
  finalScore.textContent = score;
  finalTotal.textContent = total;
  scorePercentage.textContent = `${percentage}%`;
  correctCount.textContent = score;
  wrongCount.textContent = wrong;
  skippedCount.textContent = skipped;

  // Format time
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  timeTaken.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Animate score circle
  setTimeout(() => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
  }, 100);

  // Set result styling based on score
  resultIcon.className = "result-icon";
  if (percentage >= 80) {
    resultIcon.classList.add("excellent");
    resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
    resultTitle.textContent = "Excellent!";
    resultSubtitle.textContent = "Outstanding performance!";
    scoreCircle.style.stroke = "#10b981";
    scorePercentage.style.color = "#10b981";
    startCelebration();
  } else if (percentage >= 60) {
    resultIcon.classList.add("good");
    resultIcon.innerHTML = '<i class="fas fa-medal"></i>';
    resultTitle.textContent = "Good Job!";
    resultSubtitle.textContent = "Well done!";
    scoreCircle.style.stroke = "#10b981";
    scorePercentage.style.color = "#10b981";
  } else if (percentage >= 40) {
    resultIcon.classList.add("average");
    resultIcon.innerHTML = '<i class="fas fa-star-half-alt"></i>';
    resultTitle.textContent = "Not Bad!";
    resultSubtitle.textContent = "Keep practicing!";
    scoreCircle.style.stroke = "#f59e0b";
    scorePercentage.style.color = "#f59e0b";
  } else {
    resultIcon.classList.add("poor");
    resultIcon.innerHTML = '<i class="fas fa-book"></i>';
    resultTitle.textContent = "Keep Learning!";
    resultSubtitle.textContent = "Practice makes perfect!";
    scoreCircle.style.stroke = "#ef4444";
    scorePercentage.style.color = "#ef4444";
  }
}

function showReview() {
  resultScreen.classList.add("hidden");
  reviewScreen.classList.remove("hidden");

  reviewList.innerHTML = "";

  answers.forEach((answer, index) => {
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";

    if (answer.skipped || answer.timedOut) {
      reviewItem.classList.add("skipped");
    } else if (answer.isCorrect) {
      reviewItem.classList.add("correct");
    } else {
      reviewItem.classList.add("wrong");
    }

    let answerHtml = "";
    if (answer.skipped) {
      answerHtml = `
                <span class="your-answer">Skipped</span><br>
                Correct: <span class="correct-answer">${
                  answer.options[answer.correct]
                }</span>
            `;
    } else if (answer.timedOut && answer.selected === -1) {
      answerHtml = `
                <span class="your-answer">Time's up!</span><br>
                Correct: <span class="correct-answer">${
                  answer.options[answer.correct]
                }</span>
            `;
    } else if (answer.isCorrect) {
      answerHtml = `<span class="correct-answer">✓ ${
        answer.options[answer.correct]
      }</span>`;
    } else {
      answerHtml = `
                Your answer: <span class="your-answer">${
                  answer.options[answer.selected]
                }</span><br>
                Correct: <span class="correct-answer">${
                  answer.options[answer.correct]
                }</span>
            `;
    }

    reviewItem.innerHTML = `
            <div class="review-question">Q${index + 1}. ${answer.question}</div>
            <div class="review-answer">${answerHtml}</div>
        `;

    reviewList.appendChild(reviewItem);
  });
}

function hideReview() {
  reviewScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

function quitQuiz() {
  if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
    stopTimer();
    goHome();
  }
}

function goHome() {
  stopTimer();
  stopCelebration();
  hideAllScreens();
  startScreen.classList.remove("hidden");
  updateStatsDisplay();
}

function updateQuizHeader() {
  const categoryNames = {
    web: '<i class="fas fa-code"></i> Web Dev',
    science: '<i class="fas fa-flask"></i> Science',
    general: '<i class="fas fa-globe"></i> General',
    math: '<i class="fas fa-calculator"></i> Math',
  };

  currentCategoryEl.innerHTML = categoryNames[selectedCategory];
  currentDifficultyEl.textContent =
    selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
  currentDifficultyEl.className = "difficulty-badge " + selectedDifficulty;
}

// ==================== UTILITY FUNCTIONS ====================
function hideAllScreens() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  reviewScreen.classList.add("hidden");
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function loadStats() {
  try {
    const saved = localStorage.getItem("quizGameStats");
    if (saved) {
      stats = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not load stats");
  }
}

function saveStats() {
  try {
    localStorage.setItem("quizGameStats", JSON.stringify(stats));
  } catch (e) {
    console.warn("Could not save stats");
  }
}

function updateStatsDisplay() {
  if (bestScoreEl) bestScoreEl.textContent = stats.bestScore;
  if (gamesPlayedEl) gamesPlayedEl.textContent = stats.gamesPlayed;
  if (avgScoreEl) {
    const avg =
      stats.gamesPlayed > 0
        ? Math.round((stats.totalScore / stats.gamesPlayed) * 10)
        : 0;
    avgScoreEl.textContent = avg + "%";
  }
}

function showToast(message) {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ==================== SHARE FUNCTIONS ====================
function getShareText() {
  const percentage = Math.round((score / questions.length) * 100);
  return `🎯 I scored ${score}/${questions.length} (${percentage}%) on the ${selectedDifficulty} ${selectedCategory} quiz! Can you beat my score?`;
}

function shareTwitter() {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(window.location.href);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    "_blank"
  );
}

function shareWhatsApp() {
  const text = encodeURIComponent(`${getShareText()} ${window.location.href}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

function shareFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
}

function copyLink() {
  const text = `${getShareText()} ${window.location.href}`;
  navigator.clipboard
    .writeText(text)
    .then(() => showToast("Link copied!"))
    .catch(() => showToast("Failed to copy"));
}

// ==================== CONFETTI ====================
let confettiParticles = [];
let animationId = null;

function startCelebration() {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext("2d");
  if (!ctx) return;

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
  ];

  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.2 - 0.1,
      oscillation: Math.random() * 0.5,
    });
  }

  animateConfetti(ctx);
}

function animateConfetti(ctx) {
  if (!confettiCanvas) return;

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((particle) => {
    particle.y += particle.speed;
    particle.x += Math.sin(particle.angle) * particle.oscillation;
    particle.angle += particle.rotation;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      -particle.size / 2,
      -particle.size / 2,
      particle.size,
      particle.size / 2
    );
    ctx.restore();

    if (particle.y > confettiCanvas.height) {
      particle.y = -20;
      particle.x = Math.random() * confettiCanvas.width;
    }
  });

  animationId = requestAnimationFrame(() => animateConfetti(ctx));
}

function stopCelebration() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  confettiParticles = [];
  if (confettiCanvas) {
    const ctx = confettiCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
}

// Handle resize
window.addEventListener("resize", () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// Initialize
init();
