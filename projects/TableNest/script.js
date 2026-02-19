function saveBooking() {
  booking.name = document.getElementById("name").value;
  booking.date = document.getElementById("date").value;
  booking.time = document.getElementById("time").value;

  if (!booking.name || !booking.date || !booking.time) {
    alert("Please fill all details!");
    return;
  }

  saveData();
  window.location.href = "seats.html";
}

/* Seat Selection Page */
function loadSeats() {
  let grid = document.getElementById("seatGrid");
  if (!grid) return;

  for (let i = 1; i <= 18; i++) {
    let seat = document.createElement("div");
    seat.classList.add("seat");
    seat.innerText = i;

    if (selectedSeats.includes(i)) {
      seat.classList.add("selected");
    }

    seat.onclick = () => toggleSeat(i, seat);
    grid.appendChild(seat);
  }
}

function toggleSeat(num, seatDiv) {
  if (selectedSeats.includes(num)) {
    selectedSeats = selectedSeats.filter(s => s !== num);
    seatDiv.classList.remove("selected");
  } else {
    selectedSeats.push(num);
    seatDiv.classList.add("selected");
  }
  saveData();
}

function confirmSeats() {
  if (selectedSeats.length === 0) {
    alert("Please select at least one seat!");
    return;
  }
  saveData();
  window.location.href = "confirmation.html";
}

function loadSummary() {
  let summary = document.getElementById("summary");
  if (!summary) return;

  summary.innerHTML = `
    <strong>Name:</strong> ${booking.name}<br>
    <strong>Date:</strong> ${booking.date}<br>
    <strong>Time:</strong> ${booking.time}<br>
    <strong>Seats:</strong> ${selectedSeats.join(", ")}
  `;
}

loadSeats();
loadSummary();
