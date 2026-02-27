const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty"];

function numToWords(n) {
  if (n === 0) return "zero";
  if (n < 20) return ones[n];
  if (n % 10 === 0) return tens[Math.floor(n / 10)];
  return tens[Math.floor(n / 10)] + "-" + ones[n % 10];
}

function timeToSentence(h, m) {
  const period =
    h < 12
      ? "in the morning"
      : h < 17
        ? "in the afternoon"
        : h < 21
          ? "in the evening"
          : "at night";
  const hour12 = h % 12 || 12;
  if (m === 0) return `It is ${numToWords(hour12)} o'clock ${period}.`;
  if (m === 15) return `It is a quarter past ${numToWords(hour12)} ${period}.`;
  if (m === 30) return `It is half past ${numToWords(hour12)} ${period}.`;
  if (m === 45)
    return `It is a quarter to ${numToWords((hour12 % 12) + 1)} ${period}.`;
  if (m < 30)
    return `It is ${numToWords(m)} past ${numToWords(hour12)} ${period}.`;
  return `It is ${numToWords(60 - m)} to ${numToWords((hour12 % 12) + 1)} ${period}.`;
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const timeEl = document.getElementById("timeText");
const dateEl = document.getElementById("dateText");
const secFill = document.getElementById("secFill");

const highlights = [
  "o'clock",
  "quarter",
  "half",
  "morning",
  "afternoon",
  "evening",
  "night",
  "past",
  "to",
];

function renderText(sentence) {
  timeEl.innerHTML = "";
  const words = sentence.split(" ");
  words.forEach((word, wi) => {
    const span = document.createElement("span");
    span.className = "word";
    const clean = word.replace(/[^a-z'-]/gi, "").toLowerCase();
    const isHL = highlights.some((h) => clean.includes(h));
    [...word].forEach((ch, ci) => {
      const c = document.createElement("span");
      c.className = "char" + (isHL ? " highlight" : "");
      c.textContent = ch;
      c.style.animationDelay = `${(wi * word.length + ci) * 25}ms`;
      span.appendChild(c);
    });
    timeEl.appendChild(span);
    if (wi < words.length - 1) timeEl.appendChild(document.createTextNode(" "));
  });
}

let lastSentence = "";

function update() {
  const now = new Date();
  const h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds();
  const sentence = timeToSentence(h, m);

  if (sentence !== lastSentence) {
    lastSentence = sentence;
    renderText(sentence);
    dateEl.textContent = `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  secFill.style.width = `${(s / 59) * 100}%`;

  // Day/night theming
  document.body.classList.remove("night", "dusk");
  if (h >= 20 || h < 6) document.body.classList.add("night");
  else if ((h >= 17 && h < 20) || (h >= 5 && h < 8))
    document.body.classList.add("dusk");
}

update();
setInterval(update, 1000);
