const images = document.querySelectorAll(".slider-images");
const dots = document.querySelectorAll(".dots");

let idx = Number(localStorage.getItem("sliderIndex")) || 0;

function showImage(newIdx){
  images[idx].style.display = "none";
  dots[idx].classList.remove("active");

  idx = newIdx;

  images[idx].style.display = "block";
  dots[idx].classList.add("active");

  localStorage.setItem("sliderIndex", idx);
}

document.getElementById("prev").onclick = () =>
  showImage((idx - 1 + images.length) % images.length);

document.getElementById("next").onclick = () =>
  showImage((idx + 1) % images.length);

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => showImage(i));
});

showImage(idx);
