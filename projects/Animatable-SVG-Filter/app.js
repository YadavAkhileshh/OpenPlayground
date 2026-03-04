// your code goes here
const turbulence = document.getElementById("turbulence");
const scale = document.getElementById("displacement");

const sliders = document.querySelectorAll("input");
const wrap = document.querySelector("#svgwrap");
const body = document.body;

document.querySelectorAll("input").forEach((slider, i) => {
  slider.addEventListener("input", (e) => {
    if (sliders[i].checked) {
      body.classList.add("class-" + i);
    } else {
      body.classList.remove("class-" + i);
    }
    if (!sliders[6].checked || sliders[7].checked) {
      document.getElementById("shift").checked = false;
      body.classList.remove("class-9");
    }
    turbulence.setAttribute(
      "baseFrequency",
      "0.00" + sliders[2].value + " 0.00" + sliders[3].value
    );
    scale.setAttribute("scale", sliders[1].value);
    body.style.setProperty("--spread", sliders[4].value);
    body.style.setProperty("--angle", sliders[5].value);
  });
});

// Drag and Drop Image

function readFile() {
  if (!this.files || !this.files[0]) return;

  const FR = new FileReader();

  FR.addEventListener("load", function (evt) {
    body.style.setProperty(
      "--img",
      "url(" + evt.target.result + ") 50% 0px / auto 50vw"
    );
    body.classList.add("class-7");
    sliders[7].setAttribute("checked", "true");
  });

  FR.readAsDataURL(this.files[0]);
}

document.querySelector("#upload").addEventListener("change", readFile);

document.addEventListener(
  "DOMContentLoaded",
  function () {
    sliders[6].setAttribute("checked", "true");
    body.classList.add("class-6");
  },
  false
);
