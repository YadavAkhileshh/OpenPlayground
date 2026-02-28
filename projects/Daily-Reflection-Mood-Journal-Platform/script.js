document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const calendarSection = document.getElementById('calendar-section');
    const entrySection = document.getElementById('entry-section');
    const entryView = document.getElementById('entry-view');

    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const calendarBtn = document.getElementById('calendar-btn');
    const newEntryBtn = document.getElementById('new-entry-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const saveEntryBtn = document.getElementById('save-entry-btn');
    const editEntryBtn = document.getElementById('edit-entry-btn');
    const backBtn = document.getElementById('back-btn');

    let currentUser = localStorage.getItem('currentUser');
    let entries = JSON.parse(localStorage.getItem('entries') || '{}');

    function showSection(section) {
        [loginSection, dashboardSection, calendarSection, entrySection, entryView].forEach(s => s.classList.add('hidden'));
        section.classList.remove('hidden');
    }

    function checkAuth() {
        if (currentUser) {
            showSection(dashboardSection);
            loadDashboard();
        } else {
            showSection(loginSection);
        }
    }

    loginBtn.addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            checkAuth();
        } else {
            document.getElementById('login-message').textContent = 'Please enter username and password';
        }
    });

    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        checkAuth();
    });

    dashboardBtn.addEventListener('click', function() {
        showSection(dashboardSection);
        loadDashboard();
    });

    calendarBtn.addEventListener('click', function() {
        showSection(calendarSection);
        loadCalendar();
    });

    newEntryBtn.addEventListener('click', function() {
        showSection(entrySection);
        document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
    });

    saveEntryBtn.addEventListener('click', function() {
        const date = document.getElementById('entry-date').value;
        const reflection = document.getElementById('reflection').value;
        const mood = document.getElementById('mood').value;
        if (date && reflection && mood) {
            entries[date] = { reflection, mood };
            localStorage.setItem('entries', JSON.stringify(entries));
            document.getElementById('entry-message').textContent = 'Entry saved!';
            setTimeout(() => {
                showSection(calendarSection);
                loadCalendar();
            }, 1000);
        } else {
            document.getElementById('entry-message').textContent = 'Please fill all fields';
        }
    });

    editEntryBtn.addEventListener('click', function() {
        const date = document.getElementById('view-date').textContent;
        document.getElementById('entry-date').value = date;
        document.getElementById('reflection').value = entries[date].reflection;
        document.getElementById('mood').value = entries[date].mood;
        showSection(entrySection);
    });

    backBtn.addEventListener('click', function() {
        showSection(calendarSection);
    });

    function loadDashboard() {
        const chart = document.getElementById('mood-chart');
        chart.innerHTML = '';
        const moodCounts = {};
        const dates = Object.keys(entries).sort().slice(-7); // last 7 days
        dates.forEach(date => {
            const mood = entries[date].mood;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        Object.keys(moodCounts).forEach(mood => {
            const bar = document.createElement('div');
            bar.className = 'mood-bar';
            bar.style.height = `${moodCounts[mood] * 50}px`;
            bar.title = `${mood}: ${moodCounts[mood]}`;
            chart.appendChild(bar);
        });
    }

    function loadCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        // Days of week
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            dayEl.style.fontWeight = 'bold';
            calendar.appendChild(dayEl);
        });

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            calendar.appendChild(empty);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (entries[dateStr]) {
                dayEl.classList.add('has-entry');
            }
            dayEl.addEventListener('click', function() {
                if (entries[dateStr]) {
                    showEntry(dateStr);
                } else {
                    document.getElementById('entry-date').value = dateStr;
                    showSection(entrySection);
                }
            });
            calendar.appendChild(dayEl);
        }
    }

    function showEntry(date) {
        document.getElementById('view-date').textContent = date;
        document.getElementById('view-mood').textContent = entries[date].mood;
        document.getElementById('view-reflection').textContent = entries[date].reflection;
        showSection(entryView);
    }

    checkAuth();
});