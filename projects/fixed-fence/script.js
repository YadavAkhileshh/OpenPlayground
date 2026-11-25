const widthControl = document.querySelector('#width');
const garden = document.querySelector('#garden');
const feedback = document.querySelector('#feedback');
const recorded = new Set();

function measure() {
  const width = Number(widthControl.value);
  const length = 12 - width;
  return { width, length, area: width * length };
}

function showGarden() {
  const { width, length, area } = measure();
  document.querySelector('#width-value').textContent = width + ' m';
  document.querySelector('#dimensions').textContent = width + ' m wide × ' + length + ' m long';
  document.querySelector('#area').textContent = area + ' m²';
  garden.setAttribute('aria-label', width + ' by ' + length + ' rectangle, one square per square metre');
  const cells = document.createDocumentFragment();
  for (let row = 0; row < length; row++) {
    for (let col = 0; col < width; col++) {
      const square = document.createElement('span');
      square.className = 'plot';
      square.style.gridColumn = col + 1 + Math.floor((11 - width) / 2);
      square.style.gridRow = row + 1 + Math.floor((11 - length) / 2);
      cells.append(square);
    }
  }
  garden.replaceChildren(cells);
}

function recordGarden() {
  const { width, length, area } = measure();
  if (recorded.has(width)) {
    feedback.textContent = 'You already recorded this width. Try a different one.';
    return;
  }
  recorded.add(width);
  document.querySelector('#empty')?.remove();
  const note = document.createElement('li');
  note.textContent = width + ' m × ' + length + ' m = ' + area + ' m²';
  document.querySelector('#notes').append(note);
  if (width === 6) {
    feedback.textContent = '36 m² is the maximum. Move one metre from one side of this square to the other: 5 × 7 gives 35 m².';
  } else if (recorded.has(length)) {
    feedback.textContent = 'Your notes show a matching area: turning a rectangle leaves its area and fence length unchanged.';
  } else {
    feedback.textContent = 'Garden recorded. Try bringing the two side lengths closer together.';
  }
}

widthControl.addEventListener('input', showGarden);
document.querySelector('#record').addEventListener('click', recordGarden);
showGarden();
