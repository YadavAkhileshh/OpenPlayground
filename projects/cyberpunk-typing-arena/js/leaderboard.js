export function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push(score);
    scores.sort((a,b)=>b-a);
    scores = scores.slice(0,5);
    localStorage.setItem("scores", JSON.stringify(scores));
    loadLeaderboard();
}

export function loadLeaderboard() {
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.forEach(score => {
        const li = document.createElement("li");
        li.textContent = score + " WPM";
        list.appendChild(li);
    });
}