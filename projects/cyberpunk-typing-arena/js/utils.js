export function randomText(level) {
    const easy = "The cyber city glows with neon lights.";
    const medium = "Hackers move silently through the digital shadows of the megacity.";
    const hard = "Quantum encrypted firewalls pulse violently as rogue AIs infiltrate the cybernetic core.";

    if(level === "easy") return easy;
    if(level === "medium") return medium;
    return hard;
}