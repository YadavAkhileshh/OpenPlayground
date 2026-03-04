const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 520;
canvas.height = 280;

function pixelate(img) {
  const pixelSize = 12;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let y = 0; y < canvas.height; y += pixelSize) {
    for (let x = 0; x < canvas.width; x += pixelSize) {
      let index = (y * canvas.width + x) * 4;

      let r = data[index];
      let g = data[index + 1];
      let b = data[index + 2];

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}
