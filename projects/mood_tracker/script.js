
    const historyEl = document.getElementById('history');
    const statsEls = document.querySelectorAll('.stats div');
    const filterButtons = document.querySelectorAll('.filters button');

    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    let currentFilter = 'All';

    function updateBackground(mood) {
      switch(mood) {
        case '😊': document.body.style.backgroundColor = 'var(--calm-color)'; break;
        case '😐': document.body.style.backgroundColor = 'var(--neutral-color)'; break;
        case '😢': document.body.style.backgroundColor = 'var(--sad-color)'; break;
        case '😡': document.body.style.backgroundColor = 'var(--angry-color)'; break;
        default: document.body.style.backgroundColor = 'var(--primary-color)';
      }
    }

    function formatDate(date) {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const d = new Date(date);
      const day = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      const time = d.toLocaleTimeString();
      return `${day}, ${dd}-${mm}-${yyyy} ${time}`;
    }

    function renderHistory() {
      historyEl.innerHTML = '';
      const counts = {'😊':0,'😐':0,'😢':0,'😡':0};

      moodHistory.forEach(entry => {
        const entryDay = new Date(entry.time).getDay();
        if(currentFilter !== 'All' && currentFilter !== entryDay) return;

        const li = document.createElement('li');
        li.innerHTML = `${entry.mood} <span class="time">${formatDate(entry.time)}</span>`;
        historyEl.appendChild(li);
        counts[entry.mood]++;
      });

      statsEls.forEach(el => {
        const emoji = el.textContent.split(' ')[0];
        el.textContent = `${emoji} ${counts[emoji] || 0}`;
      });
    }

    function saveMood(mood) {
      const entry = { mood, time: new Date() };
      moodHistory.unshift(entry);
      localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
      currentFilter = 'All';
      setActiveFilter('All');
      renderHistory();
      updateBackground(mood);
    }

    function filterDay(day) {
      currentFilter = day;
      setActiveFilter(day);
      renderHistory();
    }

    function setActiveFilter(day) {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      filterButtons.forEach(btn => {
        if((day === 'All' && btn.textContent === 'All') || btn.textContent.startsWith(dayName(day))) {
          btn.classList.add('active');
        }
      });
    }

    function dayName(day) {
      const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return names[day] || '';
    }

    // Initialize
    renderHistory();
    if(moodHistory[0]) updateBackground(moodHistory[0].mood);
  