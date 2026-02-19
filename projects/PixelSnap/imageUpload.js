const input = document.getElementById("imageInput");

input.addEventListener("change", function () {
  const file = input.files[0];

  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = function () {
    pixelate(img);
  };
});
