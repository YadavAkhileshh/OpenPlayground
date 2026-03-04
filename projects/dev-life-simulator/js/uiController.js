export function updateStatsUI(stats) {
    document.getElementById("skillBar").style.width = stats.skill + "%";
    document.getElementById("moneyBar").style.width = stats.money + "%";
    document.getElementById("burnoutBar").style.width = stats.burnout + "%";
    document.getElementById("reputationBar").style.width = stats.reputation + "%";
}