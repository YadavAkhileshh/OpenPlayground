export function saveHistory(dream) {
    let history = JSON.parse(localStorage.getItem("dreamHistory")) || [];
    history.push(dream);
    localStorage.setItem("dreamHistory", JSON.stringify(history));
    loadHistory();
}

export function loadHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("dreamHistory")) || [];

    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}