const passwordInput = document.getElementById("password");
const indicator = document.getElementById("strength-indicator");
const strengthText = document.getElementById("strength-text");
const toggle = document.getElementById("toggle");
const suggestionsBox = document.getElementById("suggestions");
const generateBtn = document.getElementById("generate-btn");

const rules = {
  length: document.getElementById("length"),
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  number: document.getElementById("number"),
  special: document.getElementById("special"),
};

toggle.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  let score = 0;
  let suggestions = [];

  if (password.length >= 8) {
    score++;
    rules.length.classList.add("valid");
  } else {
    rules.length.classList.remove("valid");
    suggestions.push("Add at least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score++;
    rules.uppercase.classList.add("valid");
  } else {
    rules.uppercase.classList.remove("valid");
    suggestions.push("Add an uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score++;
    rules.lowercase.classList.add("valid");
  } else {
    rules.lowercase.classList.remove("valid");
    suggestions.push("Add a lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score++;
    rules.number.classList.add("valid");
  } else {
    rules.number.classList.remove("valid");
    suggestions.push("Add a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
    rules.special.classList.add("valid");
  } else {
    rules.special.classList.remove("valid");
    suggestions.push("Add a special character");
  }

  if (score <= 2) {
    indicator.style.width = "30%";
    indicator.style.background = "#dc2626";
    strengthText.textContent = "Weak Password";
  } else if (score <= 4) {
    indicator.style.width = "70%";
    indicator.style.background = "#facc15";
    strengthText.textContent = "Medium Password";
  } else {
    indicator.style.width = "100%";
    indicator.style.background = "#16a34a";
    strengthText.textContent = "Strong Password";
  }

  suggestionsBox.innerHTML =
    suggestions.length > 0
      ? "Suggestions:<br>• " + suggestions.join("<br>• ")
      : "Great! Your password is strong 🔐";
});

function generateStrongPassword(length = 12) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+[]{}<>?/";

  // Ensure at least one character from each category
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  const allChars = upper + lower + numbers + special;

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle password to avoid predictable order
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

generateBtn.addEventListener("click", () => {
  const newPassword = generateStrongPassword();
  passwordInput.value = newPassword;

  // Trigger input event so strength checker updates
  passwordInput.dispatchEvent(new Event("input"));
});

generateBtn.addEventListener("click", () => {
  const newPassword = generateStrongPassword();
  passwordInput.value = newPassword;

  // Trigger strength check
  passwordInput.dispatchEvent(new Event("input"));

  // Glow feedback
  generateBtn.classList.add("glow");
  setTimeout(() => generateBtn.classList.remove("glow"), 800);
});

