const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const modal = document.getElementById("eventModal");
const eventInput = document.getElementById("eventInput");

let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};

// Render calendar
function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  monthYear.textContent =
    currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const dayBox = document.createElement("div");
    dayBox.className = "day";
    dayBox.innerHTML = `<strong>${day}</strong>`;

    if (events[dateKey]) {
      const ev = document.createElement("div");
      ev.className = "event";
      ev.textContent = events[dateKey];
      dayBox.appendChild(ev);
    }

    dayBox.onclick = () => {
      selectedDate = dateKey;
      eventInput.value = events[dateKey] || "";
      modal.style.display = "block";
    };

    calendar.appendChild(dayBox);
  }
}

// Save event
document.getElementById("saveEvent").onclick = () => {
  if (selectedDate) {
    events[selectedDate] = eventInput.value;
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.style.display = "none";
    renderCalendar();
  }
};

// Close modal
document.getElementById("closeModal").onclick = () => {
  modal.style.display = "none";
};

// Navigation
document.getElementById("prev").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// Init
renderCalendar();