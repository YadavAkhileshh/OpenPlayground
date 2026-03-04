
    (function() {
        // ---------- GAME CONFIG ----------
        const wordBank = [
            'react', 'vue', 'angular', 'python', 'java', 'rust', 'go', 'swift',
            'kotlin', 'php', 'html', 'css', 'javascript', 'typescript', 'svelte',
            'django', 'flask', 'spring', 'laravel', 'unity', 'unreal', 'linux',
            'windows', 'apple', 'google', 'meta', 'amazon', 'netflix', 'spotify',
            'keyboard', 'hero', 'falling', 'words', 'type', 'fast', 'score',
            'combo', 'streak', 'reactor', 'compile', 'debug', 'code', 'stack'
        ];

        // state
        let activeWords = [];               // { id, text, matched }
        let targetWord = '';                // current target to type
        let score = 0;
        let streak = 0;
        let gameActive = true;
        let nextId = 0;
        let fallInterval = null;
        let spawnInterval = null;
        let startTime = null;               // performance timer
        let timerInterval = null;

        // DOM elements
        const targetSpan = document.getElementById('targetWord');
        const wordFlowDiv = document.getElementById('wordFlow');
        const userInput = document.getElementById('userInput');
        const scoreSpan = document.getElementById('scoreDisplay');
        const streakSpan = document.getElementById('streakDisplay');
        const gameMessage = document.getElementById('gameMessage');
        const timerMsg = document.getElementById('timerMessage');
        const restartBtn = document.getElementById('restartBtn');

        // helper: random word from bank
        function randomWord() {
            return wordBank[Math.floor(Math.random() * wordBank.length)];
        }

        // set a new random target (different from current maybe)
        function setRandomTarget() {
            let newTarget = randomWord();
            // avoid same target if possible but not critical
            targetWord = newTarget;
            targetSpan.innerText = targetWord;
        }

        // spawn a new falling word
        function spawnWord() {
            if (!gameActive) return;
            const wordText = randomWord();
            const id = nextId++;
            activeWords.push({ id, text: wordText, matched: false });
            renderFlow();
        }

        // mark a word as matched (by id)
        function matchWord(id) {
            const word = activeWords.find(w => w.id === id);
            if (word && !word.matched) {
                word.matched = true;

                // increase score, streak
                score += 10 + (streak * 2);
                streak += 1;
                updateScore();

                // remove after short delay (visual feedback)
                setTimeout(() => {
                    activeWords = activeWords.filter(w => w.id !== id);
                    renderFlow();
                }, 150);
                renderFlow(); // immediate for matched style
            }
        }

        // update score displays
        function updateScore() {
            scoreSpan.innerText = score;
            streakSpan.innerText = streak;
        }

        // render all falling words in flow
        function renderFlow() {
            if (!gameActive) {
                wordFlowDiv.innerHTML = '<div class="falling-word" style="background:#342b3f;">⏸️ game paused</div>';
                return;
            }

            if (activeWords.length === 0) {
                wordFlowDiv.innerHTML = '<div style="color:#708090; padding:1rem;">✨ words will appear...</div>';
                return;
            }

            let html = '';
            activeWords.forEach(w => {
                const matchedClass = w.matched ? 'matched' : '';
                html += `<div class="falling-word ${matchedClass}" data-id="${w.id}">${w.text}</div>`;
            });
            wordFlowDiv.innerHTML = html;
        }

        // check input against active words (only exact match to target)
        function handleTyping(e) {
            if (!gameActive) return;
            const input = userInput.value.trim().toLowerCase();
            if (input === '') return;

            // look for an unmatched word that equals input AND equals current target
            // target must match input, and the word must match target (basically same)
            const index = activeWords.findIndex(w => !w.matched && w.text === input && w.text === targetWord);
            if (index !== -1) {
                // match found
                const matchedId = activeWords[index].id;
                matchWord(matchedId);
                userInput.value = '';    // clear input
                // set new target
                setRandomTarget();
            } else {
                // wrong input: reset streak, show message
                if (input.length > 0) {
                    streak = 0;
                    updateScore();
                    gameMessage.innerText = '❌ mismatch ... streak lost';
                    setTimeout(() => gameMessage.innerText = '✨ keep typing', 800);
                }
                userInput.value = ''; // clear for next try
            }
        }

        // restart / reset game fully
        function resetGame() {
            // clear intervals
            if (fallInterval) clearInterval(fallInterval);
            if (spawnInterval) clearInterval(spawnInterval);
            if (timerInterval) clearInterval(timerInterval);

            // reset state
            activeWords = [];
            score = 0;
            streak = 0;
            nextId = 0;
            gameActive = true;
            setRandomTarget();
            updateScore();
            userInput.value = '';
            gameMessage.innerText = '⚡ game restarted';
            renderFlow();

            // restart intervals
            spawnInterval = setInterval(() => {
                if (gameActive) spawnWord();
            }, 1500); // new word every 1.5 sec

            fallInterval = setInterval(() => {
                // remove oldest word if too many? optional: simulate fall removal (we remove after time)
                if (!gameActive) return;
                if (activeWords.length > 8) {
                    // remove first unmatched (oldest) as "missed"
                    const oldestUnmatched = activeWords.find(w => !w.matched);
                    if (oldestUnmatched) {
                        activeWords = activeWords.filter(w => w.id !== oldestUnmatched.id);
                        streak = 0;
                        updateScore();
                        gameMessage.innerText = '💔 word missed ...';
                        setTimeout(() => gameMessage.innerText = '⌨️ stay focused', 700);
                        renderFlow();
                    }
                }
                // also randomly remove some after long time? but we keep manageable
                // every 4 sec, remove a random unmatched if too many
                if (activeWords.length > 12) {
                    const unmatchedIndices = activeWords.reduce((acc, w, idx) => !w.matched ? acc.concat(idx) : acc, []);
                    if (unmatchedIndices.length > 0) {
                        const randIdx = unmatchedIndices[Math.floor(Math.random() * unmatchedIndices.length)];
                        activeWords.splice(randIdx, 1);
                        renderFlow();
                    }
                }
            }, 2000);

            // timer
            startTime = performance.now();
            timerInterval = setInterval(() => {
                if (!gameActive) return;
                const elapsed = (performance.now() - startTime) / 1000;
                timerMsg.innerText = `⏱️ ${elapsed.toFixed(1)}s`;
            }, 100);
        }

        // event listeners
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleTyping(e);
            }
        });

        // also handle input event for immediate check (optional)
        userInput.addEventListener('input', (e) => {
            // we only check on enter, but we can also check if we want instant? we stick to enter.
        });

        restartBtn.addEventListener('click', () => {
            resetGame();
        });

        // initial reset to start
        resetGame();

        // blur prevention: keep focus
        userInput.focus();
        document.addEventListener('click', () => userInput.focus());

        // pause if game inactive (but we keep running)
        window.addEventListener('load', () => userInput.focus());

        // make sure target appears from beginning
        setRandomTarget();
    })();
