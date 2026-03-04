let alarmDateTime = null;
let alarmSound = document.getElementById("alarmSound");

/* ===== ANALOG CLOCK ===== */
function updateAnalogClock() {
    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    document.getElementById("second").style.transform =
        `translateX(-50%) rotate(${secondDeg}deg)`;

    document.getElementById("minute").style.transform =
        `translateX(-50%) rotate(${minuteDeg}deg)`;

    document.getElementById("hour").style.transform =
        `translateX(-50%) rotate(${hourDeg}deg)`;

    // Speed digital clock
    document.getElementById("speedClock").innerText =
        now.toLocaleTimeString() + "." + Math.floor(now.getMilliseconds()/10);
}

setInterval(updateAnalogClock, 50);

/* ===== ALARM ===== */
function setAlarm() {
    let date = document.getElementById("alarmDate").value;
    let time = document.getElementById("alarmTime").value;

    if (!date || !time) return;

    alarmDateTime = new Date(date + "T" + time);

    document.getElementById("alarmStatus").innerText =
        "Alarm set for " + alarmDateTime.toLocaleString();
}

setInterval(() => {
    let now = new Date();

    if (alarmDateTime && now >= alarmDateTime) {
        document.getElementById("popup").style.display = "flex";
        alarmSound.play();
        alarmDateTime = null;
    }
}, 1000);

function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    document.getElementById("popup").style.display = "none";
}

document.getElementById("ringtoneInput").addEventListener("change", function(e){
    let file = e.target.files[0];
    if(file){
        alarmSound.src = URL.createObjectURL(file);
    }
});

/* ===== CALENDAR ===== */
function generateCalendar() {
    let cal = document.getElementById("calendar");
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    let totalDays = new Date(year, month+1, 0).getDate();

    for(let i=1;i<=totalDays;i++){
        let div = document.createElement("div");
        div.className="day";
        div.innerText=i;
        cal.appendChild(div);
    }
}

generateCalendar();