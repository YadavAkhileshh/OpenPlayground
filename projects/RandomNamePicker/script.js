document.addEventListener('DOMContentLoaded', () => {
    const namesInput = document.getElementById('namesInput');
    const pickBtn = document.getElementById('pickBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultCard = document.getElementById('resultCard');
    const shufflingNames = document.getElementById('shufflingNames');
    const resultDisplay = document.getElementById('resultDisplay');
    const winnerName = document.getElementById('winnerName');
    const resetBtn = document.getElementById('resetBtn');
    const historyList = document.getElementById('historyList');
    const confettiContainer = document.getElementById('confettiContainer');

    let isShuffling = false;

    pickBtn.addEventListener('click', () => {
        if (isShuffling) return;

        const names = namesInput.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');

        if (names.length === 0) {
            alert('Please enter at least one name!');
            return;
        }

        startShuffling(names);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the list?')) {
            namesInput.value = '';
        }
    });

    resetBtn.addEventListener('click', () => {
        resultDisplay.classList.add('hidden');
        shufflingNames.parentElement.classList.remove('hidden');
        shufflingNames.textContent = 'Ready to pick?';
        resultCard.style.borderStyle = 'dashed';
    });

    function startShuffling(names) {
        isShuffling = true;
        pickBtn.disabled = true;
        pickBtn.classList.add('loading');

        resultDisplay.classList.add('hidden');
        shufflingNames.parentElement.classList.remove('hidden');
        resultCard.style.borderStyle = 'dashed';

        let iterations = 0;
        const maxIterations = 20;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * names.length);
            shufflingNames.textContent = names[randomIndex];

            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(interval);
                const winner = names[Math.floor(Math.random() * names.length)];
                showWinner(winner);
            }
        }, 100);
    }

    function showWinner(winner) {
        isShuffling = false;
        pickBtn.disabled = false;
        pickBtn.classList.remove('loading');

        shufflingNames.parentElement.classList.add('hidden');
        resultDisplay.classList.remove('hidden');
        winnerName.textContent = winner;
        resultCard.style.borderStyle = 'solid';

        addToHistory(winner);
        triggerConfetti();
    }

    function addToHistory(name) {
        const emptyMsg = historyList.querySelector('.empty-msg');
        if (emptyMsg) emptyMsg.remove();

        const li = document.createElement('li');
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');

        li.innerHTML = `
            <span class="name">${name}</span>
            <span class="time">${time}</span>
        `;

        historyList.insertBefore(li, historyList.firstChild);

        // Keep only last 10
        if (historyList.children.length > 10) {
            historyList.lastChild.remove();
        }
    }

    function triggerConfetti() {
        const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.opacity = Math.random();

            confettiContainer.appendChild(confetti);

            const animation = confetti.animate([
                { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate3d(${(Math.random() - 0.5) * 200}px, 100vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }
});