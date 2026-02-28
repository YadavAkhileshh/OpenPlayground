/**
 * Handles all DOM updates to keep logic clean.
 */
export const UIRenderer = {

    updateTimer: (minutes, seconds, percent) => {
        const timerText = document.getElementById('timer-text');
        const circle = document.querySelector('.progress-ring__circle');

        // Update Text
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');
        timerText.textContent = `${m}:${s}`;

        // Update Ring
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;

        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    },

    setTimerMode: (mode) => {
        document.querySelectorAll('.mode-chip').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) btn.classList.add('active');
        });
    },

    setPlayState: (isPlaying) => {
        const btn = document.getElementById('start-timer');
        btn.textContent = isPlaying ? 'Pause' : 'Start Focus';
        btn.classList.toggle('pulse-animation', isPlaying);
    },

    renderTasks: (tasks, onDelete, onToggle) => {
        const list = document.getElementById('task-list');
        list.innerHTML = '';

        if (tasks.length === 0) {
            list.innerHTML = '<li class="empty-state">No active tasks. Time to plan!</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.onchange = () => onToggle(task.id);

            const span = document.createElement('span');
            span.textContent = task.text;
            span.style.flex = 1;

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.className = 'icon-btn small';
            deleteBtn.onclick = () => onDelete(task.id);

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    },

    updateMixerStatus: (status) => {
        document.getElementById('mixer-status').textContent = status;
    }
};
