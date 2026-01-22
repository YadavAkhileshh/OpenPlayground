    // Application State
        const state = {
            currentFallacyId: null,
            visitedFallacies: new Set(),
            quiz: {
                currentQuestionIndex: 0,
                score: 0,
                totalQuestions: 5,
                questionsAttempted: 0,
                userAnswers: [],
                isQuizCompleted: false
            }
        };

        // Fallacy Data
        const fallacies = [
            {
                id: 1,
                name: "Straw Man",
                explanation: "Misrepresenting someone's argument to make it easier to attack.",
                example: "Person A: We should consider raising the minimum wage to help low-income workers. Person B: So you want to destroy small businesses and cause massive unemployment? That's a terrible idea!",
                misleading: "This is misleading because Person B has exaggerated and distorted Person A's position into an extreme version that is easier to criticize, rather than addressing the actual proposal.",
                category: "Informal"
            },
            {
                id: 2,
                name: "Ad Hominem",
                explanation: "Attacking the person making the argument rather than the argument itself.",
                example: "You can't trust John's opinion on climate change because he's not a scientist and he failed high school chemistry.",
                misleading: "This diverts attention from the actual evidence and arguments about climate change by focusing on the person's credentials or character instead.",
                category: "Informal"
            },
            {
                id: 3,
                name: "False Dilemma",
                explanation: "Presenting only two options when more exist.",
                example: "Either we cut all government spending or we'll go bankrupt. There's no other choice.",
                misleading: "This oversimplifies complex issues by ignoring other possible solutions, like raising revenue or prioritizing certain expenditures over others.",
                category: "Informal"
            },
            {
                id: 4,
                name: "Slippery Slope",
                explanation: "Arguing that a relatively small first step will lead to a chain of related events culminating in a significant effect.",
                example: "If we allow same-sex marriage, next people will want to marry animals, and then children. We must stop this now!",
                misleading: "This assumes a chain reaction will occur without providing evidence for each step in the chain, often exaggerating consequences.",
                category: "Informal"
            },
            {
                id: 5,
                name: "Appeal to Authority",
                explanation: "Using an authority figure's opinion as evidence when they are not an expert in the relevant field.",
                example: "Dr. Smith, a famous heart surgeon, says this new economic policy is definitely going to work. So we should all support it.",
                misleading: "Being an expert in one field doesn't make someone an expert in all fields. The argument lacks actual evidence about the policy's merits.",
                category: "Informal"
            },
            {
                id: 6,
                name: "Hasty Generalization",
                explanation: "Making a broad claim based on insufficient or unrepresentative evidence.",
                example: "I met two people from France and they were both rude. Therefore, all French people are rude.",
                misleading: "This draws a conclusion about an entire population from a sample that is too small and potentially unrepresentative.",
                category: "Informal"
            },
            {
                id: 7,
                name: "Post Hoc Ergo Propter Hoc",
                explanation: "Assuming that because one event followed another, the first caused the second.",
                example: "I wore my lucky socks and then aced the exam. Therefore, my lucky socks caused me to ace the exam.",
                misleading: "Correlation does not imply causation. The two events happening in sequence doesn't prove one caused the other.",
                category: "Formal"
            },
            {
                id: 8,
                name: "Appeal to Emotion",
                explanation: "Using emotional manipulation rather than valid logic to win an argument.",
                example: "Think of all the starving children! If you don't support this policy, you clearly don't care about hungry kids.",
                misleading: "This attempts to bypass rational evaluation by appealing to emotions like pity, fear, or anger instead of addressing the merits of the argument.",
                category: "Informal"
            }
        ];

        // Quiz Questions Data
        const quizQuestions = [
            {
                id: 1,
                scenario: "After the city implemented the new recycling program, the crime rate went down by 5%. The mayor claims this proves that recycling reduces crime.",
                correctFallacyId: 7, // Post Hoc
                options: [7, 1, 3, 6]
            },
            {
                id: 2,
                scenario: "My opponent wants to raise taxes. What he really wants is to take away your hard-earned money and give it to lazy people who don't want to work.",
                correctFallacyId: 1, // Straw Man
                options: [1, 2, 4, 8]
            },
            {
                id: 3,
                scenario: "We interviewed three customers who bought our product, and all three said it changed their lives. Therefore, our product will change your life too!",
                correctFallacyId: 6, // Hasty Generalization
                options: [6, 5, 7, 3]
            },
            {
                id: 4,
                scenario: "Either we ban all guns immediately, or we accept that school shootings will continue forever. There's no middle ground.",
                correctFallacyId: 3, // False Dilemma
                options: [3, 4, 1, 2]
            },
            {
                id: 5,
                scenario: "If we allow students to question the teacher's authority, next they'll be running the classroom, and soon there will be complete anarchy in our schools.",
                correctFallacyId: 4, // Slippery Slope
                options: [4, 3, 7, 8]
            }
        ];

        // DOM Elements
        const fallacyListEl = document.getElementById('fallacyList');
        const detailViewEl = document.getElementById('detailView');
        const backButtonEl = document.getElementById('backButton');
        const detailTitleEl = document.getElementById('detailTitle');
        const detailDescriptionEl = document.getElementById('detailDescription');
        const detailExampleEl = document.getElementById('detailExample');
        const detailMisleadingEl = document.getElementById('detailMisleading');
        
        const questionTextEl = document.getElementById('questionText');
        const optionsContainerEl = document.getElementById('optionsContainer');
        const feedbackContainerEl = document.getElementById('feedbackContainer');
        const feedbackTextEl = document.getElementById('feedbackText');
        const nextButtonEl = document.getElementById('nextQuestion');
        const restartButtonEl = document.getElementById('restartQuiz');
        const scoreValueEl = document.getElementById('scoreValue');
        const totalQuestionsEl = document.getElementById('totalQuestions');
        const progressFillEl = document.getElementById('progressFill');
        const performanceFeedbackEl = document.getElementById('performanceFeedback');

        // Initialize the application
        function init() {
            renderFallacyList();
            setupEventListeners();
            loadQuizQuestion(0);
            updateQuizDisplay();
            
            // Show the first fallacy by default
            if (fallacies.length > 0) {
                showFallacyDetails(fallacies[0].id);
            }
        }

        // Render the list of fallacies
        function renderFallacyList() {
            fallacyListEl.innerHTML = '';
            
            fallacies.forEach(fallacy => {
                const fallacyItem = document.createElement('div');
                fallacyItem.className = `fallacy-item ${state.currentFallacyId === fallacy.id ? 'active' : ''}`;
                fallacyItem.dataset.id = fallacy.id;
                
                const isVisited = state.visitedFallacies.has(fallacy.id);
                
                fallacyItem.innerHTML = `
                    <div class="fallacy-name">
                        <span>${fallacy.name}</span>
                        ${isVisited ? '<div class="visited-badge"><i class="fas fa-check"></i></div>' : ''}
                    </div>
                    <div class="fallacy-explanation">${fallacy.explanation}</div>
                `;
                
                fallacyItem.addEventListener('click', () => showFallacyDetails(fallacy.id));
                fallacyListEl.appendChild(fallacyItem);
            });
        }

        // Show detailed view of a specific fallacy
        function showFallacyDetails(fallacyId) {
            const fallacy = fallacies.find(f => f.id === fallacyId);
            if (!fallacy) return;
            
            // Update state
            state.currentFallacyId = fallacyId;
            state.visitedFallacies.add(fallacyId);
            
            // Update UI
            detailViewEl.classList.add('active');
            detailTitleEl.textContent = fallacy.name;
            detailDescriptionEl.textContent = fallacy.explanation;
            
            detailExampleEl.innerHTML = `
                <h3><i class="fas fa-lightbulb"></i> Example</h3>
                <p>${fallacy.example}</p>
            `;
            
            detailMisleadingEl.innerHTML = `
                <h3><i class="fas fa-exclamation-triangle"></i> Why It's Misleading</h3>
                <p>${fallacy.misleading}</p>
            `;
            
            // Update the list to show active item
            renderFallacyList();
        }

        // Load a specific quiz question
        function loadQuizQuestion(questionIndex) {
            if (questionIndex >= quizQuestions.length) {
                completeQuiz();
                return;
            }
            
            const question = quizQuestions[questionIndex];
            const fallacy = fallacies.find(f => f.id === question.correctFallacyId);
            
            // Update question text
            questionTextEl.textContent = question.scenario;
            
            // Clear previous options
            optionsContainerEl.innerHTML = '';
            feedbackContainerEl.classList.remove('show');
            nextButtonEl.disabled = true;
            
            // Create options
            question.options.forEach(fallacyId => {
                const fallacyOption = fallacies.find(f => f.id === fallacyId);
                if (!fallacyOption) return;
                
                const optionEl = document.createElement('div');
                optionEl.className = 'option';
                optionEl.dataset.id = fallacyId;
                optionEl.textContent = fallacyOption.name;
                
                optionEl.addEventListener('click', () => selectAnswer(fallacyId, question.correctFallacyId));
                optionsContainerEl.appendChild(optionEl);
            });
            
            // Update progress
            updateProgressBar();
        }

        // Handle answer selection
        function selectAnswer(selectedId, correctId) {
            // Disable all options
            const options = document.querySelectorAll('.option');
            options.forEach(option => {
                option.classList.add('disabled');
                option.removeEventListener('click', () => {});
            });
            
            // Mark selected and correct answers
            const selectedOption = document.querySelector(`.option[data-id="${selectedId}"]`);
            const correctOption = document.querySelector(`.option[data-id="${correctId}"]`);
            
            selectedOption.classList.add('selected');
            
            // Check if answer is correct
            const isCorrect = selectedId === correctId;
            
            if (isCorrect) {
                selectedOption.classList.add('correct');
                state.quiz.score++;
                feedbackTextEl.textContent = "Correct! " + fallacies.find(f => f.id === correctId).misleading;
                feedbackContainerEl.className = "feedback-container show feedback-correct";
            } else {
                selectedOption.classList.add('incorrect');
                correctOption.classList.add('correct');
                feedbackTextEl.textContent = `Incorrect. The correct fallacy is "${fallacies.find(f => f.id === correctId).name}". ${fallacies.find(f => f.id === correctId).misleading}`;
                feedbackContainerEl.className = "feedback-container show feedback-incorrect";
            }
            
            // Update state
            state.quiz.questionsAttempted++;
            state.quiz.userAnswers.push({
                questionId: state.quiz.currentQuestionIndex,
                selectedId,
                correctId,
                isCorrect
            });
            
            // Enable next button
            nextButtonEl.disabled = false;
            
            // Update score display
            updateQuizDisplay();
        }

        // Move to the next question
        function nextQuestion() {
            state.quiz.currentQuestionIndex++;
            loadQuizQuestion(state.quiz.currentQuestionIndex);
        }

        // Restart the quiz
        function restartQuiz() {
            state.quiz.currentQuestionIndex = 0;
            state.quiz.score = 0;
            state.quiz.questionsAttempted = 0;
            state.quiz.userAnswers = [];
            state.quiz.isQuizCompleted = false;
            
            loadQuizQuestion(0);
            updateQuizDisplay();
            performanceFeedbackEl.classList.remove('show');
        }

        // Complete the quiz and show results
        function completeQuiz() {
            state.quiz.isQuizCompleted = true;
            
            // Hide quiz elements
            questionTextEl.textContent = "Quiz Complete!";
            optionsContainerEl.innerHTML = '';
            feedbackContainerEl.classList.remove('show');
            nextButtonEl.disabled = true;
            
            // Calculate performance
            const percentage = (state.quiz.score / state.quiz.totalQuestions) * 100;
            let feedbackText = '';
            let feedbackClass = '';
            
            if (percentage >= 80) {
                feedbackText = `Excellent! You scored ${state.quiz.score}/${state.quiz.totalQuestions}. You have a strong understanding of logical fallacies!`;
                feedbackClass = 'excellent';
            } else if (percentage >= 60) {
                feedbackText = `Good job! You scored ${state.quiz.score}/${state.quiz.totalQuestions}. You understand most fallacies but could use some more practice.`;
                feedbackClass = 'good';
            } else {
                feedbackText = `You scored ${state.quiz.score}/${state.quiz.totalQuestions}. Keep practicing to improve your ability to spot logical fallacies!`;
                feedbackClass = 'needs-improvement';
            }
            
            performanceFeedbackEl.textContent = feedbackText;
            performanceFeedbackEl.className = `performance-feedback show ${feedbackClass}`;
        }

        // Update quiz display elements
        function updateQuizDisplay() {
            scoreValueEl.textContent = state.quiz.score;
            totalQuestionsEl.textContent = state.quiz.totalQuestions;
            updateProgressBar();
        }

        // Update the progress bar
        function updateProgressBar() {
            const progress = ((state.quiz.currentQuestionIndex) / state.quiz.totalQuestions) * 100;
            progressFillEl.style.width = `${progress}%`;
        }

        // Set up event listeners
        function setupEventListeners() {
            backButtonEl.addEventListener('click', () => {
                detailViewEl.classList.remove('active');
            });
            
            nextButtonEl.addEventListener('click', nextQuestion);
            restartButtonEl.addEventListener('click', restartQuiz);
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);