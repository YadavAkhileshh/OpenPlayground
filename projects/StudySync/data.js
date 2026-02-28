let plans = JSON.parse(localStorage.getItem("plans")) || [];

function savePlans() {
  localStorage.setItem("plans", JSON.stringify(plans));
}
