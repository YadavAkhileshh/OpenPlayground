const certificate = document.getElementById("certificate");
const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const handle = document.getElementById("handle");
const commitEl = document.getElementById("commits");
const dateEl = document.getElementById("date");

// ✅ Exact repo details (case-sensitive)
const REPO_OWNER = "YadavAkhileshh";
const REPO_NAME = "OpenPlayground";

/**
 * Fetch GitHub user profile
 */
async function fetchUser(username) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

/**
 * ✅ Fetch commit count using Contributors API
 * This matches GitHub Contributors Graph
 */
async function fetchCommitCount(username) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`
  );

  if (!res.ok) return 0;

  const contributors = await res.json();

  const contributor = contributors.find(
    c => c.login.toLowerCase() === username.toLowerCase()
  );

  return contributor ? contributor.contributions : 0;
}

/**
 * Generate certificate
 */
async function generateCertificate() {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Please enter a GitHub username");
    return;
  }

  try {
    const user = await fetchUser(username);
    const commitCount = await fetchCommitCount(username);

    avatar.src = user.avatar_url;
    nameEl.textContent = user.name || user.login;
    handle.textContent = `GitHub: @${user.login}`;
    commitEl.textContent = commitCount + " (GitHub verified)";
    dateEl.textContent = new Date().toDateString();

    certificate.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Unable to fetch contributor data.");
  }
}

/**
 * Download certificate as PDF
 */
async function downloadPDF() {
  const cert = document.getElementById("certificate");

  const canvas = await html2canvas(cert, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 15, pdfWidth, pdfHeight);
  pdf.save("Contributor_Certificate.pdf");
}
