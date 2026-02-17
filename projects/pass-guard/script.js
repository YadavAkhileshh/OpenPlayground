const passwordInput = document.getElementById("password");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  updateStrength(strength);
});

function updateStrength(level) {
  if (level === 0) {
    strengthFill.style.width = "0%";
    strengthText.textContent = "Strength: —";
  } else if (level === 1) {
    strengthFill.style.width = "25%";
    strengthFill.style.background = "#ef4444";
    strengthText.textContent = "Strength: Weak";
  } else if (level === 2) {
    strengthFill.style.width = "50%";
    strengthFill.style.background = "#f97316";
    strengthText.textContent = "Strength: Medium";
  } else if (level === 3) {
    strengthFill.style.width = "75%";
    strengthFill.style.background = "#eab308";
    strengthText.textContent = "Strength: Good";
  } else {
    strengthFill.style.width = "100%";
    strengthFill.style.background = "#22c55e";
    strengthText.textContent = "Strength: Strong";
  }
}