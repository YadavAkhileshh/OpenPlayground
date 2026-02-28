// PetPal - main JS

const petForm = document.getElementById('pet-form');
const petProfileDiv = document.getElementById('pet-profile');
const findMatchBtn = document.getElementById('find-match-btn');
const matchResultDiv = document.getElementById('match-result');
const chatSection = document.getElementById('chat-section');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendMsgBtn = document.getElementById('send-msg-btn');

let petProfile = JSON.parse(localStorage.getItem('petPalProfile') || 'null');
let chatHistory = [];

function renderProfile() {
    if (petProfile) {
        petProfileDiv.innerHTML = `<b>Name:</b> ${petProfile.name}<br><b>Type:</b> ${petProfile.type}<br><b>Age:</b> ${petProfile.age}`;
    } else {
        petProfileDiv.innerHTML = '<i>No profile saved yet.</i>';
    }
}

petForm.onsubmit = (e) => {
    e.preventDefault();
    petProfile = {
        name: document.getElementById('pet-name').value,
        type: document.getElementById('pet-type').value,
        age: document.getElementById('pet-age').value
    };
    localStorage.setItem('petPalProfile', JSON.stringify(petProfile));
    renderProfile();
};

function getRandomMatch() {
    const names = ['Buddy', 'Milo', 'Luna', 'Bella', 'Charlie', 'Max', 'Lucy', 'Daisy'];
    const types = ['Dog', 'Cat', 'Rabbit', 'Parrot'];
    const ages = [1,2,3,4,5,6,7,8];
    return {
        name: names[Math.floor(Math.random()*names.length)],
        type: types[Math.floor(Math.random()*types.length)],
        age: ages[Math.floor(Math.random()*ages.length)]
    };
}

findMatchBtn.onclick = () => {
    if (!petProfile) {
        matchResultDiv.innerHTML = '<i>Please save your pet profile first.</i>';
        return;
    }
    const match = getRandomMatch();
    matchResultDiv.innerHTML = `<b>Matched with:</b> ${match.name} (${match.type}, Age ${match.age})<br><button id="start-chat-btn">Start Chat</button>`;
    document.getElementById('start-chat-btn').onclick = () => {
        chatSection.style.display = 'block';
        chatBox.innerHTML = '';
        chatHistory = [];
        addChatMessage('system', `You are now chatting with ${match.name}. Say hello!`);
    };
};

function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = (sender === 'user' ? 'You: ' : sender === 'system' ? '' : sender + ': ') + text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatHistory.push({sender, text});
}

sendMsgBtn.onclick = () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addChatMessage('user', msg);
    chatInput.value = '';
    setTimeout(() => {
        addChatMessage('match', getAutoReply(msg));
    }, 700);
};

function getAutoReply(userMsg) {
    const replies = [
        "That's great!",
        "My pet loves that too!",
        "How often do you go for walks?",
        "We should arrange a playdate soon!",
        "Haha, that's funny!",
        "Tell me more about your pet."
    ];
    return replies[Math.floor(Math.random()*replies.length)];
}

// On load
renderProfile();
