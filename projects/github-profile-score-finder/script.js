async function getProfile() {
  const username = document.getElementById("username").value;
  const result = document.getElementById("result");

  if (!username) {
    result.innerHTML = "<p>Please enter a username</p>";
    return;
  }

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");

    const userData = await userRes.json();

    const repoRes = await fetch(userData.repos_url);
    const repos = await repoRes.json();

    let stars = 0;
    let forks = 0;

    repos.forEach(repo => {
      stars += repo.stargazers_count;
      forks += repo.forks_count;
    });

    // 🔢 Score Formula (Simple & Explainable)
    const score =
      userData.public_repos * 2 +
      userData.followers * 3 +
      stars * 4 +
      forks * 2;

    result.innerHTML = `
      <img src="${userData.avatar_url}" />
      <h2>${userData.login}</h2>
      <p>Repositories: ${userData.public_repos}</p>
      <p>Followers: ${userData.followers}</p>
      <p>Stars: ${stars}</p>
      <p>Forks: ${forks}</p>
      <h3>GitHub Score: ${score}</h3>
    `;

  } catch (error) {
    result.innerHTML = "<p>Invalid username or API error</p>";
  }
}
