    (function() {
        // ---------- COUNTRIES DATASET (flag + capital + name) ----------
        const countries = [
            { name: 'Japan', flag: '🇯🇵', capital: 'Tokyo' },
            { name: 'Brazil', flag: '🇧🇷', capital: 'Brasília' },
            { name: 'India', flag: '🇮🇳', capital: 'New Delhi' },
            { name: 'France', flag: '🇫🇷', capital: 'Paris' },
            { name: 'Germany', flag: '🇩🇪', capital: 'Berlin' },
            { name: 'Italy', flag: '🇮🇹', capital: 'Rome' },
            { name: 'Canada', flag: '🇨🇦', capital: 'Ottawa' },
            { name: 'Mexico', flag: '🇲🇽', capital: 'Mexico City' },
            { name: 'Australia', flag: '🇦🇺', capital: 'Canberra' },
            { name: 'Egypt', flag: '🇪🇬', capital: 'Cairo' },
            { name: 'South Africa', flag: '🇿🇦', capital: 'Pretoria' },
            { name: 'Argentina', flag: '🇦🇷', capital: 'Buenos Aires' },
            { name: 'China', flag: '🇨🇳', capital: 'Beijing' },
            { name: 'South Korea', flag: '🇰🇷', capital: 'Seoul' },
            { name: 'Thailand', flag: '🇹🇭', capital: 'Bangkok' },
            { name: 'Turkey', flag: '🇹🇷', capital: 'Ankara' },
            { name: 'Russia', flag: '🇷🇺', capital: 'Moscow' },
            { name: 'United Kingdom', flag: '🇬🇧', capital: 'London' },
            { name: 'Spain', flag: '🇪🇸', capital: 'Madrid' },
            { name: 'Portugal', flag: '🇵🇹', capital: 'Lisbon' },
            { name: 'Netherlands', flag: '🇳🇱', capital: 'Amsterdam' },
            { name: 'Greece', flag: '🇬🇷', capital: 'Athens' },
            { name: 'Sweden', flag: '🇸🇪', capital: 'Stockholm' },
            { name: 'Norway', flag: '🇳🇴', capital: 'Oslo' },
            { name: 'Finland', flag: '🇫🇮', capital: 'Helsinki' },
            { name: 'Iceland', flag: '🇮🇸', capital: 'Reykjavik' },
            { name: 'Ireland', flag: '🇮🇪', capital: 'Dublin' },
            { name: 'Belgium', flag: '🇧🇪', capital: 'Brussels' },
            { name: 'Switzerland', flag: '🇨🇭', capital: 'Bern' },
            { name: 'Austria', flag: '🇦🇹', capital: 'Vienna' },
            { name: 'Poland', flag: '🇵🇱', capital: 'Warsaw' },
            { name: 'Czech Republic', flag: '🇨🇿', capital: 'Prague' },
            { name: 'Hungary', flag: '🇭🇺', capital: 'Budapest' },
            { name: 'Ukraine', flag: '🇺🇦', capital: 'Kyiv' },
            { name: 'Romania', flag: '🇷🇴', capital: 'Bucharest' },
            { name: 'Bulgaria', flag: '🇧🇬', capital: 'Sofia' },
            { name: 'Serbia', flag: '🇷🇸', capital: 'Belgrade' },
            { name: 'Croatia', flag: '🇭🇷', capital: 'Zagreb' },
            { name: 'Denmark', flag: '🇩🇰', capital: 'Copenhagen' },
            { name: 'New Zealand', flag: '🇳🇿', capital: 'Wellington' },
            { name: 'Indonesia', flag: '🇮🇩', capital: 'Jakarta' },
            { name: 'Malaysia', flag: '🇲🇾', capital: 'Kuala Lumpur' },
            { name: 'Philippines', flag: '🇵🇭', capital: 'Manila' },
            { name: 'Vietnam', flag: '🇻🇳', capital: 'Hanoi' },
            { name: 'Saudi Arabia', flag: '🇸🇦', capital: 'Riyadh' },
            { name: 'United Arab Emirates', flag: '🇦🇪', capital: 'Abu Dhabi' },
            { name: 'Israel', flag: '🇮🇱', capital: 'Jerusalem' },
            { name: 'Kenya', flag: '🇰🇪', capital: 'Nairobi' },
            { name: 'Nigeria', flag: '🇳🇬', capital: 'Abuja' },
            { name: 'Morocco', flag: '🇲🇦', capital: 'Rabat' },
            { name: 'Peru', flag: '🇵🇪', capital: 'Lima' },
            { name: 'Chile', flag: '🇨🇱', capital: 'Santiago' },
            { name: 'Colombia', flag: '🇨🇴', capital: 'Bogotá' }
        ];

        // Game state
        let currentCountry = null;
        let score = 0;
        let streak = 0;
        let usedIndices = [];     // track used countries this session (optional, but we want random repeat allowed)
        let remainingCountries = [];

        // DOM elements
        const flagEl = document.getElementById('flagEmoji');
        const capitalEl = document.getElementById('capitalDisplay');
        const countryInput = document.getElementById('countryInput');
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        const resetBtn = document.getElementById('resetBtn');
        const scoreSpan = document.getElementById('scoreValue');
        const streakSpan = document.getElementById('streakValue');
        const feedbackEl = document.getElementById('feedbackMessage');

        // helper: pick random country (with simple bias to avoid immediate repeat, but fine)
        function getRandomCountry() {
            const randomIndex = Math.floor(Math.random() * countries.length);
            return countries[randomIndex];
        }

        // update UI with current country
        function setCountry(country) {
            currentCountry = country;
            flagEl.innerText = country.flag;
            capitalEl.innerText = country.capital;
            countryInput.value = '';
            countryInput.focus();
        }

        // load next random country
        function nextRandomCountry() {
            const newCountry = getRandomCountry();
            setCountry(newCountry);
            feedbackEl.innerHTML = '✨ guess the country (capital shown)';
        }

        // update score display
        function updateScoreboard() {
            scoreSpan.innerText = score;
            streakSpan.innerText = streak;
        }

        // handle guess
        function handleGuess() {
            if (!currentCountry) return;

            const userAnswer = countryInput.value.trim().toLowerCase();
            if (userAnswer === '') {
                feedbackEl.innerHTML = '⚠️ type a country name';
                return;
            }

            const correctName = currentCountry.name.toLowerCase();
            // simple comparison (allow slight variations? we'll keep exact but case-insensitive)
            // also common alternative names? we'll ignore for simplicity, but we can include some aliases:
            const aliases = {
                'united states': 'united states', 'us': 'united states', 'usa': 'united states',
                'uk': 'united kingdom', 'britain': 'united kingdom',
                'czechia': 'czech republic', 'south korea': 'south korea', 'korea, south': 'south korea',
                'russian federation': 'russia',
                'iran': 'iran', 'syria': 'syria', 'venezuela': 'venezuela'
            };
            // not adding many aliases, but we can just use direct match.
            const isCorrect = (userAnswer === correctName) || (aliases[userAnswer] && aliases[userAnswer] === correctName);

            if (isCorrect) {
                // correct guess
                score += 10 + (streak * 2);
                streak += 1;
                updateScoreboard();
                feedbackEl.innerHTML = `✅ correct! +${10 + ((streak-1)*2)} points · streak ${streak} 🔥`;
                // move to next country automatically after short delay
                setTimeout(() => {
                    nextRandomCountry();
                }, 800);
            } else {
                // wrong guess
                streak = 0;
                updateScoreboard();
                feedbackEl.innerHTML = `❌ wrong guess. try again or skip (it was ${currentCountry.name})?`;
                countryInput.value = '';
                countryInput.focus();
            }
        }

        // skip to next country (reset streak if skip)
        function skipCountry() {
            if (!currentCountry) return;
            streak = 0;
            updateScoreboard();
            feedbackEl.innerHTML = `⏩ skipped · it was ${currentCountry.name}. next country`;
            nextRandomCountry();
        }

        // reset whole game
        function resetGame() {
            score = 0;
            streak = 0;
            updateScoreboard();
            nextRandomCountry();
            feedbackEl.innerHTML = '🔄 game reset · good luck!';
            countryInput.focus();
        }

        // Event listeners
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleGuess();
        });

        countryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleGuess();
            }
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            skipCountry();
        });

        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetGame();
        });

        // initial load
        resetGame();

        // ensure focus stays on input
        document.addEventListener('click', () => countryInput.focus());
        window.addEventListener('load', () => countryInput.focus());
    })();