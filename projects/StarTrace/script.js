const dateInput = document.getElementById("dateInput");
const spinner = document.getElementById("spinner");
const apodBox = document.getElementById("apodBox");
const milestoneBox = document.getElementById("milestone");
const milestoneContent = document.getElementById("milestoneContent");

const title = document.getElementById("title");
const dateText = document.getElementById("dateText");
const media = document.getElementById("media");
const explanation = document.getElementById("explanation");

// Get accurate local today’s date
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const localToday = `${year}-${month}-${day}`;

// Restrict future dates in input
dateInput.setAttribute("max", localToday);

let milestones = [];

// Load milestones from JSON
async function loadMilestones() {
  try {
    const res = await fetch('milestones.json');
    milestones = await res.json();
  } catch (error) {
    console.error("Failed to load milestone.json:", error);
  }
}

// Show today’s milestones on page load
window.addEventListener('DOMContentLoaded', async () => {
  await loadMilestones();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;

  // Set today's date as default in input
  dateInput.value = localToday;

  // Load today's milestones
  const todayMilestones = milestones.filter(m => m.month === Number(month) && m.day === Number(day));
  if (todayMilestones.length > 0) {
    milestoneContent.innerHTML = todayMilestones.map(m => `
      <div class="milestone-entry">
        <strong>${m.year} — ${m.title}</strong><br />
        <em>${m.country}</em>: ${m.description}
      </div>
    `).join("");
  } else {
    milestoneContent.innerHTML = `
      <div class="milestone-entry no-milestone">
        🚫 No milestones for this day.
      </div>
    `;
  }
  milestoneBox.classList.remove("hidden");

  // Trigger APOD fetch on load
  dateInput.dispatchEvent(new Event('change'));
});

// Handle date selection and APOD fetch
dateInput.addEventListener("change", async () => {
  const selectedDate = dateInput.value;
  if (!selectedDate) return;

  spinner.classList.remove("hidden");
  apodBox.classList.add("hidden");
  milestoneBox.classList.add("hidden");

  const [year, month, day] = selectedDate.split("-").map(Number);

  try {
    const response = await fetch(`/api/apod?date=${selectedDate}`);

    if (!response.ok) {
      throw new Error("APOD not available for this date yet.");
    }

    const data = await response.json();

    // Show APOD
    title.textContent = data.title;
    dateText.textContent = data.date;
    explanation.textContent = data.explanation;

    media.innerHTML = data.media_type === "image"
      ? `<img src="${data.url}" alt="NASA APOD Image" />`
      : `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`;

    apodBox.classList.remove("hidden");

  } catch (error) {
    console.warn("Error fetching APOD:", error);

    // Fallback for missing APOD
    apodBox.classList.remove("hidden");
    title.textContent = "SPOD Not Available Yet";
    dateText.textContent = selectedDate;
    media.innerHTML = `<p style="color: white;">The Space Picture of the Day for this date isn't available yet. Please check back later!</p>`;
    explanation.textContent = "";
  } finally {
    // Always check and display milestones
    const todayMilestones = milestones.filter(m => m.month === month && m.day === day);
    if (todayMilestones.length > 0) {
      milestoneContent.innerHTML = todayMilestones.map(m => `
        <div class="milestone-entry">
          <strong>${m.year} — ${m.title}</strong><br />
          <em>${m.country}</em>: ${m.description}
        </div>
      `).join("");
    } else {
      milestoneContent.innerHTML = `
        <div class="milestone-entry no-milestone">
          🚫 No milestones for this day.
        </div>
      `;
    }
    milestoneBox.classList.remove("hidden");

    spinner.classList.add("hidden");
  }
});

// Download Image
document.getElementById("downloadBtn").addEventListener("click", () => {
  const img = document.querySelector("#media img");
  if (!img) return alert("Only images can be downloaded.");

  const a = document.createElement("a");
  a.href = img.src;
  a.download = "NASA_APOD.jpg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// Share Button Logic
document.getElementById("shareBtn").addEventListener("click", () => {
  const titleText = title.textContent;
  const date = dateText.textContent;
  const tweetText = `Check out NASA's Astronomy Picture of the Day for ${date}: "${titleText}" 🌌`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=https://apod.nasa.gov/`;
  window.open(tweetUrl, "_blank");
});

// Shooting stars animation
const shootingStarContainer = document.getElementById("shootingStarContainer");
for (let i = 0; i < 10; i++) {
  const star = document.createElement("div");
  star.classList.add("shooting-star");
  star.style.top = `${Math.random() * 80}vh`;
  star.style.left = `${Math.random() * 100}vw`;
  star.style.animationDelay = `${Math.random() * 15}s`;
  star.style.animationDuration = `${2 + Math.random() * 2}s`;
  shootingStarContainer.appendChild(star);
}

// Glowing stars animation
const starContainer = document.getElementById("starContainer");
for (let i = 0; i < 75; i++) {
  const glowStar = document.createElement("div");
  glowStar.classList.add("glowing-star");
  glowStar.style.top = `${Math.random() * 100}vh`;
  glowStar.style.left = `${Math.random() * 100}vw`;
  glowStar.style.animationDelay = `${Math.random() * 5}s`;
  starContainer.appendChild(glowStar);
}

// Scroll to top on load
window.scrollTo({ top: 0, behavior: 'smooth' });
