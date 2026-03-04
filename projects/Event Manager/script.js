const form = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

let events = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const event = {
    title: title.value,
    date: date.value,
    time: time.value,
    location: location.value,
    description: description.value
  };

  events.push(event);
  displayEvents();
  form.reset();
});

function displayEvents() {
  eventList.innerHTML = "";

  events.forEach((event, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${event.title}</strong><br>
      📅 ${event.date} ⏰ ${event.time}<br>
      📍 ${event.location}<br>
      <em>${event.description}</em>

      <div class="event-actions">
        <button onclick="deleteEvent(${index})">Delete</button>
      </div>
    `;

    eventList.appendChild(li);
  });
}

function deleteEvent(index) {
  events.splice(index, 1);
  displayEvents();
}
