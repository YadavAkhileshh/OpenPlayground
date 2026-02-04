const certificate = document.getElementById("certificate");
const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const handle = document.getElementById("handle");
const commitEl = document.getElementById("commits");
const dateEl = document.getElementById("date");

// Change if needed
const OWNER = "YadavAkhileshh";
const REPO = "OpenPlayground";

/* Fetch GitHub User */
async function fetchUser(username) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

/* Fetch Contribution Count */
async function fetchCommits(username) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contributors`
  );

  if (!res.ok) return 0;

  const data = await res.json();

  const user = data.find(
    u => u.login.toLowerCase() === username.toLowerCase()
  );

  return user ? user.contributions : 0;
}

/* Generate Certificate */
async function generateCertificate() {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Enter GitHub username");
    return;
  }

  try {
    const user = await fetchUser(username);
    const commits = await fetchCommits(username);

    avatar.src = user.avatar_url;
    nameEl.textContent = user.name || user.login;
    handle.textContent = `@${user.login}`;
    commitEl.textContent = commits;
    dateEl.textContent = new Date().toDateString();

    certificate.classList.remove("hidden");

  } catch (err) {
    alert("Unable to fetch data");
    console.error(err);
  }
}

/* Download PDF */
async function downloadPDF() {
  const cert = document.getElementById("certificate");

  const canvas = await html2canvas(cert, {
    scale: 2,
    useCORS: true
  });

  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const width = 210;
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img, "PNG", 0, 20, width, height);
  pdf.save("Contributor_Certificate.pdf");
}
