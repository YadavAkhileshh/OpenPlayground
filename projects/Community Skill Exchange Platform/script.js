// Sample data
let users = [
    { id: 1, name: 'Alice', bio: 'Web developer', skillsOffered: ['JavaScript', 'React'], skillsWanted: ['Python', 'Design'] },
    { id: 2, name: 'Bob', bio: 'Designer', skillsOffered: ['Design', 'Photoshop'], skillsWanted: ['JavaScript', 'Marketing'] },
    { id: 3, name: 'Charlie', bio: 'Data Scientist', skillsOffered: ['Python', 'Machine Learning'], skillsWanted: ['React', 'Communication'] }
];

let currentUser = null;
let requests = [];

// Load data from localStorage
function loadData() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) users = JSON.parse(storedUsers);
    
    const storedRequests = localStorage.getItem('requests');
    if (storedRequests) requests = JSON.parse(storedRequests);
    
    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedCurrentUser) currentUser = JSON.parse(storedCurrentUser);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Display profiles
function displayProfiles(userList = users) {
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';
    userList.forEach(user => {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'profile';
        profileDiv.innerHTML = `
            <h3>${user.name}</h3>
            <p>${user.bio}</p>
            <p><strong>Offers:</strong> ${user.skillsOffered.join(', ')}</p>
            <p><strong>Wants:</strong> ${user.skillsWanted.join(', ')}</p>
            <button onclick="sendRequest(${user.id})">Send Request</button>
        `;
        profileList.appendChild(profileDiv);
    });
}

// Search skills
function searchSkills() {
    const query = document.getElementById('skillSearch').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.skillsOffered.some(skill => skill.toLowerCase().includes(query)) ||
        user.skillsWanted.some(skill => skill.toLowerCase().includes(query))
    );
    displayProfiles(filteredUsers);
}

// Send request
function sendRequest(toId) {
    if (!currentUser) {
        alert('Please update your profile first');
        return;
    }
    const request = {
        id: Date.now(),
        from: currentUser.id,
        to: toId,
        skill: 'General', // In a real app, this would be selected
        type: 'collaborate',
        message: 'Let\'s collaborate!',
        status: 'pending'
    };
    requests.push(request);
    saveData();
    displayRequests();
    alert('Request sent!');
}

// Display requests
function displayRequests() {
    const requestList = document.getElementById('requestList');
    requestList.innerHTML = '';
    const myRequests = requests.filter(req => req.from === currentUser?.id || req.to === currentUser?.id);
    myRequests.forEach(req => {
        const fromUser = users.find(u => u.id === req.from);
        const toUser = users.find(u => u.id === req.to);
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request';
        requestDiv.innerHTML = `
            <p><strong>From:</strong> ${fromUser.name} <strong>To:</strong> ${toUser.name}</p>
            <p><strong>Skill:</strong> ${req.skill} <strong>Type:</strong> ${req.type}</p>
            <p><strong>Status:</strong> ${req.status}</p>
            ${req.to === currentUser?.id && req.status === 'pending' ? 
                `<button onclick="respondRequest(${req.id}, 'accepted')">Accept</button>
                 <button onclick="respondRequest(${req.id}, 'declined')">Decline</button>` : ''}
        `;
        requestList.appendChild(requestDiv);
    });
}

// Respond to request
function respondRequest(id, status) {
    const req = requests.find(r => r.id === id);
    if (req) {
        req.status = status;
        saveData();
        displayRequests();
    }
}

// Handle profile form
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const bio = document.getElementById('bio').value;
    const skillsOffered = document.getElementById('skillsOffered').value.split(',').map(s => s.trim());
    const skillsWanted = document.getElementById('skillsWanted').value.split(',').map(s => s.trim());
    
    if (!currentUser) {
        currentUser = { id: Date.now() };
        users.push(currentUser);
    }
    
    currentUser.name = name;
    currentUser.bio = bio;
    currentUser.skillsOffered = skillsOffered;
    currentUser.skillsWanted = skillsWanted;
    
    saveData();
    displayProfiles();
    displayRequests();
    alert('Profile updated!');
});

// Initialize
loadData();
displayProfiles();
if (currentUser) {
    document.getElementById('name').value = currentUser.name || '';
    document.getElementById('bio').value = currentUser.bio || '';
    document.getElementById('skillsOffered').value = currentUser.skillsOffered?.join(', ') || '';
    document.getElementById('skillsWanted').value = currentUser.skillsWanted?.join(', ') || '';
}
displayRequests();