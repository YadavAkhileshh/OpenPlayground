const clock = document.getElementById('clock');
const dateEl = document.getElementById('date');

const DIGITS = {
  0: [1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  1: [0,1,0, 1,1,0, 0,1,0, 0,1,0, 1,1,1],
  2: [1,1,1, 0,0,1, 1,1,1, 1,0,0, 1,1,1],
  3: [1,1,1, 0,0,1, 0,1,1, 0,0,1, 1,1,1],
  4: [1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1],
  5: [1,1,1, 1,0,0, 1,1,1, 0,0,1, 1,1,1],
  6: [1,1,1, 1,0,0, 1,1,1, 1,0,1, 1,1,1],
  7: [1,1,1, 0,0,1, 0,1,0, 0,1,0, 0,1,0],
  8: [1,1,1, 1,0,1, 1,1,1, 1,0,1, 1,1,1],
  9: [1,1,1, 1,0,1, 1,1,1, 0,0,1, 1,1,1]
};

function createDigit(num) {
  const digit = document.createElement('div');
  digit.className = 'digit';

  DIGITS[num].forEach(bit => {
    const pixel = document.createElement('div');
    pixel.className = 'pixel' + (bit ? ' on' : '');
    digit.appendChild(pixel);
  });

  return digit;
}

function createSeparator() {
  const sep = document.createElement('div');
  sep.className = 'separator';

  for (let i = 0; i < 5; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    sep.appendChild(pixel);
  }

  return sep;
}

function updateClock() {
  clock.innerHTML = '';

  const now = new Date();

  // ---- TIME ----
  const time = now
    .toTimeString()
    .slice(0, 8) // HH:MM:SS
    .replace(/:/g, '');

  [...time].forEach((char, index) => {
    clock.appendChild(createDigit(char));

    if (index === 1 || index === 3) {
      clock.appendChild(createSeparator());
    }
  });

  // ---- DATE ----
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

updateClock();
setInterval(updateClock, 1000);
