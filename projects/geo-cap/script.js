        (function() {
            // ---------- CAPITAL CITY DATASET ----------
            const capitals = [
                { country: "France", capital: "Paris", continent: "europe" },
                { country: "Germany", capital: "Berlin", continent: "europe" },
                { country: "Italy", capital: "Rome", continent: "europe" },
                { country: "Spain", capital: "Madrid", continent: "europe" },
                { country: "United Kingdom", capital: "London", continent: "europe" },
                { country: "Japan", capital: "Tokyo", continent: "asia" },
                { country: "China", capital: "Beijing", continent: "asia" },
                { country: "India", capital: "New Delhi", continent: "asia" },
                { country: "Thailand", capital: "Bangkok", continent: "asia" },
                { country: "South Korea", capital: "Seoul", continent: "asia" },
                { country: "Egypt", capital: "Cairo", continent: "africa" },
                { country: "South Africa", capital: "Pretoria", continent: "africa" }, // administrative
                { country: "Nigeria", capital: "Abuja", continent: "africa" },
                { country: "Kenya", capital: "Nairobi", continent: "africa" },
                { country: "Morocco", capital: "Rabat", continent: "africa" },
                { country: "United States", capital: "Washington, D.C.", continent: "americas" },
                { country: "Canada", capital: "Ottawa", continent: "americas" },
                { country: "Brazil", capital: "Brasília", continent: "americas" },
                { country: "Argentina", capital: "Buenos Aires", continent: "americas" },
                { country: "Mexico", capital: "Mexico City", continent: "americas" },
                { country: "Australia", capital: "Canberra", continent: "oceania" },
                { country: "New Zealand", capital: "Wellington", continent: "oceania" },
                { country: "Fiji", capital: "Suva", continent: "oceania" },
                { country: "Papua New Guinea", capital: "Port Moresby", continent: "oceania" }
            ];

            // ----- DOM elements -----
            const continentBtns = document.querySelectorAll('.continent-btn');
            const countryDisplay = document.getElementById('countryDisplay');
            const optionsContainer = document.getElementById('optionsContainer');
            const feedbackEl = document.getElementById('feedbackMessage');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const questionCounter = document.getElementById('questionCounter');
            const regionTag = document.getElementById('regionTag');
            const nextBtn = document.getElementById('nextBtn');
            const resetBtn = document.getElementById('resetBtn');
            const remainingSpan = document.getElementById('remainingSpan');
            const correctSpan = document.getElementById('correctSpan');

            // ----- state -----
            let currentContinent = 'all';
            let questionList = [];        // list of { country, capital, continent } for current quiz
            let currentIndex = 0;
            let userAnswers = [];          // selected capital index (0-3) per question, -1 = unanswered
            let optionsPerQuestion = [];    // array of arrays: 4 city names per question

            // ----- helper: shuffle array (Fisher–Yates)
            function shuffleArray(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // ----- build question list: filter by continent, shuffle, pick up to 5 -----
            function buildQuestionList(continent) {
                let filtered = continent === 'all' 
                    ? [...capitals] 
                    : capitals.filter(c => c.continent === continent);
                if (filtered.length === 0) return [];
                filtered = shuffleArray(filtered);
                return filtered.slice(0, 5); // max 5 questions
            }

            // ----- generate 4 options for a given correct capital (1 correct + 3 random others, shuffled) -----
            function generateOptions(correctCapital, excludeCountry, allCapitalsPool) {
                // pool of all capitals (string) except the correct one from the same country? we need other capital names
                const otherCapitals = allCapitalsPool
                    .filter(item => item.capital !== correctCapital) // exclude exact same capital
                    .map(item => item.capital);
                // remove duplicates by converting to Set and back
                const uniqueOthers = [...new Set(otherCapitals)];
                // take 3 random from uniqueOthers
                let distractors = [];
                if (uniqueOthers.length >= 3) {
                    const shuffled = shuffleArray([...uniqueOthers]);
                    distractors = shuffled.slice(0, 3);
                } else {
                    // fallback (should not happen)
                    distractors = ["London", "Tokyo", "Cairo"];
                }
                let opts = [correctCapital, ...distractors];
                return shuffleArray(opts);
            }

            // ----- reset quiz for current continent -----
            function resetQuiz() {
                questionList = buildQuestionList(currentContinent);
                currentIndex = 0;
                userAnswers = new Array(questionList.length).fill(-1);
                
                // pre-generate options for each question (to keep consistent during quiz)
                optionsPerQuestion = [];
                const allCapitalsList = capitals; // reference
                for (let i = 0; i < questionList.length; i++) {
                    const q = questionList[i];
                    const opts = generateOptions(q.capital, q.country, allCapitalsList);
                    optionsPerQuestion.push(opts);
                }

                renderQuestion();
                updateScoreAndCounters();
            }

            // ----- update score and footer -----
            function recalcScore() {
                let correctCount = 0;
                for (let i = 0; i < questionList.length; i++) {
                    if (userAnswers[i] === -1) continue;
                    const selectedCity = optionsPerQuestion[i][userAnswers[i]];
                    if (selectedCity === questionList[i].capital) correctCount++;
                }
                return correctCount;
            }

            function updateScoreAndCounters() {
                const correct = recalcScore();
                const total = questionList.length;
                scoreDisplay.textContent = `${correct}/${total}`;
                correctSpan.innerHTML = `✅ ${correct} correct`;
                const answered = userAnswers.filter(a => a !== -1).length;
                const left = total - answered;
                remainingSpan.textContent = `${left} remaining`;
            }

            // ----- render current question -----
            function renderQuestion() {
                if (!questionList.length) {
                    countryDisplay.innerHTML = `<span>🏳️</span> No countries in this region`;
                    optionsContainer.innerHTML = '';
                    feedbackEl.textContent = 'Try another continent filter.';
                    nextBtn.disabled = true;
                    regionTag.textContent = currentContinent;
                    questionCounter.textContent = `0/0`;
                    return;
                }

                const q = questionList[currentIndex];
                countryDisplay.innerHTML = `<span>🏳️</span> ${q.country}`;
                regionTag.textContent = q.continent;
                questionCounter.textContent = `question ${currentIndex+1} / ${questionList.length}`;

                const opts = optionsPerQuestion[currentIndex];
                const answered = userAnswers[currentIndex] !== -1;
                const selectedIdx = userAnswers[currentIndex];
                const correctCapital = q.capital;

                // build options html
                let htmlStr = '';
                opts.forEach((city, idx) => {
                    let extraClass = 'city-option';
                    if (answered) {
                        if (city === correctCapital) extraClass += ' correct-highlight';
                        if (idx === selectedIdx && city === correctCapital) extraClass += ' selected-correct';
                        else if (idx === selectedIdx && city !== correctCapital) extraClass += ' selected-wrong';
                    }
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    htmlStr += `
                        <div class="${extraClass}" data-opt-index="${idx}" data-city="${city}">
                            <span class="option-letter">${letter}</span>
                            <span>${city}</span>
                        </div>
                    `;
                });
                optionsContainer.innerHTML = htmlStr;

                // attach click listeners if not answered
                if (!answered) {
                    document.querySelectorAll('.city-option').forEach(opt => {
                        opt.addEventListener('click', optionClickHandler);
                    });
                    feedbackEl.textContent = '🗺️ select a capital';
                } else {
                    // show feedback
                    const isCorrect = (selectedIdx !== -1 && opts[selectedIdx] === correctCapital);
                    if (isCorrect) {
                        feedbackEl.innerHTML = `✅ correct! the capital of ${q.country} is ${correctCapital}.`;
                    } else {
                        feedbackEl.innerHTML = `❌ the capital of ${q.country} is ${correctCapital}.`;
                    }
                }

                // enable next (unless finished)
                nextBtn.disabled = (questionList.length === 0);
            }

            // ----- option click handler -----
            function optionClickHandler(e) {
                const row = e.currentTarget;
                const selectedIdx = parseInt(row.dataset.optIndex, 10);
                const q = questionList[currentIndex];
                const opts = optionsPerQuestion[currentIndex];

                // store answer
                userAnswers[currentIndex] = selectedIdx;

                // re-render to show correct/wrong
                renderQuestion();
                updateScoreAndCounters();
            }

            // ----- next question -----
            function goToNext() {
                if (questionList.length === 0) return;
                if (currentIndex < questionList.length - 1) {
                    currentIndex++;
                    renderQuestion();
                } else {
                    // end of quiz
                    const totalCorrect = recalcScore();
                    feedbackEl.innerHTML = `🏁 quiz complete! you got ${totalCorrect} out of ${questionList.length} correct. use "new game" to restart.`;
                    nextBtn.disabled = true;
                }
                updateScoreAndCounters();
            }

            // ----- change continent -----
            function setContinent(continent) {
                currentContinent = continent;
                continentBtns.forEach(btn => {
                    if (btn.dataset.continent === continent) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                resetQuiz(); // rebuild with new continent
            }

            // ----- event listeners -----
            continentBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    setContinent(btn.dataset.continent);
                });
            });

            nextBtn.addEventListener('click', goToNext);

            resetBtn.addEventListener('click', () => {
                setContinent(currentContinent); // same continent reshuffle
            });

            // initialize with 'all'
            setContinent('all');
        })();