let Z = document.getElementById("Z");
let result = document.getElementById("result");
let calculateBtn = document.getElementById("calculate-btn");

calculateBtn.addEventListener("click", () => {
  let xValue = parseFloat(document.getElementById("X").value);
  let yValue = parseFloat(document.getElementById("Y").value);

  if (!isNaN(xValue) && !isNaN(yValue)) {
    Z.value = ((xValue * yValue) / 100).toFixed(2);
    result.innerHTML = `${xValue}% of ${yValue} is <span>${Z.value}</span>`;
  } else {
    result.innerHTML = "Inputs cannot be empty!";
  }
});
