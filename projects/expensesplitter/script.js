function split() {
  const amount = document.getElementById("amount").value;
  const people = document.getElementById("people").value;

  if (amount <= 0 || people <= 0) return;

  const perPerson = (amount / people).toFixed(2);
  document.getElementById("result").textContent =
    `Each person pays ₹${perPerson}`;
}