/* SIMULATED DATA */
const mockProfiles = {
    johndoe: {
        name: "johndoe",
        bio: "Full-stack developer passionate about open source.",
        followers: 120,
        following: 75,
        repos: [
            { name: "task-manager", stars: 12, forks: 3, language: "JavaScript" },
            { name: "portfolio-site", stars: 8, forks: 2, language: "HTML" },
            { name: "api-server", stars: 20, forks: 6, language: "Node.js" },
            { name: "ml-playground", stars: 15, forks: 4, language: "Python" }
        ]
    }
};

/* ELEMENTS */
const analyzeBtn = document.getElementById("analyze");
const usernameInput = document.getElementById("username");

const profileName = document.getElementById("profileName");
const bio = document.getElementById("bio");
const repoCount = document.getElementById("repoCount");
const followers = document.getElementById("followers");
const following = document.getElementById("following");

const starsEl = document.getElementById("stars");
const forksEl = document.getElementById("forks");
const languageEl = document.getElementById("language");
const repoList = document.getElementById("repoList");

/* ANALYZE */
analyzeBtn.addEventListener("click", () => {
    const user = usernameInput.value.trim().toLowerCase();
    if (!mockProfiles[user]) {
        alert("User not found (mock data)");
        return;
    }
    renderProfile(mockProfiles[user]);
});

/* RENDER */
function renderProfile(profile) {
    profileName.textContent = profile.name;
    bio.textContent = profile.bio;
    followers.textContent = profile.followers;
    following.textContent = profile.following;
    repoCount.textContent = profile.repos.length;

    renderRepos(profile.repos);
    calculateAnalytics(profile.repos);
}

/* REPOS */
function renderRepos(repos) {
    repoList.innerHTML = "";
    repos.forEach(repo => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${repo.name}</strong><br>
            ⭐ ${repo.stars} | 🍴 ${repo.forks}<br>
            Language: ${repo.language}
        `;
        repoList.appendChild(li);
    });
}

/* ANALYTICS */
function calculateAnalytics(repos) {
    let stars = 0;
    let forks = 0;
    const languages = {};

    repos.forEach(r => {
        stars += r.stars;
        forks += r.forks;
        languages[r.language] = (languages[r.language] || 0) + 1;
    });

    starsEl.textContent = stars;
    forksEl.textContent = forks;

    let primary = "N/A";
    let max = 0;
    for (let lang in languages) {
        if (languages[lang] > max) {
            max = languages[lang];
            primary = lang;
        }
    }
    languageEl.textContent = primary;
}