export function randomEvent(stats) {
    const events = [
        "You received GitHub stars!",
        "You got a freelance client!",
        "Bug caused stress!",
        "You went viral on LinkedIn!"
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    document.getElementById("eventBox").innerHTML = `<p>${event}</p>`;
}