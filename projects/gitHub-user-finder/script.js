const baseURL = "https://api.github.com/users";

const body = document.querySelector("body");
const toggleSwitch = document.querySelector("#toggle-btn");
const input = document.querySelector("input");
const searchBtn = document.querySelector(".search-btn");
const userProfile = document.querySelector(".user-profile");
const errorMsg = document.querySelector("#error-msg");


// Dark/Light Mode Toggle
let currMode = "Dark";
toggleSwitch.addEventListener("click", (evt) => {
  if (currMode === "Light") {
    currMode = "Dark";
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
    toggleSwitch.classList.add("fa-toggle-on");
    toggleSwitch.classList.remove("fa-toggle-off");
    toggleSwitch.style.color = "#ffffff";
  } else {
    currMode = "Light";
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
    toggleSwitch.classList.add("fa-toggle-off");
    toggleSwitch.classList.remove("fa-toggle-on");
    toggleSwitch.style.color = "#000000";
  }
});

// Search on Enter Key Press
input.addEventListener("keyup", (evt) => {
  if (evt.key === "Enter") {
    searchBtn.click();
  }
});

// Search Button Click Event
searchBtn.addEventListener("click", async () => {
  const userName = input.value.trim();
  const result = await getUserData(userName);
  if (result.error) {
    showError(result.error);
    return;
  }
  showUser(result.data);

  const repos = await getUserRepos(userName);
  showRepos(repos);
});

// Fetch GitHub User Data & Error Handling
const getUserData = async (userName) => {
  if (!userName) {
    return { error: "Please enter a GitHub username." };
  }

  try {
    const response = await fetch(`${baseURL}/${userName}`);

    // RATE LIMIT (GitHub sends 403)
    if (response.status === 403) {
      return {
        error: "API rate limit exceeded. Please wait a few minutes and try again."
      };
    }

    // USER NOT FOUND
    if (response.status === 404) {
      return {
        error: "User not found. Please check the username."
      };
    }

    // OTHER SERVER ERRORS
    if (!response.ok) {
      return {
        error: "GitHub server error. Please try again later."
      };
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    // NETWORK FAILURE
    return {
      error: "Network error."
    };
  }
};

// Fetch User Repositories
const getUserRepos = async (userName) => {
  const response = await fetch(
    `${baseURL}/${userName}/repos?sort=updated&direction=desc&per_page=5`
  );
  return await response.json();
};


//Error Display
const showError = (msg) => {
  errorMsg.innerText = msg;
  errorMsg.classList.remove("hidden");
  userProfile.classList.add("hidden");
};


// Display User Data
const showUser = (userData) => {
  errorMsg.classList.add("hidden");
  userProfile.classList.remove("hidden");
  const img = document.querySelector(".img img");
  if (img) img.src = userData.avatar_url;
  document.querySelector("#name").innerText = `Profile Name: ${
    userData.name || "N/A"
  }`;
  document.querySelector("#bio").innerText = `Bio: ${userData.bio || "N/A"}`;
  document.querySelector("#followers").innerText = `Followers: ${
    userData.followers ?? "N/A"
  }`;
  document.querySelector("#following").innerText = `Following: ${
    userData.following ?? "N/A"
  }`;
  document.querySelector("#repos").innerText = `Repositories: ${
    userData.public_repos ?? "N/A"
  }`;
  document.querySelector("#blog").innerHTML = `Blog: ${
    userData.blog
      ? `<a href="${userData.blog}" target="_blank" style="border: none;">${userData.blog}</a>`
      : "N/A"
  }`;
  document.querySelector("#company").innerText = `Company: ${
    userData.company || "N/A"
  }`;
  document.querySelector("#location").innerText = `Location: ${
    userData.location || "N/A"
  }`;
  document.querySelector("#created-on").innerText = `Created On: ${
    userData.created_at ? new Date(userData.created_at).toDateString() : "N/A"
  }`;
  document.querySelector("#last-update").innerText = `Last Update On: ${
    userData.updated_at ? new Date(userData.updated_at).toDateString() : "N/A"
  }`;
  document.querySelector("#profile-link").href = userData.html_url || "#";
};

// Display User Repositories
const showRepos = (repos) => {
  const repoContainer = document.querySelector(".repo");
  repoContainer.innerHTML = ""; // 🔴 IMPORTANT: clear old repos

  if (!repos.length) {
    repoContainer.innerHTML = "<p>No repositories found.</p>";
    return;
  }

  repos.forEach((repo) => {
    const repoDiv = document.createElement("div");
    repoDiv.classList.add("repo-item");

    repoDiv.innerHTML = `
      <strong>${repo.name}</strong>
      <p>${repo.description || "No description"}</p>
      <a href="${repo.html_url}" target="_blank">View Repo</a>
    `;

    repoContainer.appendChild(repoDiv);
  });
};
