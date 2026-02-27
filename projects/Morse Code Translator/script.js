const MORSE = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "/": "-..-.",
  "=": "-...-",
};
const RMORSE = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
);

function textToMorse(text) {
  return text
    .toUpperCase()
    .split("")
    .map((c) => {
      if (c === " ") return "/";
      return MORSE[c] || "";
    })
    .filter((x) => x !== undefined)
    .join(" ");
}

function morseToText(morse) {
  return morse
    .trim()
    .split(" / ")
    .map((word) =>
      word
        .split(" ")
        .map((code) => RMORSE[code] || "?")
        .join(""),
    )
    .join(" ");
}

const textInput = document.getElementById("textInput");
const morseInput = document.getElementById("morseInput");
const morseDisplay = document.getElementById("morseDisplay");
const bulb = document.getElementById("bulb");
const beam = document.getElementById("beam");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const speedSlider = document.getElementById("speedSlider");

let playing = false;
let stopFlag = false;
let audioCtx = null;

textInput.addEventListener("input", () => {
  const m = textToMorse(textInput.value);
  morseInput.value = m;
  morseDisplay.textContent = m;
});
morseInput.addEventListener("input", () => {
  textInput.value = morseToText(morseInput.value);
  morseDisplay.textContent = morseInput.value;
});

function getAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(duration, freq = 700) {
  return new Promise((res) => {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ac.currentTime + duration / 1000,
    );
    osc.start();
    osc.stop(ac.currentTime + duration / 1000);
    bulb.classList.add("lit");
    beam.classList.add("lit");
    setTimeout(() => {
      bulb.classList.remove("lit");
      beam.classList.remove("lit");
      res();
    }, duration);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function transmit() {
  const speed = parseInt(speedSlider.value);
  const dot = speed;
  const dash = dot * 3;
  const gap = dot;
  const letterGap = dot * 3;
  const wordGap = dot * 7;

  const morse = morseInput.value || textToMorse(textInput.value);
  if (!morse) return;

  playing = true;
  stopFlag = false;
  playBtn.disabled = true;

  const tokens = morse.split(" ");
  let i = 0;
  for (const token of tokens) {
    if (stopFlag) break;
    if (token === "/") {
      await sleep(wordGap);
    } else {
      for (const sym of token) {
        if (stopFlag) break;
        if (sym === ".") await beep(dot);
        else if (sym === "-") await beep(dash);
        if (!stopFlag) await sleep(gap);
      }
      if (!stopFlag) await sleep(letterGap);
    }
  }

  playing = false;
  playBtn.disabled = false;
  bulb.classList.remove("lit");
  beam.classList.remove("lit");
}

playBtn.addEventListener("click", () => {
  if (!playing) transmit();
});
stopBtn.addEventListener("click", () => {
  stopFlag = true;
});

// Build reference grid
const refGrid = document.getElementById("refGrid");
Object.entries(MORSE).forEach(([char, code]) => {
  const div = document.createElement("div");
  div.className = "ref-item";
  div.innerHTML = `<span class="ref-char">${char}</span><span class="ref-code">${code}</span>`;
  refGrid.appendChild(div);
});
