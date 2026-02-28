export function applyAction(stats, action) {
    switch(action) {
        case "code":
            stats.skill += 5;
            stats.burnout += 5;
            break;
        case "learn":
            stats.skill += 7;
            stats.burnout += 3;
            break;
        case "rest":
            stats.burnout -= 10;
            break;
        case "freelance":
            stats.money += 8;
            stats.burnout += 4;
            break;
        case "hackathon":
            stats.reputation += 10;
            stats.burnout += 8;
            break;
    }
}