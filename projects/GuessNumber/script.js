
        let randomNumber = Math.floor(Math.random() * 100) + 1;
        const submit = document.querySelector('#subt');
        const userInput = document.querySelector('#guessField');
        const guessSlot = document.querySelector('.guesses');
        const remaining = document.querySelector('.lastResult');
        const lowOrHi = document.querySelector('.lowOrHi');
        const startOver = document.querySelector('#newGame');
        
        let prevGuess = [];
        let numGuess = 1;
        let playGame = true;

        submit.addEventListener('click', function (e) {
            e.preventDefault();
            const guess = parseInt(userInput.value);
            validateGuess(guess);
        });

        function validateGuess(guess) {
            if (isNaN(guess)) {
                alert('Please enter a valid number');
            } else if (guess < 1 || guess > 100) {
                alert('Please enter a number between 1 and 100');
            } else {
                prevGuess.push(guess);
                if (numGuess === 10) {
                    displayGuess(guess);
                    displayMessage(`Game Over. Random number was ${randomNumber}`);
                    endGame();
                } else {
                    displayGuess(guess);
                    checkGuess(guess);
                }
            }
        }

        function checkGuess(guess) {
            if (guess === randomNumber) {
                displayMessage(`You guessed it right!`);
                endGame();
            } else if (guess < randomNumber) {
                displayMessage(`Number is too low!`);
            } else {
                displayMessage(`Number is too high!`);
            }
        }

        function displayGuess(guess) {
            userInput.value = '';
            guessSlot.innerHTML += `${guess}, `;
            numGuess++;
            remaining.innerHTML = `${10 - numGuess}`;
        }

        function displayMessage(message) {
            lowOrHi.innerHTML = `<h2>${message}</h2>`;
        }

        function endGame() {
            userInput.value = '';
            userInput.setAttribute('disabled', '');
            startOver.style.display = 'block'; 
            playGame = false;
        }

        startOver.addEventListener('click', function () {
            randomNumber = Math.floor(Math.random() * 100) + 1;
            prevGuess = [];
            numGuess = 1;
            guessSlot.innerHTML = '';
            remaining.innerHTML = `10`;
            userInput.removeAttribute('disabled');
            lowOrHi.innerHTML = '';
            startOver.style.display = 'none'; 
            playGame = true;
        });
