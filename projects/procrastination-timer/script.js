function startTimer() {
  const messages = [
    "Focus for 5 minutes 💻",
    "Still procrastinating? 👀",
    "Your future self is watching 😐",
    "Okay… maybe start now 😭"
  ];

  document.getElementById("message").innerText = "Timer started ⏱️";

  setTimeout(() => {
    document.getElementById("message").innerText = messages[1];
  }, 3000);

  setTimeout(() => {
    document.getElementById("message").innerText = messages[2];
  }, 6000);

  setTimeout(() => {
    document.getElementById("message").innerText = messages[3];
  }, 9000);
}