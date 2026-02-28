// Store alarms
let alarms = [];
let alarmIdCounter = 0;

function updateClock() {
    const now = new Date();
    
    // Get hours and determine AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    // Get minutes and seconds
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update time display with leading zeros
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    
    // Update AM/PM
    document.getElementById('ampm').textContent = ampm;
    
    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('date').textContent = dateString;
    
    // Check alarms
    checkAlarms(hours, minutes, seconds, ampm);
}

// Set Alarm
document.getElementById('setAlarm').addEventListener('click', function() {
    const hour = parseInt(document.getElementById('alarmHour').value);
    const minute = parseInt(document.getElementById('alarmMinute').value);
    const period = document.getElementById('alarmPeriod').value;
    
    if (!hour || minute === null || isNaN(minute)) {
        showStatus('Please enter valid time!', 'error');
        return;
    }
    
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        showStatus('Invalid time! Hour: 1-12, Minute: 0-59', 'error');
        return;
    }
    
    const alarm = {
        id: alarmIdCounter++,
        hour: hour,
        minute: minute,
        period: period,
        active: true,
        ringing: false
    };
    
    alarms.push(alarm);
    displayAlarms();
    showStatus(`Alarm set for ${formatTime(hour, minute, period)}`, 'success');
    
    // Clear inputs
    document.getElementById('alarmHour').value = '';
    document.getElementById('alarmMinute').value = '';
});

function formatTime(hour, minute, period) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

function displayAlarms() {
    const alarmsList = document.getElementById('alarmsList');
    alarmsList.innerHTML = '';
    
    alarms.forEach(alarm => {
        const alarmDiv = document.createElement('div');
        alarmDiv.className = 'alarm-item';
        if (alarm.active) alarmDiv.classList.add('active');
        if (alarm.ringing) alarmDiv.classList.add('ringing');
        
        alarmDiv.innerHTML = `
            <div class="alarm-time">${formatTime(alarm.hour, alarm.minute, alarm.period)}</div>
            <div class="alarm-controls">
                ${alarm.ringing ? '<button class="stop-btn" onclick="stopAlarm(' + alarm.id + ')">Stop</button>' : ''}
                <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">Delete</button>
            </div>
        `;
        
        alarmsList.appendChild(alarmDiv);
    });
}

function checkAlarms(currentHour, currentMinute, currentSecond, currentPeriod) {
    alarms.forEach(alarm => {
        if (alarm.active && !alarm.ringing) {
            if (alarm.hour === currentHour && 
                alarm.minute === currentMinute && 
                alarm.period === currentPeriod &&
                currentSecond === 0) {
                triggerAlarm(alarm);
            }
        }
    });
}

function triggerAlarm(alarm) {
    alarm.ringing = true;
    const audio = document.getElementById('alarmSound');
    audio.play();
    displayAlarms();
    showStatus(` ALARM RINGING! ${formatTime(alarm.hour, alarm.minute, alarm.period)}`, 'alarm');
}

function stopAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.ringing = false;
        alarm.active = false;
        const audio = document.getElementById('alarmSound');
        audio.pause();
        audio.currentTime = 0;
        displayAlarms();
        showStatus('Alarm stopped', 'success');
    }
}

function deleteAlarm(id) {
    const index = alarms.findIndex(a => a.id === id);
    if (index > -1) {
        if (alarms[index].ringing) {
            const audio = document.getElementById('alarmSound');
            audio.pause();
            audio.currentTime = 0;
        }
        alarms.splice(index, 1);
        displayAlarms();
        showStatus('Alarm deleted', 'success');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('alarmStatus');
    statusDiv.textContent = message;
    statusDiv.style.color = type === 'error' ? '#ff4757' : 
                           type === 'alarm' ? '#ffa502' : '#00ff88';
    
    setTimeout(() => {
        if (!alarms.some(a => a.ringing)) {
            statusDiv.textContent = '';
        }
    }, 3000);
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);