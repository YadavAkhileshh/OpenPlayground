const input = document.getElementById("logicInput");
const output = document.getElementById("humanResponse");
const marker = document.getElementById("marker");

input.oninput = function () {
  const val = input.value.toLowerCase();
  if (val.includes("fatal") || val.includes("error")) {
    output.innerText =
      "The system is experiencing a moment of profound distress and isolation.";
    marker.style.left = "10%";
  } else if (val.includes("success") || val.includes("true")) {
    output.innerText =
      "The AI feels a sense of accomplishment and harmonious alignment.";
    marker.style.left = "90%";
  } else {
    output.innerText = "The intelligence is in a state of quiet contemplation.";
    marker.style.left = "50%";
  }
};
