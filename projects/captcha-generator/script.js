const captchaText = document.getElementById("captchaText");
const refreshBtn = document.getElementById("refreshBtn");
const verifyBtn = document.getElementById("verifyBtn");
const captchaInput = document.getElementById("captchaInput");
const message = document.getElementById("message");

let currentCaptcha = "";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  currentCaptcha = captcha;
  captchaText.textContent = captcha;
}

verifyBtn.addEventListener("click", () => {
  if (captchaInput.value === currentCaptcha) {
    message.textContent = "✅ Verification successful";
    message.style.color = "green";
  } else {
    message.textContent = "❌ Incorrect captcha";
    message.style.color = "red";
    generateCaptcha();
  }
  captchaInput.value = "";
});

refreshBtn.addEventListener("click", generateCaptcha);

generateCaptcha();
