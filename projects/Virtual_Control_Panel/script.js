
        // DOM Elements
        const powerSwitch = document.getElementById('power-switch');
        const modeSwitch = document.getElementById('mode-switch');
        const safetySwitch = document.getElementById('safety-switch');
        const coolingSwitch = document.getElementById('cooling-switch');
        
        const powerStatus = document.getElementById('power-status');
        const modeStatus = document.getElementById('mode-status');
        const safetyStatus = document.getElementById('safety-status');
        const coolingStatus = document.getElementById('cooling-status');
        
        const powerLight = document.getElementById('power-light');
        const modeLight = document.getElementById('mode-light');
        const safetyLight = document.getElementById('safety-light');
        const coolingLight = document.getElementById('cooling-light');
        
        const powerIndicator = document.getElementById('power-indicator');
        const modeIndicator = document.getElementById('mode-indicator');
        const safetyIndicator = document.getElementById('safety-indicator');
        const coolingIndicator = document.getElementById('cooling-indicator');
        
        const resetBtn = document.getElementById('reset-btn');
        const logContainer = document.getElementById('log-container');
        
        // System state
        const systemState = {
            power: false,
            mode: false, // false = AUTO, true = MANUAL
            safety: false,
            cooling: false,
            logEntries: []
        };
        
        // Initialize the system
        function initSystem() {
            // Add initial log entry
            addLogEntry("System initialized. All controls are OFF.", "system");
            
            // Set up event listeners
            powerSwitch.addEventListener('change', togglePower);
            modeSwitch.addEventListener('change', toggleMode);
            safetySwitch.addEventListener('change', toggleSafety);
            coolingSwitch.addEventListener('change', toggleCooling);
            resetBtn.addEventListener('click', resetPanel);
            
            // Initialize visual state
            updateVisualState();
        }
        
        // Power toggle handler
        function togglePower() {
            systemState.power = powerSwitch.checked;
            
            if (systemState.power) {
                addLogEntry("Main Power turned ON. System booting up...", "success");
                
                // Enable mode and safety switches
                modeSwitch.disabled = false;
                safetySwitch.disabled = false;
                
                // Update status
                powerStatus.textContent = "ON";
                powerStatus.className = "status-on";
                
                // If safety is on, enable cooling switch
                if (systemState.safety) {
                    coolingSwitch.disabled = false;
                }
            } else {
                addLogEntry("Main Power turned OFF. All systems shutting down.", "warning");
                
                // Disable all other switches
                modeSwitch.disabled = true;
                safetySwitch.disabled = true;
                coolingSwitch.disabled = true;
                
                // Turn off all other systems
                modeSwitch.checked = false;
                safetySwitch.checked = false;
                coolingSwitch.checked = false;
                
                // Update system state
                systemState.mode = false;
                systemState.safety = false;
                systemState.cooling = false;
                
                // Update status displays
                powerStatus.textContent = "OFF";
                powerStatus.className = "status-off";
                modeStatus.textContent = "AUTO";
                modeStatus.className = "status-off";
                safetyStatus.textContent = "DISABLED";
                safetyStatus.className = "status-off";
                coolingStatus.textContent = "STANDBY";
                coolingStatus.className = "status-off";
            }
            
            updateVisualState();
        }
        
        // Mode toggle handler
        function toggleMode() {
            systemState.mode = modeSwitch.checked;
            
            if (systemState.mode) {
                addLogEntry("Operation Mode changed to MANUAL.", "system");
                modeStatus.textContent = "MANUAL";
                modeStatus.className = "status-warning";
            } else {
                addLogEntry("Operation Mode changed to AUTO.", "system");
                modeStatus.textContent = "AUTO";
                modeStatus.className = "status-on";
            }
            
            updateVisualState();
        }
        
        // Safety toggle handler
        function toggleSafety() {
            systemState.safety = safetySwitch.checked;
            
            if (systemState.safety) {
                addLogEntry("Safety System activated.", "success");
                safetyStatus.textContent = "ENABLED";
                safetyStatus.className = "status-on";
                
                // Enable cooling switch if power is on
                if (systemState.power) {
                    coolingSwitch.disabled = false;
                }
            } else {
                addLogEntry("Safety System deactivated.", "warning");
                safetyStatus.textContent = "DISABLED";
                safetyStatus.className = "status-off";
                
                // Disable and turn off cooling
                coolingSwitch.disabled = true;
                coolingSwitch.checked = false;
                systemState.cooling = false;
                coolingStatus.textContent = "STANDBY";
                coolingStatus.className = "status-off";
                addLogEntry("Cooling System disabled. Safety System must be ON.", "error");
            }
            
            updateVisualState();
        }
        
        // Cooling toggle handler
        function toggleCooling() {
            systemState.cooling = coolingSwitch.checked;
            
            if (systemState.cooling) {
                addLogEntry("Cooling System activated.", "success");
                coolingStatus.textContent = "ACTIVE";
                coolingStatus.className = "status-on";
            } else {
                addLogEntry("Cooling System deactivated.", "warning");
                coolingStatus.textContent = "STANDBY";
                coolingStatus.className = "status-off";
            }
            
            updateVisualState();
        }
        
        // Update all visual indicators based on system state
        function updateVisualState() {
            // Update power indicator
            if (systemState.power) {
                powerLight.className = "indicator-light on";
                powerIndicator.textContent = "ONLINE";
                powerIndicator.className = "indicator-status status-on";
            } else {
                powerLight.className = "indicator-light off";
                powerIndicator.textContent = "OFFLINE";
                powerIndicator.className = "indicator-status status-off";
            }
            
            // Update mode indicator
            if (systemState.power) {
                if (systemState.mode) {
                    modeLight.className = "indicator-light warning";
                    modeIndicator.textContent = "MANUAL";
                    modeIndicator.className = "indicator-status status-warning";
                } else {
                    modeLight.className = "indicator-light on";
                    modeIndicator.textContent = "AUTO";
                    modeIndicator.className = "indicator-status status-on";
                }
            } else {
                modeLight.className = "indicator-light off";
                modeIndicator.textContent = "AUTO";
                modeIndicator.className = "indicator-status status-off";
            }
            
            // Update safety indicator
            if (systemState.safety && systemState.power) {
                safetyLight.className = "indicator-light on";
                safetyIndicator.textContent = "ENABLED";
                safetyIndicator.className = "indicator-status status-on";
            } else {
                safetyLight.className = "indicator-light off";
                safetyIndicator.textContent = "DISABLED";
                safetyIndicator.className = "indicator-status status-off";
            }
            
            // Update cooling indicator
            if (systemState.cooling && systemState.safety && systemState.power) {
                coolingLight.className = "indicator-light on";
                coolingIndicator.textContent = "ACTIVE";
                coolingIndicator.className = "indicator-status status-on";
            } else if (systemState.power && systemState.safety) {
                coolingLight.className = "indicator-light off";
                coolingIndicator.textContent = "STANDBY";
                coolingIndicator.className = "indicator-status status-off";
            } else {
                coolingLight.className = "indicator-light off";
                coolingIndicator.textContent = "STANDBY";
                coolingIndicator.className = "indicator-status status-off";
            }
            
            // Special warning if cooling is requested but safety is off
            if (coolingSwitch.checked && !systemState.safety) {
                addLogEntry("Warning: Cooling cannot activate without Safety System.", "error");
                coolingSwitch.checked = false;
                systemState.cooling = false;
            }
        }
        
        // Add entry to system log
        function addLogEntry(message, type = "system") {
            const time = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            let typeClass = '';
            if (type === "warning") typeClass = "log-warning";
            else if (type === "error") typeClass = "log-error";
            else if (type === "success") typeClass = "log-success";
            
            logEntry.innerHTML = `
                <span class="log-time">[${time}]</span>
                <span class="log-message ${typeClass}">${message}</span>
            `;
            
            logContainer.appendChild(logEntry);
            
            // Keep log to a reasonable length
            if (logContainer.children.length > 15) {
                logContainer.removeChild(logContainer.firstChild);
            }
            
            // Auto-scroll to bottom
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Store in state
            systemState.logEntries.push({time, message, type});
        }
        
        // Reset panel to initial state
        function resetPanel() {
            // Reset all switches
            powerSwitch.checked = false;
            modeSwitch.checked = false;
            safetySwitch.checked = false;
            coolingSwitch.checked = false;
            
            // Reset all switch states
            modeSwitch.disabled = true;
            safetySwitch.disabled = true;
            coolingSwitch.disabled = true;
            
            // Reset system state
            systemState.power = false;
            systemState.mode = false;
            systemState.safety = false;
            systemState.cooling = false;
            
            // Reset status displays
            powerStatus.textContent = "OFF";
            powerStatus.className = "status-off";
            modeStatus.textContent = "AUTO";
            modeStatus.className = "status-off";
            safetyStatus.textContent = "DISABLED";
            safetyStatus.className = "status-off";
            coolingStatus.textContent = "STANDBY";
            coolingStatus.className = "status-off";
            
            // Update visual state
            updateVisualState();
            
            // Add log entry
            addLogEntry("System reset to default state.", "system");
            
            // Visual feedback for reset
            resetBtn.innerHTML = '<i class="fas fa-check"></i> Panel Reset!';
            resetBtn.style.background = "linear-gradient(to right, #38a169, #2f855a)";
            
            setTimeout(() => {
                resetBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Reset Control Panel';
                resetBtn.style.background = "linear-gradient(to right, #2b6cb0, #4c51bf)";
            }, 1500);
        }
        
        // Initialize the control panel when page loads
        document.addEventListener('DOMContentLoaded', initSystem);