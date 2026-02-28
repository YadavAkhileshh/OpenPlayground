const btnSearch = document.getElementById('btnSearch');
const usernameInput = document.getElementById('usernameInput');
const errorBox = document.getElementById('errorBox');
const dashboard = document.getElementById('dashboard');

// Language Color Mapping (GitHub style)
const colorMap = {
    'JavaScript': '#f1e05a',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Python': '#3572A5',
    'Java': '#b07219',
    'TypeScript': '#3178c6',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Dart': '#00B4AB',
    'C': '#555555',
    'Shell': '#89e051',
    'Vue': '#41b883',
    'Jupyter Notebook': '#DA5B0B'
};

btnSearch.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) fetchGitHubData(username);
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSearch.click();
});

async function fetchGitHubData(username) {
    // Reset UI
    errorBox.classList.add('hidden');
    dashboard.classList.add('hidden');
    btnSearch.disabled = true;
    btnSearch.innerText = 'Fetching...';

    try {
        // 1. Fetch User Profile
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error('User not found');
        const userData = await userRes.json();

        // 2. Fetch User Repos (limit 100 to avoid pagination complexity for this scope)
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const reposData = await reposRes.json();

        populateProfile(userData);
        analyzeLanguages(reposData);

        dashboard.classList.remove('hidden');
    } catch (error) {
        errorBox.classList.remove('hidden');
        errorBox.innerText = 'Error: ' + error.message + ' (Check rate limits or spelling)';
    } finally {
        btnSearch.disabled = false;
        btnSearch.innerText = 'Analyze Profile';
    }
}

function populateProfile(data) {
    document.getElementById('avatar').src = data.avatar_url;
    document.getElementById('name').innerText = data.name || data.login;
    document.getElementById('login').innerText = data.login;
    document.getElementById('profileLink').href = data.html_url;
    document.getElementById('bio').innerText = data.bio || 'No bio available.';
    document.getElementById('repoCount').innerText = data.public_repos;
    document.getElementById('followersCount').innerText = data.followers;
}

function analyzeLanguages(repos) {
    const langCounts = {};
    let totalValidRepos = 0;

    // Tally primary languages from repos
    repos.forEach(repo => {
        if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            totalValidRepos++;
        }
    });

    if (totalValidRepos === 0) {
        document.getElementById('donutChart').style.background = '#161b22';
        document.getElementById('legendContainer').innerHTML = '<p style="color:#8b949e; font-size: 0.85rem;">No language data available.</p>';
        return;
    }

    // Convert to array and sort by count descending
    const sortedLangs = Object.entries(langCounts)
        .map(([lang, count]) => ({ lang, count, percent: (count / totalValidRepos) * 100 }))
        .sort((a, b) => b.count - a.count);

    drawChartAndLegend(sortedLangs);
}

function drawChartAndLegend(langs) {
    const legendContainer = document.getElementById('legendContainer');
    const donutChart = document.getElementById('donutChart');
    legendContainer.innerHTML = '';

    let gradientString = [];
    let currentDegree = 0;

    langs.forEach(item => {
        // Fallback color for unmapped languages
        const color = colorMap[item.lang] || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        // Calculate gradient slice (0% to 100%)
        const nextDegree = currentDegree + item.percent;
        gradientString.push(`${color} ${currentDegree}% ${nextDegree}%`);
        currentDegree = nextDegree;

        // Build Legend Item
        const li = document.createElement('div');
        li.className = 'legend-item';
        li.innerHTML = `
            <div class="legend-label">
                <div class="color-box" style="background-color: ${color};"></div>
                <span>${item.lang}</span>
            </div>
            <div class="percentage">${item.percent.toFixed(1)}%</div>
        `;
        legendContainer.appendChild(li);
    });

    // Apply CSS Conic Gradient
    donutChart.style.background = `conic-gradient(${gradientString.join(', ')})`;
}