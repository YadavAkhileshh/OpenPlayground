function convertTime() {
    const timeInput = document.getElementById('time').value;
    const fromZone = parseFloat(document.getElementById('fromZone').value);
    const toZone = parseFloat(document.getElementById('toZone').value);

    if (!timeInput) {
        document.getElementById('result').innerText = "Please select a time.";
        return;
    }

    const [hours, minutes] = timeInput.split(':').map(Number);

    // Convert to UTC
    let utcHours = hours - fromZone;

    // Convert to target timezone
    let targetHours = utcHours + toZone;

    // Handle overflow
    if (targetHours >= 24) targetHours -= 24;
    if (targetHours < 0) targetHours += 24;

    const formattedHours = targetHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    document.getElementById('result').innerText = `Converted Time: ${formattedHours}:${formattedMinutes}`;

}