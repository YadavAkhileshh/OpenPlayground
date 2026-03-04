let timetable = [];

function addSchedule() {
  const faculty = document.getElementById("faculty").value;
  const subject = document.getElementById("subject").value;
  const room = document.getElementById("room").value;
  const slot = document.getElementById("slot").value;

  // Clash check
  let clash = timetable.find(
    t => t.faculty === faculty && t.slot === slot
  );

  let row = document.createElement("tr");
  if (clash) {
    row.classList.add("clash");
    row.innerHTML = `<td>${faculty}</td><td>${subject}</td><td>${room}</td><td>${slot} ⚠ Clash</td>`;
  } else {
    timetable.push({faculty, subject, room, slot});
    row.innerHTML = `<td>${faculty}</td><td>${subject}</td><td>${room}</td><td>${slot}</td>`;
  }

  document.getElementById("timetable").appendChild(row);
}