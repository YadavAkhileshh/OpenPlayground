const ideaElement = document.getElementById("idea");

function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =       
        date - start +
        (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
async function loadIdea() {
    try {
        const res = await fetch("dailyIdea.json");
        const ideas = await res.json();

        const index = (getDayOfYear() - 1) % ideas.length;
        ideaElement.textContent = ideas[index];

    } catch (err) {
        ideaElement.textContent = "Could not load today's idea.";
        console.error(err);
    }
}

loadIdea();
