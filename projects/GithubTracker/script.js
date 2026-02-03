async function fetchGitHubData() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter a GitHub username");

  document.getElementById("profile").innerHTML = "Loading...";
  document.getElementById("repos").innerHTML = "";
  document.getElementById("issues").innerHTML = "";
  document.getElementById("prs").innerHTML = "";

  try {
    /* PROFILE */
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    document.getElementById("profile").innerHTML = `
      <div class="profile">
        <img src="${user.avatar_url}" />
        <h2>${user.name || user.login}</h2>
        <p>${user.bio || "No bio available"}</p>
        <div class="stats">
          <span>📦 ${user.public_repos} Repos</span>
          <span>👥 ${user.followers} Followers</span>
          <span>➡️ ${user.following} Following</span>
        </div>
      </div>
    `;

    /* REPOS */
    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`
    );
    const repos = await repoRes.json();

    repos.forEach(repo => {
      document.getElementById("repos").innerHTML += `
        <div class="card">
          <strong>${repo.name}</strong><br/>
          ⭐ ${repo.stargazers_count}
        </div>
      `;
    });

    /* ISSUES (GLOBAL SEARCH) */
    const issueRes = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue+state:open&per_page=5`
    );
    const issueData = await issueRes.json();

    if (issueData.items.length === 0) {
      document.getElementById("issues").innerHTML = "<p>No open issues</p>";
    }

    issueData.items.forEach(issue => {
      document.getElementById("issues").innerHTML += `
        <div class="card">
          🐞 ${issue.title}
        </div>
      `;
    });

    /* PULL REQUESTS (GLOBAL SEARCH) */
    const prRes = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+state:open&per_page=5`
    );
    const prData = await prRes.json();

    if (prData.items.length === 0) {
      document.getElementById("prs").innerHTML = "<p>No open pull requests</p>";
    }

    prData.items.forEach(pr => {
      document.getElementById("prs").innerHTML += `
        <div class="card">
          🔁 ${pr.title}
        </div>
      `;
    });

  } catch (error) {
    document.getElementById("profile").innerHTML = error.message;
  }
}
