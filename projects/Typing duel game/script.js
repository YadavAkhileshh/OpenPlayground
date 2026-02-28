
    /*  CONSTANTS  */
    const GAME_TIME = 5;
    const FALLBACK_WORDS = [
      "speed",
      "javascript",
      "typing",
      "developer",
      "challenge",
      "keyboard"
    ];
    const DIFFICULTY_SETTINGS = {
        easy: { time: 6, minLen: 3, maxLen: 5 },
        medium: { time: 5, minLen: 1, maxLen: 20 },
        hard: { time: 4, minLen: 8, maxLen: 20 }
    };


    /* STATE */
    let score = 0;
    let timeLeft = GAME_TIME;
    let timer = null;
    let currentWord = "";
    let totalWords = 0;
    let difficulty = "medium";
    const difficultyEl = document.getElementById("difficulty");
    difficultyEl.addEventListener("change", (e) => {
        difficulty = e.target.value;
    });

    /* DOM ELEMENTS*/
    const wordEl = document.getElementById("word");
    const inputEl = document.getElementById("input");
    const timeEl = document.getElementById("time");
    const scoreEl = document.getElementById("score");
    const startBtn = document.getElementById("startBtn");

    /*GAME LOGIC */

    async function getRandomWord() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 2000);

    try {
        const res = await fetch(
        "https://random-word-api.herokuapp.com/word",
        { signal: controller.signal }
        );
        const data = await res.json();
        return data[0];
    } catch {
        return FALLBACK_WORDS[
        Math.floor(Math.random() * FALLBACK_WORDS.length)
        ];
    }
    }



    let nextCachedWord = null;

    async function preloadWord() {
        nextCachedWord = await getRandomWord();
    }

    async function setNextWord() {
        if (!nextCachedWord) {
            currentWord = await getRandomWord();
        } else {
            currentWord = nextCachedWord;
        }
        wordEl.textContent = currentWord;
        preloadWord(); // preload next
    }



    async function startGame() {
        resetGame();
        setTimeByDifficulty();

        inputEl.disabled = true;
        wordEl.textContent = "Loading...";

        await setNextWord();   // ⏳ wait for word

        inputEl.disabled = false;
        inputEl.focus();

        timer = setInterval(updateTimer, 1000);
    }


    function resetGame() {
      clearInterval(timer);
      score = 0;
      totalWords = 0;
      timeLeft = GAME_TIME;
      scoreEl.textContent = score;
      timeEl.textContent = timeLeft;
      inputEl.value = "";
      inputEl.style.border = "";
    }

    function setTimeByDifficulty() {
        timeLeft = DIFFICULTY_SETTINGS[difficulty].time;
        timeEl.textContent = timeLeft;
    }


    function updateTimer() {
      timeLeft--;
      timeEl.textContent = timeLeft;

      if (timeLeft === 0) {
        endGame();
      }
    }

    function endGame() {
      clearInterval(timer);
      inputEl.disabled = true;
      const wpm = totalWords * 12;
      alert(`Game Over!\nScore: ${score}\nWPM: ${wpm}`);
    }

    /* ------------------ EVENTS ------------------ */

    inputEl.addEventListener("input", () => {
      const typed = inputEl.value;

      // Live feedback
      if (currentWord.startsWith(typed)) {
        inputEl.style.border = "2px solid #22c55e";
      } else {
        inputEl.style.border = "2px solid #ef4444";
      }

      // Word completed
      if (typed === currentWord) {
        score++;
        totalWords++;
        scoreEl.textContent = score;
        inputEl.value = "";

        setTimeByDifficulty(); // ✅ STEP 5 CALLED HERE
        setNextWord();
    }
    });

    startBtn.addEventListener("click", startGame);