// VoteLive - Real-Time Polling Platform
// ...existing code...
let currentPoll = null;
let pollResults = [];

const pollForm = document.getElementById('poll-form');
const optionsContainer = document.getElementById('options-container');
const addOptionBtn = document.getElementById('add-option');
const activePollDiv = document.getElementById('active-poll');
const resultsChart = document.getElementById('resultsChart');
const pollType = document.getElementById('poll-type');

addOptionBtn.onclick = function() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'poll-option';
    input.placeholder = `Option ${optionsContainer.children.length + 1}`;
    input.required = true;
    optionsContainer.appendChild(input);
};

pollForm.onsubmit = function(e) {
    e.preventDefault();
    const question = document.getElementById('poll-question').value;
    const options = Array.from(document.getElementsByClassName('poll-option')).map(i => i.value).filter(Boolean);
    const type = pollType.value;
    const creator = document.getElementById('poll-creator').value;
    if (options.length < 2) return alert('At least 2 options required');
    currentPoll = { question, options, type, creator };
    pollResults = Array(options.length).fill(0);
    renderActivePoll();
    renderResults();
};

function renderActivePoll() {
    if (!currentPoll) return activePollDiv.innerHTML = '<em>No active poll</em>';
    let html = `<div class="poll-question"><strong>${currentPoll.question}</strong></div>`;
    html += '<form id="vote-form">';
    currentPoll.options.forEach((opt, idx) => {
        if (currentPoll.type === 'single') {
            html += `<div class="option"><input type="radio" name="vote" value="${idx}"> ${opt}</div>`;
        } else {
            html += `<div class="option"><input type="checkbox" name="vote" value="${idx}"> ${opt}</div>`;
        }
    });
    html += '<button type="submit">Vote</button></form>';
    activePollDiv.innerHTML = html;
    document.getElementById('vote-form').onsubmit = function(e) {
        e.preventDefault();
        const selected = Array.from(document.querySelectorAll('#vote-form input:checked')).map(i => +i.value);
        if (!selected.length) return alert('Select at least one option');
        selected.forEach(idx => pollResults[idx]++);
        renderResults();
        activePollDiv.innerHTML = '<strong>Thank you for voting!</strong>';
    };
}

function renderResults() {
    if (!currentPoll) return;
    if (window.resultsChartInstance) window.resultsChartInstance.destroy();
    window.resultsChartInstance = new Chart(resultsChart.getContext('2d'), {
        type: 'bar',
        data: {
            labels: currentPoll.options,
            datasets: [{
                label: 'Votes',
                data: pollResults,
                backgroundColor: ['#222222', '#444444', '#666666', '#222222', '#444444', '#666666'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: '#444' }, ticks: { color: '#f1f1f1' } },
                y: { grid: { color: '#444' }, ticks: { color: '#f1f1f1' }, beginAtZero: true }
            }
        }
    });
}

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
