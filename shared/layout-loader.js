function getBasePath() {
  const pathParts = window.location.pathname.split("/");
  const projectsIndex = pathParts.indexOf("projects");

  if (projectsIndex !== -1) {
    const depth = pathParts.length - projectsIndex - 2;
    return "../".repeat(depth) + "../shared/";
  }

  return "./shared/";
}

async function loadComponent(id, fileName) {
  try {
    const basePath = getBasePath();
    const response = await fetch(basePath + fileName);
    const data = await response.text();
    document.getElementById(id).innerHTML = data;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar-container", "navbar.html");
loadComponent("footer-container", "footer.html");
});