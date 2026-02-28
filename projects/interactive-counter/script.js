let count = 0;

function increase() {
  count++;
  update();
}

function decrease() {
  if (count > 0) count--;
  update();
}

function update() {
  document.getElementById("value").innerText = count;

  if (count === 0) {
    document.getElementById("status").innerText = "Neutral state";
  } else if (count % 2 === 0) {
    document.getElementById("status").innerText = "Even number detected";
  } else {
    document.getElementById("status").innerText = "Odd number detected";
  }
}