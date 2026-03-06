let recoveryLogs = JSON.parse(localStorage.getItem('recoveryLogs')) || [];

const tips = [
    "Hold each stretch for 20-30 seconds to improve flexibility without causing injury.",
    "Breathe deeply and relax into the stretch - never bounce or force a stretch.",
    "Focus on major muscle groups: neck, shoulders, back, hips, and legs for comprehensive stretching.",
    "Incorporate dynamic stretches before workouts and static stretches after for best results.",
    "Stretch both sides equally to maintain balance and prevent muscle imbalances.",
    "Warm up with light cardio before stretching to increase blood flow to muscles.",
    "Use a yoga mat or soft surface for comfort and to prevent slipping during stretches.",
    "Combine stretching with deep breathing to reduce stress and enhance relaxation.",
    "Stretch regularly, even on non-training days, to maintain flexibility and prevent injury.",
    "Listen to your body - if a stretch causes pain (beyond mild discomfort), stop immediately."
];

function logRecovery() {
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const stretchingTime = parseInt(document.getElementById('stretchingTime').value);
    const restActivities = Array.from(document.getElementById('restActivities').selectedOptions).map(opt => opt.value);
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const date = document.getElementById('recoveryDate').value;

    if (!sleepHours || !stretchingTime || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const score = calculateRecoveryScore(sleepHours, stretchingTime, restActivities.length, stressLevel);

    const log = {
        sleepHours,
        stretchingTime,
        restActivities,
        stressLevel,
        date,
        score,
        timestamp: new Date().toISOString()
    };

    recoveryLogs.push(log);
    localStorage.setItem('recoveryLogs', JSON.stringify(recoveryLogs));

    updateScore();
    updateHistory();

    // Clear inputs
    document.getElementById('sleepHours').value = '';
    document.getElementById('stretchingTime').value = '';
    document.getElementById('restActivities').selectedIndex = -1;
    document.getElementById('stressLevel').value = 5;
    document.getElementById('stressValue').textContent = '5';
    document.getElementById('recoveryDate').value = '';
}

function calculateRecoveryScore(sleep, stretching, activitiesCount, stress) {
    let score = 0;

    // Sleep score (0-30 points)
    if (sleep >= 7 && sleep <= 9) score += 30;
    else if (sleep >= 6 && sleep <= 10) score += 20;
    else if (sleep >= 5 && sleep <= 11) score += 10;

    // Stretching score (0-25 points)
    if (stretching >= 20) score += 25;
    else if (stretching >= 15) score += 20;
    else if (stretching >= 10) score += 15;
    else if (stretching >= 5) score += 10;
    else if (stretching > 0) score += 5;

    // Activities score (0-25 points)
    score += Math.min(activitiesCount * 5, 25);

    // Stress score (0-20 points)
    score += Math.max(0, 20 - (stress - 1) * 2);

    return Math.min(100, Math.max(0, score));
}

function updateScore() {
    if (recoveryLogs.length === 0) {
        document.getElementById('currentScore').textContent = '0';
        document.getElementById('avgScore').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('recoveryCount').textContent = '0';
        updateScoreCircle(0);
        return;
    }

    const latest = recoveryLogs[recoveryLogs.length - 1];
    const avgScore = recoveryLogs.reduce((sum, log) => sum + log.score, 0) / recoveryLogs.length;
    const bestScore = Math.max(...recoveryLogs.map(log => log.score));

    document.getElementById('currentScore').textContent = latest.score;
    document.getElementById('avgScore').textContent = avgScore.toFixed(1);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('recoveryCount').textContent = recoveryLogs.length;

    updateScoreCircle(latest.score);
}

function updateScoreCircle(score) {
    const circle = document.getElementById('scoreCircle');
    const percentage = (score / 100) * 360;
    circle.style.background = `conic-gradient(#4ecdc4 0deg, #4ecdc4 ${percentage}deg, #e0e0e0 ${percentage}deg)`;
}

function updateHistory() {
    const historyEl = document.getElementById('recoveryHistory');
    historyEl.innerHTML = '';

    if (recoveryLogs.length === 0) {
        historyEl.innerHTML = '<li>No recovery days logged yet.</li>';
        return;
    }

    recoveryLogs.slice(-5).reverse().forEach(log => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'recovery-info';
        info.innerHTML = `
            <h4>${log.date}</h4>
            <p>Sleep: ${log.sleepHours}h | Stretching: ${log.stretchingTime}min | Stress: ${log.stressLevel}/10</p>
            <p>Activities: ${log.restActivities.join(', ') || 'None'}</p>
        `;

        const score = document.createElement('div');
        score.textContent = `Score: ${log.score}`;
        score.style.fontWeight = 'bold';
        score.style.color = log.score >= 70 ? '#00b894' : log.score >= 50 ? '#fdcb6e' : '#e17055';

        li.appendChild(info);
        li.appendChild(score);
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Update stress value display
document.getElementById('stressLevel').addEventListener('input', function() {
    document.getElementById('stressValue').textContent = this.value;
});

// Initialize
document.getElementById('recoveryDate').valueAsDate = new Date();
updateScore();
updateHistory();
getNewTip();