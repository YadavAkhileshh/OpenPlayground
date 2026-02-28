const excuses = {
  work: [
    "My internet stopped working suddenly.",
    "There was an unexpected system crash.",
    "I had an urgent family situation.",
    "My laptop battery died without warning.",
    "An urgent client meeting came up.",
    "I had to fix a high-priority bug.",
    "I missed an important email with instructions.",
    "I had to cover for a teammate unexpectedly."
  ],
  school: [
    "I was revising the wrong syllabus.",
    "The online class link was not opening.",
    "I submitted the file but it didn’t upload.",
    "There was a power cut during study time.",
    "I had a conflicting exam I forgot about.",
    "My group project files were lost.",
    "I misread the deadline on the assignment.",
    "The lab equipment wasn't working."
  ],
  technical: [
    "My computer wouldn't boot this morning.",
    "Software dependencies failed and blocked progress.",
    "I forgot to push changes to the repository.",
    "VPN or network restrictions prevented access.",
    "A hard drive/glitch corrupted my files.",
    "Printer/scanner hardware jammed when I needed it.",
    "An unexpected system update delayed my work."
  ],
  social: [
    "I lost track of time while helping a friend.",
    "An unexpected family visit came up.",
    "I was double-booked and couldn't make it.",
    "I had to attend an important appointment.",
    "I was feeling unwell and needed rest.",
    "I got held up at an event that ran late."
  ],
  general: [
    "I lost track of time.",
    "Something unexpected came up.",
    "I completely forgot today’s date.",
    "I was stuck in traffic longer than expected.",
    "Public transport delays caused me to be late.",
    "My pet needed urgent care this morning."
  ]
};

const categorySelect = document.getElementById("category");
const excuseText = document.getElementById("excuse");
const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const randomIndex = Math.floor(Math.random() * excuses[category].length);
  const excuse = excuses[category][randomIndex];
  excuseText.textContent = excuse;

  // brief visual feedback for new excuse
  excuseText.classList.remove('generate-flash');
  // force reflow to restart animation
  void excuseText.offsetWidth;
  excuseText.classList.add('generate-flash');
  setTimeout(() => excuseText.classList.remove('generate-flash'), 300);
});
