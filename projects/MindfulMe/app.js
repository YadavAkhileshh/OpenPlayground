// MindfulMe App JS

document.addEventListener('DOMContentLoaded', function () {
  // Mood selection
  const moodBtns = document.querySelectorAll('.mood-btn');
  let selectedMood = null;
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
    });
  });

  // Save reflection
  const saveBtn = document.getElementById('save-reflection');
  const reflectionInput = document.getElementById('reflection');
  const historyList = document.getElementById('history-list');

  function loadHistory() {
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('mindfulme-history') || '[]');
    history.reverse().forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${entry.date}</strong> - <span>${entry.mood ? 'Mood: ' + entry.mood : 'No mood selected'}</span><br>${entry.reflection}`;
      historyList.appendChild(li);
    });
  }

  saveBtn.addEventListener('click', () => {
    const reflection = reflectionInput.value.trim();
    if (!reflection && !selectedMood) {
      alert('Please select a mood or write a reflection.');
      return;
    }
    const entry = {
      date: new Date().toLocaleDateString(),
      mood: selectedMood,
      reflection: reflection || '(No reflection)'
    };
    const history = JSON.parse(localStorage.getItem('mindfulme-history') || '[]');
    history.push(entry);
    localStorage.setItem('mindfulme-history', JSON.stringify(history));
    reflectionInput.value = '';
    moodBtns.forEach(b => b.classList.remove('selected'));
    selectedMood = null;
    loadHistory();
  });

  loadHistory();

  // Mindfulness timer
  const startBtn = document.getElementById('start-mindfulness');
  const timerDiv = document.getElementById('mindfulness-timer');
  const timerSpan = document.getElementById('timer');
  let timerInterval = null;

  startBtn.addEventListener('click', () => {
    timerDiv.style.display = 'block';
    let timeLeft = 60;
    timerSpan.textContent = timeLeft;
    startBtn.disabled = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerDiv.innerHTML = '<p>Well done! Take a moment to notice how you feel.</p>';
        startBtn.disabled = false;
        setTimeout(() => {
          timerDiv.style.display = 'none';
          timerDiv.innerHTML = '<p>Breathe in... <span id="timer">60</span>s</p>';
        }, 5000);
      }
    }, 1000);
  });
});
