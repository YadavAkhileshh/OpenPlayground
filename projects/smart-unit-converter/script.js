const units = {
  length: ["Meters", "Kilometers"],
  weight: ["Grams", "Kilograms"],
  temperature: ["Celsius", "Fahrenheit"]
};

const type = document.getElementById("type");
const from = document.getElementById("from");
const to = document.getElementById("to");

function resetUnits() {
  from.innerHTML = "";
  to.innerHTML = "";

  units[type.value].forEach(unit => {
    from.innerHTML += `<option>${unit}</option>`;
    to.innerHTML += `<option>${unit}</option>`;
  });
}

resetUnits();

function convert() {
  const value = Number(document.getElementById("value").value);
  let result = value;

  if (type.value === "length" && from.value !== to.value) {
    result = from.value === "Meters" ? value / 1000 : value * 1000;
  }

  if (type.value === "weight" && from.value !== to.value) {
    result = from.value === "Grams" ? value / 1000 : value * 1000;
  }

  if (type.value === "temperature") {
    if (from.value === "Celsius" && to.value === "Fahrenheit") {
      result = value * 9 / 5 + 32;
    }
    if (from.value === "Fahrenheit" && to.value === "Celsius") {
      result = (value - 32) * 5 / 9;
    }
  }

  document.getElementById("result").innerText =
    `Result: ${result.toFixed(2)}`;
}