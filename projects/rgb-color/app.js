const namedColors = [
  'IndianRed', 'LightCoral', 'Salmon', 'DarkSalmon', 'LightSalmon', 'Crimson', 'Red', 'FireBrick', 'DarkRed',
  'Pink', 'LightPink', 'HotPink', 'DeepPink', 'MediumVioletRed', 'PaleVioletRed',
  'Coral', 'Tomato', 'OrangeRed', 'DarkOrange', 'Orange',
  'Gold', 'Yellow', 'LightYellow', 'LemonChiffon', 'LightGoldenrodYellow', 'PapayaWhip', 'Moccasin', 'PeachPuff', 'PaleGoldenrod', 'Khaki', 'DarkKhaki',
  'Lavender', 'Thistle', 'Plum', 'Violet', 'Orchid', 'Fuchsia', 'Magenta', 'MediumOrchid', 'MediumPurple', 'RebeccaPurple', 'BlueViolet', 'DarkViolet', 'DarkOrchid', 'DarkMagenta', 'Purple', 'Indigo', 'SlateBlue', 'DarkSlateBlue', 'MediumSlateBlue',
  'GreenYellow', 'Chartreuse', 'LawnGreen', 'Lime', 'LimeGreen', 'PaleGreen', 'LightGreen', 'MediumSpringGreen', 'SpringGreen', 'MediumSeaGreen', 'SeaGreen', 'ForestGreen', 'Green', 'DarkGreen', 'YellowGreen', 'OliveDrab', 'Olive', 'DarkOliveGreen', 'MediumAquamarine', 'DarkSeaGreen', 'LightSeaGreen', 'DarkCyan', 'Teal',
  'Aqua', 'Cyan', 'LightCyan', 'PaleTurquoise', 'Aquamarine', 'Turquoise', 'MediumTurquoise', 'DarkTurquoise', 'CadetBlue', 'SteelBlue', 'LightSteelBlue', 'PowderBlue', 'LightBlue', 'SkyBlue', 'LightSkyBlue', 'DeepSkyBlue', 'DodgerBlue', 'CornflowerBlue', 'RoyalBlue', 'Blue', 'MediumBlue', 'DarkBlue', 'Navy', 'MidnightBlue',
  'Cornsilk', 'BlanchedAlmond', 'Bisque', 'NavajoWhite', 'Wheat', 'BurlyWood', 'Tan', 'RosyBrown', 'SandyBrown', 'Goldenrod', 'DarkGoldenrod', 'Peru', 'Chocolate', 'SaddleBrown', 'Sienna', 'Brown', 'Maroon',
  'White', 'Snow', 'HoneyDew', 'MintCream', 'Azure', 'AliceBlue', 'GhostWhite', 'WhiteSmoke', 'SeaShell', 'Beige', 'OldLace', 'FloralWhite', 'Ivory', 'AntiqueWhite', 'Linen', 'LavenderBlush', 'MistyRose', 'Gainsboro', 'LightGray', 'Silver', 'DarkGray', 'Gray', 'DimGray', 'LightSlateGray', 'SlateGray', 'DarkSlateGray', 'Black'
];

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function getColorData(colorName) {
  const tempDiv = document.createElement('div');
  tempDiv.style.color = colorName;
  document.body.appendChild(tempDiv);
  const rgb = getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  const match = rgb.match(/\d+/g);
  const [r, g, b] = match.map(Number);
  const [h, s, l] = rgbToHsl(r, g, b);

  return { name: colorName, h, s, l, rgb, r, g, b };
}

const colorData = namedColors.map(getColorData);

colorData.sort((a, b) => {
  const aGray = a.s < 10;
  const bGray = b.s < 10;

  if (aGray && bGray) {
    return a.l - b.l;
  }

  if (aGray) return 1;
  if (bGray) return -1;

  const hueA = a.h;
  const hueB = b.h;

  if (Math.abs(hueA - hueB) > 8) {
    return hueA - hueB;
  }

  if (Math.abs(a.l - b.l) > 15) {
    return b.l - a.l;
  }

  return b.s - a.s;
});

const strips = 20;
const colorsPerStrip = Math.ceil(colorData.length / strips);
const wall = document.getElementById('spectrumWall');

for (let strip = 0; strip < strips; strip++) {
  const colorStrip = document.createElement('div');
  colorStrip.className = 'color-strip';

  const start = strip * colorsPerStrip;
  const end = Math.min(start + colorsPerStrip, colorData.length);

  for (let i = start; i < end; i++) {
    const color = colorData[i];
    const chip = document.createElement('div');
    chip.className = 'chip';

    const front = document.createElement('div');
    front.className = 'chip-front';
    front.style.backgroundColor = color.name;

    const back = document.createElement('div');
    back.className = 'chip-back';

    back.innerHTML = `
      <div>
        <span class="chip-name">${color.name}</span>
        <span class="chip-hex">${rgbToHex(color.rgb)}</span>
      </div>
    `;

    chip.appendChild(front);
    chip.appendChild(back);

    chip.addEventListener('click', (e) => {
      e.stopPropagation();

      const wasFlipped = chip.classList.contains('flipped');
      document.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('flipped');
      });

      if (!wasFlipped) {
        chip.classList.add('flipped');
      }
    });

    colorStrip.appendChild(chip);
  }

  wall.appendChild(colorStrip);
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return '#000000';
  return '#' + result.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}