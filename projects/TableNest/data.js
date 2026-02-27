let booking = JSON.parse(localStorage.getItem("booking")) || {};
let selectedSeats = JSON.parse(localStorage.getItem("seats")) || [];

function saveData() {
  localStorage.setItem("booking", JSON.stringify(booking));
  localStorage.setItem("seats", JSON.stringify(selectedSeats));
}
