// Project Roadmap Visualizer
// Vanilla JS, HTML, CSS

const milestoneForm = document.getElementById('milestoneForm');
const milestoneInput = document.getElementById('milestoneInput');
const milestoneList = document.getElementById('milestoneList');
const timelineView = document.getElementById('timelineView');
const kanbanView = document.getElementById('kanbanView');
const timelineViewBtn = document.getElementById('timelineViewBtn');
const kanbanViewBtn = document.getElementById('kanbanViewBtn');
const exportBtn = document.getElementById('exportBtn');

let milestones = [];
let tasks = [];
let currentView = 'timeline';

function saveData() {
    localStorage.setItem('prv_milestones', JSON.stringify(milestones));
    localStorage.setItem('prv_tasks', JSON.stringify(tasks));
}
function loadData() {
    milestones = JSON.parse(localStorage.getItem('prv_milestones')) || [];
    tasks = JSON.parse(localStorage.getItem('prv_tasks')) || [];
}

function renderMilestones() {
    milestoneList.innerHTML = '';
    milestones.forEach((m, i) => {
        const li = document.createElement('li');
        li.textContent = m;
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.onclick = () => {
            milestones.splice(i, 1);
            tasks = tasks.filter(t => t.milestone !== m);
            saveData();
            renderMilestones();
            renderBoard();
        };
        li.appendChild(delBtn);
        milestoneList.appendChild(li);
    });
}

milestoneForm.onsubmit = e => {
    e.preventDefault();
    const val = milestoneInput.value.trim();
    if (val && !milestones.includes(val)) {
        milestones.push(val);
        saveData();
        renderMilestones();
        renderBoard();
        milestoneInput.value = '';
    }
};

function renderBoard() {
    if (currentView === 'timeline') renderTimeline();
    else renderKanban();
}

function renderTimeline() {
    timelineView.style.display = '';
    kanbanView.style.display = 'none';
    timelineView.innerHTML = '';
    if (milestones.length === 0) {
        timelineView.innerHTML = '<p>No milestones yet.</p>';
        return;
    }
    milestones.forEach(milestone => {
        const section = document.createElement('section');
        section.className = 'timeline-milestone';
        const h3 = document.createElement('h3');
        h3.textContent = milestone;
        section.appendChild(h3);
        const ul = document.createElement('ul');
        tasks.filter(t => t.milestone === milestone).forEach((task, idx) => {
            const li = document.createElement('li');
            li.className = 'task ' + task.status;
            li.draggable = true;
            li.textContent = task.title;
            li.ondragstart = e => {
                e.dataTransfer.setData('task', JSON.stringify(task));
            };
            const actions = document.createElement('span');
            actions.className = 'actions';
            const editBtn = document.createElement('button');
            editBtn.textContent = '✎';
            editBtn.onclick = () => editTask(task);
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.onclick = () => {
                tasks = tasks.filter(t => t !== task);
                saveData();
                renderBoard();
            };
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            li.appendChild(actions);
            ul.appendChild(li);
        });
        // Add task form
        const addForm = document.createElement('form');
        addForm.onsubmit = e => {
            e.preventDefault();
            const input = addForm.querySelector('input');
            const val = input.value.trim();
            if (val) {
                tasks.push({ title: val, milestone, status: 'todo' });
                saveData();
                renderBoard();
                input.value = '';
            }
        };
        const input = document.createElement('input');
        input.placeholder = 'Add task...';
        addForm.appendChild(input);
        const addBtn = document.createElement('button');
        addBtn.textContent = '+';
        addForm.appendChild(addBtn);
        section.appendChild(ul);
        section.appendChild(addForm);
        timelineView.appendChild(section);
    });
}

function renderKanban() {
    timelineView.style.display = 'none';
    kanbanView.style.display = '';
    kanbanView.innerHTML = '';
    if (milestones.length === 0) {
        kanbanView.innerHTML = '<p>No milestones yet.</p>';
        return;
    }
    milestones.forEach(milestone => {
        const board = document.createElement('div');
        board.className = 'kanban-board';
        ['todo', 'in-progress', 'done'].forEach(status => {
            const col = document.createElement('div');
            col.className = 'kanban-column';
            col.ondragover = e => e.preventDefault();
            col.ondrop = e => {
                const task = JSON.parse(e.dataTransfer.getData('task'));
                const idx = tasks.findIndex(t => t.title === task.title && t.milestone === task.milestone);
                if (idx !== -1) {
                    tasks[idx].status = status;
                    saveData();
                    renderBoard();
                }
            };
            const h3 = document.createElement('h3');
            h3.textContent = status.replace('-', ' ').toUpperCase();
            col.appendChild(h3);
            tasks.filter(t => t.milestone === milestone && t.status === status).forEach(task => {
                const card = document.createElement('div');
                card.className = 'task ' + status;
                card.draggable = true;
                card.textContent = task.title;
                card.ondragstart = e => {
                    e.dataTransfer.setData('task', JSON.stringify(task));
                };
                const actions = document.createElement('span');
                actions.className = 'actions';
                const editBtn = document.createElement('button');
                editBtn.textContent = '✎';
                editBtn.onclick = () => editTask(task);
                const delBtn = document.createElement('button');
                delBtn.textContent = '✕';
                delBtn.onclick = () => {
                    tasks = tasks.filter(t => t !== task);
                    saveData();
                    renderBoard();
                };
                actions.appendChild(editBtn);
                actions.appendChild(delBtn);
                card.appendChild(actions);
                col.appendChild(card);
            });
            board.appendChild(col);
        });
        // Add task form
        const addForm = document.createElement('form');
        addForm.onsubmit = e => {
            e.preventDefault();
            const input = addForm.querySelector('input');
            const val = input.value.trim();
            if (val) {
                tasks.push({ title: val, milestone, status: 'todo' });
                saveData();
                renderBoard();
                input.value = '';
            }
        };
        const input = document.createElement('input');
        input.placeholder = 'Add task...';
        addForm.appendChild(input);
        const addBtn = document.createElement('button');
        addBtn.textContent = '+';
        addForm.appendChild(addBtn);
        kanbanView.appendChild(board);
        kanbanView.appendChild(addForm);
    });
}

timelineViewBtn.onclick = () => {
    currentView = 'timeline';
    renderBoard();
};
kanbanViewBtn.onclick = () => {
    currentView = 'kanban';
    renderBoard();
};

function editTask(task) {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle.trim()) {
        task.title = newTitle.trim();
        saveData();
        renderBoard();
    }
}

exportBtn.onclick = () => {
    // Export the current board as image (using html2canvas if available)
    if (window.html2canvas) {
        const target = currentView === 'timeline' ? timelineView : kanbanView;
        html2canvas(target).then(canvas => {
            const link = document.createElement('a');
            link.download = 'roadmap.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        alert('Export requires html2canvas. Please include it in your project.');
    }
};

// On load
loadData();
renderMilestones();
renderBoard();
