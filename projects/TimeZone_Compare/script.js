const tzA = document.getElementById("tzA");
const tzB = document.getElementById("tzB");
const workHours = document.getElementById("workHours");
const swapBtn = document.getElementById("swapBtn");

const timeA = document.getElementById("timeA");
const timeB = document.getElementById("timeB");
const dateA = document.getElementById("dateA");
const dateB = document.getElementById("dateB");
const locAName = document.getElementById("locAName");
const locBName = document.getElementById("locBName");

const diffText = document.getElementById("diffText");
const overlapText = document.getElementById("overlapText");

const bar = document.getElementById("bar");

const ZONES = [
  { name: "India (IST) - Asia/Kolkata", tz: "Asia/Kolkata" },
  { name: "Dubai (GST) - Asia/Dubai", tz: "Asia/Dubai" },
  { name: "London (GMT) - Europe/London", tz: "Europe/London" },
  { name: "Paris (CET) - Europe/Paris", tz: "Europe/Paris" },
  { name: "New York (ET) - America/New_York", tz: "America/New_York" },
  { name: "Chicago (CT) - America/Chicago", tz: "America/Chicago" },
  { name: "Los Angeles (PT) - America/Los_Angeles", tz: "America/Los_Angeles" },
  { name: "Tokyo (JST) - Asia/Tokyo", tz: "Asia/Tokyo" },
  { name: "Singapore (SGT) - Asia/Singapore", tz: "Asia/Singapore" },
  { name: "Sydney (AEST) - Australia/Sydney", tz: "Australia/Sydney" },
];

function fillZones() {
  for (const z of ZONES) {
    const optA = document.createElement("option");
    optA.value = z.tz;
    optA.textContent = z.name;
    tzA.appendChild(optA);

    const optB = document.createElement("option");
    optB.value = z.tz;
    optB.textContent = z.name;
    tzB.appendChild(optB);
  }

  tzA.value = "Asia/Kolkata";
  tzB.value = "America/New_York";
}

function formatTimeInTZ(date, tz) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: tz
  }).format(date);
}

function formatDateInTZ(date, tz) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: tz
  }).format(date);
}

// Get "timezone offset" for a specific timezone at a specific moment (minutes)
function getOffsetMinutes(date, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = dtf.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (asUTC - date.getTime()) / 60000;
}

function hourInRange(hour, start, end) {
  // end exclusive
  return hour >= start && hour < end;
}

function convertHourBetweenTZ(baseDate, fromTZ, toTZ, hour) {
  // Create "hour moment" in fromTZ by calculating offset difference
  const d = new Date(baseDate);

  // Use today's date but set UTC hour approx, then adjust using offsets
  d.setUTCHours(hour, 0, 0, 0);

  const fromOff = getOffsetMinutes(d, fromTZ);
  const toOff = getOffsetMinutes(d, toTZ);

  // If fromTZ is ahead, hour shifts when converting to toTZ
  const hourShift = Math.round((toOff - fromOff) / 60);

  let converted = hour + hourShift;
  converted = ((converted % 24) + 24) % 24;
  return converted;
}

function buildTimeline(fromTZ, toTZ, startHour, endHour) {
  bar.innerHTML = "";

  // Mark work hours for A on A timeline
  // Mark work hours for B converted onto A timeline
  for (let h = 0; h < 24; h++) {
    const cell = document.createElement("div");
    cell.classList.add("hour");

    const aWork = hourInRange(h, startHour, endHour);

    const bStartOnA = convertHourBetweenTZ(new Date(), toTZ, fromTZ, startHour);
    const bEndOnA = convertHourBetweenTZ(new Date(), toTZ, fromTZ, endHour);

    let bWork = false;

    // Handle wrap-around ranges
    if (bStartOnA < bEndOnA) {
      bWork = hourInRange(h, bStartOnA, bEndOnA);
    } else {
      bWork = hourInRange(h, bStartOnA, 24) || hourInRange(h, 0, bEndOnA);
    }

    if (aWork && bWork) cell.classList.add("o");
    else if (aWork) cell.classList.add("a");
    else if (bWork) cell.classList.add("b");

    cell.title = `${h}:00`;
    bar.appendChild(cell);
  }
}

function getZoneLabel(tz) {
  const found = ZONES.find(z => z.tz === tz);
  return found ? found.name.split(" - ")[0] : tz;
}

function calculateDifference(tz1, tz2) {
  const now = new Date();
  const off1 = getOffsetMinutes(now, tz1);
  const off2 = getOffsetMinutes(now, tz2);
  const diff = (off2 - off1) / 60;
  return diff;
}

function render() {
  const now = new Date();
  const zoneA = tzA.value;
  const zoneB = tzB.value;

  locAName.textContent = getZoneLabel(zoneA);
  locBName.textContent = getZoneLabel(zoneB);

  timeA.textContent = formatTimeInTZ(now, zoneA);
  timeB.textContent = formatTimeInTZ(now, zoneB);

  dateA.textContent = formatDateInTZ(now, zoneA);
  dateB.textContent = formatDateInTZ(now, zoneB);

  const diff = calculateDifference(zoneA, zoneB);

  if (diff === 0) {
    diffText.textContent = "Same time zone (0 hours difference).";
  } else if (diff > 0) {
    diffText.textContent = `Location B is ${diff} hour(s) ahead of Location A.`;
  } else {
    diffText.textContent = `Location B is ${Math.abs(diff)} hour(s) behind Location A.`;
  }

  const [startHour, endHour] = workHours.value.split("-").map(Number);

  // Overlap window based on A's working hours in B timezone:
  const startInB = convertHourBetweenTZ(now, zoneA, zoneB, startHour);
  const endInB = convertHourBetweenTZ(now, zoneA, zoneB, endHour);

  overlapText.textContent =
    `If A works ${startHour}:00–${endHour}:00, then in B it is approx ${startInB}:00–${endInB}:00.`;

  buildTimeline(zoneA, zoneB, startHour, endHour);
}

swapBtn.addEventListener("click", () => {
  const temp = tzA.value;
  tzA.value = tzB.value;
  tzB.value = temp;
  render();
});

tzA.addEventListener("change", render);
tzB.addEventListener("change", render);
workHours.addEventListener("change", render);

fillZones();
render();

// Update times every second for smoothness
setInterval(render, 1000);
