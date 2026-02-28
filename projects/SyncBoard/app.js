// SyncBoard - Real-Time Kanban Board
// ...existing code...
const columns = {
    todo: [],
    inprogress: [],
    done: []
};
let cardId = 0;
let editingCard = null;

const activityLog = [];

function logActivity(msg) {
    activityLog.unshift(msg);
    if (activityLog.length > 30) activityLog.pop();
    renderActivityLog();
}

function renderActivityLog() {
    const log = document.getElementById('activity-log');
    log.innerHTML = '';
    activityLog.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        log.appendChild(li);
    });
}

function renderBoard() {
    ['todo', 'inprogress', 'done'].forEach(status => {
        const container = document.getElementById(status + '-cards');
        container.innerHTML = '';
        columns[status].forEach(card => {
            const div = document.createElement('div');
            div.className = 'kanban-card';
            div.draggable = true;
            div.innerHTML = `<span class="card-title">${card.title}</span><br>
                <span class="card-user">${card.user ? '👤 ' + card.user : ''}</span>
                <span class="card-deadline">${card.deadline ? '⏰ ' + card.deadline : ''}</span>
                <div class="card-desc">${card.desc || ''}</div>
                <button class="edit-btn">Edit</button>`;
            div.addEventListener('dragstart', e => {
                e.dataTransfer.setData('id', card.id);
                e.dataTransfer.setData('from', status);
            });
            div.querySelector('.edit-btn').onclick = () => openModal(card, status);
            container.appendChild(div);
        });
        container.ondragover = e => e.preventDefault();
        container.ondrop = e => {
            const id = +e.dataTransfer.getData('id');
            const from = e.dataTransfer.getData('from');
            if (from !== status) {
                const idx = columns[from].findIndex(c => c.id === id);
                if (idx > -1) {
                    const [moved] = columns[from].splice(idx, 1);
                    columns[status].push(moved);
                    logActivity(`Moved card "${moved.title}" from ${from} to ${status}`);
                    renderBoard();
                }
            }
        };
    });
}

document.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.onclick = () => openModal(null, btn.dataset.status);
});

function openModal(card, status) {
    editingCard = card;
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    document.getElementById('card-title').value = card ? card.title : '';
    document.getElementById('card-user').value = card ? card.user : '';
    document.getElementById('card-deadline').value = card ? card.deadline : '';
    document.getElementById('card-desc').value = card ? card.desc : '';
    modal.dataset.status = status;
}

document.querySelector('.close-btn').onclick = () => {
    document.getElementById('modal').classList.add('hidden');
};

document.getElementById('card-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('card-title').value;
    const user = document.getElementById('card-user').value;
    const deadline = document.getElementById('card-deadline').value;
    const desc = document.getElementById('card-desc').value;
    const status = document.getElementById('modal').dataset.status;
    if (editingCard) {
        editingCard.title = title;
        editingCard.user = user;
        editingCard.deadline = deadline;
        editingCard.desc = desc;
        logActivity(`Edited card "${title}" in ${status}`);
    } else {
        const card = { id: cardId++, title, user, deadline, desc };
        columns[status].push(card);
        logActivity(`Added card "${title}" to ${status}`);
    }
    document.getElementById('modal').classList.add('hidden');
    renderBoard();
};

// Chat
const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
let messages = [];
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('chat-message').value;
    messages.push(msg);
    renderChat();
    chatForm.reset();
});
function renderChat() {
    chatBox.innerHTML = '';
    messages.forEach(m => {
        const div = document.createElement('div');
        div.textContent = m;
        chatBox.appendChild(div);
    });
}
// Real-Time Sync Placeholder
// To implement real-time sync, backend integration (e.g., WebSocket) is required.
// ...existing code...
renderBoard();
renderActivityLog();
