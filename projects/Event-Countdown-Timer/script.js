
        // DOM Elements
        const eventNameInput = document.getElementById('eventName');
        const eventDateInput = document.getElementById('eventDate');
        const eventTimeInput = document.getElementById('eventTime');
        const displayEventName = document.getElementById('displayEventName');
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        const endedMessage = document.getElementById('endedMessage');
        const pauseResumeBtn = document.getElementById('pauseResumeBtn');
        const resetBtn = document.getElementById('resetBtn');
        const countdownElements = document.querySelectorAll('.time-unit');
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.setAttribute('min', today);
        
        // Set default time to next hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        eventTimeInput.value = `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`;
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        eventDateInput.value = tomorrow.toISOString().split('T')[0];
        
        // State variables
        let countdownInterval = null;
        let isPaused = false;
        let targetDate = null;
        let previousValues = {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        };
        
        // Initialize with default event name
        eventNameInput.value = "New Year's Celebration";
        updateDisplayEventName();
        
        // Event Listeners
        eventNameInput.addEventListener('input', updateDisplayEventName);
        eventDateInput.addEventListener('change', startCountdown);
        eventTimeInput.addEventListener('change', startCountdown);
        pauseResumeBtn.addEventListener('click', togglePauseResume);
        resetBtn.addEventListener('click', resetTimer);
        
        // Start countdown on page load with default values
        window.addEventListener('load', () => {
            startCountdown();
        });
        
        // Update the displayed event name
        function updateDisplayEventName() {
            const name = eventNameInput.value.trim() || "My Event";
            displayEventName.textContent = name;
        }
        
        // Start or restart the countdown
        function startCountdown() {
            // Clear any existing interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Get date and time values
            const dateValue = eventDateInput.value;
            const timeValue = eventTimeInput.value;
            
            if (!dateValue || !timeValue) {
                alert("Please select both a date and time for your event.");
                return;
            }
            
            // Create target date
            targetDate = new Date(`${dateValue}T${timeValue}`);
            
            // Validate target date is in the future
            const now = new Date();
            if (targetDate <= now) {
                alert("Please select a future date and time for your event.");
                return;
            }
            
            // Hide ended message and show countdown
            endedMessage.style.display = 'none';
            countdownElements.forEach(el => el.style.display = 'flex');
            
            // Reset pause state
            isPaused = false;
            pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Countdown';
            pauseResumeBtn.className = 'btn-pause';
            
            // Start countdown
            updateCountdown(); // Initial update
            countdownInterval = setInterval(updateCountdown, 1000);
        }
        
        // Update the countdown display
        function updateCountdown() {
            if (isPaused || !targetDate) return;
            
            const now = new Date().getTime();
            const timeRemaining = targetDate.getTime() - now;
            
            // If countdown has ended
            if (timeRemaining <= 0) {
                endCountdown();
                return;
            }
            
            // Calculate time units
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            
            // Format values as strings with leading zeros
            const daysStr = days.toString().padStart(2, '0');
            const hoursStr = hours.toString().padStart(2, '0');
            const minutesStr = minutes.toString().padStart(2, '0');
            const secondsStr = seconds.toString().padStart(2, '0');
            
            // Update display with animation if values changed
            updateWithAnimation(daysElement, daysStr, 'days');
            updateWithAnimation(hoursElement, hoursStr, 'hours');
            updateWithAnimation(minutesElement, minutesStr, 'minutes');
            updateWithAnimation(secondsElement, secondsStr, 'seconds');
            
            // Save current values for next comparison
            previousValues = { days: daysStr, hours: hoursStr, minutes: minutesStr, seconds: secondsStr };
            
            // Check if less than 1 day remains and apply warning style
            if (days < 1) {
                countdownElements.forEach(el => el.classList.add('warning'));
                
                // Add pulse animation to seconds when less than 10 minutes remain
                if (hours === 0 && minutes < 10) {
                    secondsElement.classList.add('pulse');
                } else {
                    secondsElement.classList.remove('pulse');
                }
            } else {
                countdownElements.forEach(el => el.classList.remove('warning'));
                secondsElement.classList.remove('pulse');
            }
        }
        
        // Update element with smooth transition animation
        function updateWithAnimation(element, newValue, unit) {
            // Only animate if the value has changed
            if (previousValues[unit] !== newValue) {
                // Add animation class
                element.classList.add('number-transition');
                element.style.transform = 'scale(1.1)';
                element.style.color = '#00b4d8';
                
                // Update the value
                element.textContent = newValue;
                
                // Remove animation after a short delay
                setTimeout(() => {
                    element.classList.remove('number-transition');
                    element.style.transform = 'scale(1)';
                    
                    // Return to appropriate color
                    const days = parseInt(document.getElementById('days').textContent);
                    element.style.color = days < 1 ? '#ffa500' : 'white';
                }, 300);
            } else {
                element.textContent = newValue;
            }
        }
        
        // Handle countdown end
        function endCountdown() {
            clearInterval(countdownInterval);
            
            // Hide countdown and show ended message
            countdownElements.forEach(el => el.style.display = 'none');
            endedMessage.style.display = 'block';
            
            // Update button state
            pauseResumeBtn.disabled = true;
        }
        
        // Toggle pause/resume state
        function togglePauseResume() {
            if (!targetDate) return;
            
            isPaused = !isPaused;
            
            if (isPaused) {
                pauseResumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume Countdown';
                pauseResumeBtn.className = 'btn-start';
                
                // Add visual indicator that timer is paused
                countdownElements.forEach(el => {
                    el.style.opacity = '0.7';
                    el.style.filter = 'grayscale(0.5)';
                });
            } else {
                pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Countdown';
                pauseResumeBtn.className = 'btn-pause';
                
                // Restore normal appearance
                countdownElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.filter = 'grayscale(0)';
                });
                
                // Immediately update display when resuming
                updateCountdown();
            }
        }
        
        // Reset the timer to allow setting a new event
        function resetTimer() {
            // Clear interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            // Reset state
            isPaused = false;
            targetDate = null;
            
            // Reset display
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            
            // Reset previous values
            previousValues = { days: "00", hours: "00", minutes: "00", seconds: "00" };
            
            // Show countdown and hide ended message
            endedMessage.style.display = 'none';
            countdownElements.forEach(el => {
                el.style.display = 'flex';
                el.classList.remove('warning');
                el.style.opacity = '1';
                el.style.filter = 'grayscale(0)';
            });
            
            // Reset button state
            pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Countdown';
            pauseResumeBtn.className = 'btn-pause';
            pauseResumeBtn.disabled = false;
            
            // Reset to default values
            eventNameInput.value = "New Year's Celebration";
            updateDisplayEventName();
            
            // Set date to tomorrow and time to next hour
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            eventDateInput.value = tomorrow.toISOString().split('T')[0];
            
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1);
            eventTimeInput.value = `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`;
        }
    