const SK_Q = 'ec_q', SK_P = 'ec_p', SK_C = 'ec_c', SK_U = 'ec_u', SK_US = 'ec_us', SK_L = 'ec_likes';
let questions = JSON.parse(localStorage.getItem(SK_Q)) || [];
let points = JSON.parse(localStorage.getItem(SK_P)) || {};
let classes = JSON.parse(localStorage.getItem(SK_C)) || ['Class 1', 'Class 2'];
let users = JSON.parse(localStorage.getItem(SK_US)) || {};
let currentUser = JSON.parse(localStorage.getItem(SK_U)) || null;
let currentUserIsTeacher = false;
let userLikes = JSON.parse(localStorage.getItem(SK_L)) || {};

// Auth
function toggleToSignup() { loginSection.style.display = "none"; signupSection.style.display = "block"; }
function toggleToLogin() { signupSection.style.display = "none"; loginSection.style.display = "block"; }
function signupUser() {
    let n = signupNickname.value.trim(), p = signupPassword.value, p2 = signupPasswordConfirm.value;
    if (!n || !p || !p2) { signupError.textContent = "Please fill all fields"; return; }
    if (p !== p2) { signupError.textContent = "Passwords do not match"; return; }
    if (users[n]) { signupError.textContent = "User already exists"; return; }
    users[n] = p; localStorage.setItem(SK_US, JSON.stringify(users));
    alert("Registration successful."); toggleToLogin();
}
function loginUser() {
    let n = loginNickname.value.trim(), p = loginPassword.value;
    if (n.toLowerCase() === "teacher" && p === "teacher123") { currentUser = "Teacher"; currentUserIsTeacher = true; }
    else {
        if (!users[n] || users[n] !== p) { loginError.textContent = "Invalid login"; return; }
        currentUser = n; currentUserIsTeacher = false;
    }
    localStorage.setItem(SK_U, JSON.stringify(currentUser));
    if (!userLikes[currentUser]) userLikes[currentUser] = [];
    showMain();
}
function logoutUser() { currentUser = null; currentUserIsTeacher = false; localStorage.removeItem(SK_U); mainSection.style.display = "none"; loginSection.style.display = "block"; }
function showMain() {
    loginSection.style.display = "none"; signupSection.style.display = "none"; mainSection.style.display = "flex";
    document.getElementById("teacherTab").style.display = currentUserIsTeacher ? "block" : "none";
    initClassSelector(); renderQuestions(); renderLeaderboard(); updateUserRank();
}

// Tabs
function openTab(tabId) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    document.querySelectorAll("#navTabs button").forEach(btn => btn.removeAttribute("aria-selected"));
    event.currentTarget.setAttribute("aria-selected", "true");
    if (tabId === "tabHome") renderQuestions();
    if (tabId === "tabTeacher") renderTeacherQuestions();
    if (tabId === "tabLeaderboard") renderLeaderboard();
    if (tabId === "tabProfile") renderProfile();
}

// Helpers
function initClassSelector() {
    classSelect.innerHTML = '<option value="All">All</option>';
    classes.forEach(c => { let o = document.createElement("option"); o.value = c; o.textContent = c; classSelect.appendChild(o); });
}
function save() {
    localStorage.setItem(SK_Q, JSON.stringify(questions));
    localStorage.setItem(SK_P, JSON.stringify(points));
    localStorage.setItem(SK_L, JSON.stringify(userLikes));
}

// CRUD
function postQuestion() {
    let txt = questionInput.value.trim(), c = classSelect.value;
    if (!txt || c === "All") { alert("Enter question and select a class."); return; }
    questions.unshift({ id: Date.now(), nickname: currentUser, className: c, text: txt, likes: 0, answers: [] });
    save(); renderQuestions(); renderLeaderboard(); updateUserRank();
}
function deleteQuestion(id) {
    questions = questions.filter(q => q.id !== id);
    save(); renderQuestions(); renderTeacherQuestions(); renderProfile(); renderLeaderboard(); updateUserRank();
}
function likeQuestion(id) {
    if (userLikes[currentUser]?.includes(id)) { alert("Already liked"); return; }
    let q = questions.find(q => q.id === id);
    if (q) { q.likes++; userLikes[currentUser].push(id); save(); renderQuestions(); }
}
function postAnswer(id) {
    let txt = prompt("Enter your answer:"); if (!txt) return;
    let q = questions.find(q => q.id === id); if (!q) return;
    q.answers.push({ nickname: currentUser, text: txt });
    points[currentUser] = (points[currentUser] || 0) + 10;
    save(); renderQuestions(); renderLeaderboard(); updateUserRank();
}

// Render
function renderQuestions() {
    questionsList.innerHTML = "";
    if (!questions.length) { questionsList.textContent = "No questions submitted yet."; return; }
    questions.forEach(q => {
        let div = document.createElement("div"); div.className = "question";
        let likeDisabled = userLikes[currentUser]?.includes(q.id) ? "disabled" : "";
        div.innerHTML = `<div class="question-header"><span>${q.nickname} (${q.className})</span><div><button class="btn-small" onclick="likeQuestion(${q.id})" ${likeDisabled}>👍 ${q.likes}</button></div></div><div class="question-text">${q.text}</div>`;
        let ac = document.createElement("div"); ac.className = "answers-container";
        let tAns = q.answers.filter(a => a.nickname === "Teacher");
        let sAns = q.answers.filter(a => a.nickname !== "Teacher");
        if (tAns.length) { let tDiv = document.createElement("div"); tDiv.className = "teacher-answers"; tDiv.innerHTML = "<strong>Teacher:</strong>"; tAns.forEach(a => { tDiv.innerHTML += `<div class="answer teacher-answer"><div class="avatar">T</div>${a.text}</div>` }); ac.appendChild(tDiv); }
        if (sAns.length) { let sDiv = document.createElement("div"); sDiv.className = "student-answers"; sDiv.innerHTML = "<strong>Students:</strong>"; sAns.forEach(a => { sDiv.innerHTML += `<div class="answer"><div class="avatar">${a.nickname[0]}</div><div><strong>${a.nickname}:</strong> ${a.text} (+${points[a.nickname] || 0})</div></div>` }); ac.appendChild(sDiv); }
        if (!q.answers.length) { ac.innerHTML = "<em>No answers yet.</em>"; }
        div.appendChild(ac); div.innerHTML += `<button class="btn-small" onclick="postAnswer(${q.id})">Answer</button>`;
        questionsList.appendChild(div);
    });
}
function renderTeacherQuestions() {
    teacherQuestionsList.innerHTML = "";
    questions.forEach(q => {
        let div = document.createElement("div"); div.className = "question";
        div.innerHTML = `<div class="question-header"><span>${q.nickname} (${q.className})</span><button class="btn-small btn-delete" onclick="deleteQuestion(${q.id})">Delete</button></div><div class="question-text">${q.text}</div>`;
        teacherQuestionsList.appendChild(div);
    });
}
function renderLeaderboard() {
    leaderboardList.innerHTML = "";
    let sorted = Object.entries(points).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) { leaderboardList.textContent = "No contributions yet."; return; }
    sorted.forEach(([u, p], i) => {
        let medal = (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "");
        leaderboardList.innerHTML += `<div class="leaderboard-entry">${medal} ${u} — ${p} pts</div>`;
    });
}
function renderProfile() {
    myContrib.innerHTML = "";
    let mine = questions.filter(q => q.nickname === currentUser);
    if (!mine.length) { myContrib.textContent = "You have not contributed yet."; return; }
    mine.forEach(q => {
        myContrib.innerHTML += `<div class="question"><strong>Q:</strong> ${q.text} (${q.answers.length} answers)<button class="btn-small btn-delete" onclick="deleteQuestion(${q.id})">Delete</button></div>`;
    });
}
function updateUserRank() {
    let sorted = Object.entries(points).sort((a, b) => b[1] - a[1]);
    let idx = sorted.findIndex(([u]) => u === currentUser);
    if (idx !== -1) { userRankInfo.textContent = `Welcome ${currentUser} — Rank #${idx + 1}, ${sorted[idx][1]} points`; }
    else userRankInfo.textContent = `Welcome ${currentUser}`;
}

window.onload = () => { if (currentUser) showMain(); else loginSection.style.display = "block"; }
