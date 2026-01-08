const profileDiv = document.getElementById("profile");

async function getProfile() {
  const username = document.getElementById("username").value.trim();

  if (username === "") {
    profileDiv.innerHTML = "<p class='error'>Please enter a username</p>";
    return;
  }

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    
    if (!userRes.ok) {
      throw new Error("User not found");
    }

    const user = await userRes.json();

    const repoRes = await fetch(user.repos_url);
    const repos = await repoRes.json();

    profileDiv.innerHTML = `
      <div class="profile-card">
        <img src="${user.avatar_url}" alt="Avatar">
        <h2>${user.name || user.login}</h2>
        <p>${user.bio || "No bio available"}</p>

        <div class="stats">
          <div class="stat">
            <strong>${user.followers}</strong>
            <p>Followers</p>
          </div>
          <div class="stat">
            <strong>${user.following}</strong>
            <p>Following</p>
          </div>
          <div class="stat">
            <strong>${user.public_repos}</strong>
            <p>Repos</p>
          </div>
        </div>

        <div class="repo-list">
          <h3>📦 Repositories</h3>
          ${repos.slice(0,5).map(repo =>
            `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`
          ).join("")}
        </div>
      </div>
    `;
  } catch (error) {
    profileDiv.innerHTML = `<p class="error">${error.message}</p>`;
  }
}
