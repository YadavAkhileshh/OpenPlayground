
        // DOM Elements
        const backButton = document.getElementById('backButton');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const saveButton = document.getElementById('saveButton');
        const cancelButton = document.getElementById('cancelButton');
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        const statusMessage = document.getElementById('statusMessage');
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        const settingsSections = document.querySelectorAll('.settings-section');
        
        // Get all settings inputs
        const toggleSwitches = document.querySelectorAll('input[type="checkbox"]');
        const sliders = document.querySelectorAll('input[type="range"]');
        const dropdowns = document.querySelectorAll('select');
        
        // Conditional settings dependencies
        const conditionalSettings = document.querySelectorAll('.conditional-setting');
        
        // Initialize the settings from localStorage
        function initializeSettings() {
            // Load dark mode preference
            const darkMode = localStorage.getItem('darkMode') === 'true';
            document.body.classList.toggle('dark-mode', darkMode);
            darkModeToggle.checked = darkMode;
            
            // Load all toggle switches
            toggleSwitches.forEach(toggle => {
                const id = toggle.id;
                const savedValue = localStorage.getItem(id);
                if (savedValue !== null) {
                    toggle.checked = savedValue === 'true';
                }
            });
            
            // Load all sliders
            sliders.forEach(slider => {
                const id = slider.id;
                const savedValue = localStorage.getItem(id);
                if (savedValue !== null) {
                    slider.value = savedValue;
                    updateSliderDisplay(slider);
                }
            });
            
            // Load all dropdowns
            dropdowns.forEach(dropdown => {
                const id = dropdown.id;
                const savedValue = localStorage.getItem(id);
                if (savedValue !== null) {
                    dropdown.value = savedValue;
                }
            });
            
            // Apply conditional logic
            applyConditionalLogic();
        }
        
        // Update slider display values
        function updateSliderDisplay(slider) {
            const valueDisplay = document.getElementById(`${slider.id}Value`);
            if (!valueDisplay) return;
            
            switch(slider.id) {
                case 'notificationVolume':
                    valueDisplay.textContent = `${slider.value}%`;
                    break;
                case 'fontSizeSlider':
                    const size = parseInt(slider.value);
                    let sizeName = 'Small';
                    if (size >= 20) sizeName = 'Large';
                    else if (size >= 16) sizeName = 'Medium';
                    valueDisplay.textContent = sizeName;
                    break;
                case 'cacheSize':
                    valueDisplay.textContent = `${slider.value} MB`;
                    break;
                default:
                    valueDisplay.textContent = slider.value;
            }
        }
        
        // Apply conditional logic for dependent settings
        function applyConditionalLogic() {
            conditionalSettings.forEach(setting => {
                const dependsOnId = setting.getAttribute('data-depends');
                const dependsOnElement = document.getElementById(dependsOnId);
                
                if (dependsOnElement) {
                    const isEnabled = dependsOnElement.checked;
                    const inputs = setting.querySelectorAll('input, select');
                    
                    // Enable/disable the inputs
                    inputs.forEach(input => {
                        input.disabled = !isEnabled;
                    });
                    
                    // Add/remove disabled styling
                    if (isEnabled) {
                        setting.classList.remove('disabled-setting');
                    } else {
                        setting.classList.add('disabled-setting');
                    }
                }
            });
        }
        
        // Save all settings to localStorage
        function saveSettings() {
            // Save toggle switches
            toggleSwitches.forEach(toggle => {
                localStorage.setItem(toggle.id, toggle.checked);
            });
            
            // Save sliders
            sliders.forEach(slider => {
                localStorage.setItem(slider.id, slider.value);
            });
            
            // Save dropdowns
            dropdowns.forEach(dropdown => {
                localStorage.setItem(dropdown.id, dropdown.value);
            });
            
            // Show success message
            showStatusMessage('Settings saved successfully!', 'success');
            
            // Apply conditional logic after save
            applyConditionalLogic();
        }
        
        // Reset all settings to defaults
        function resetSettings() {
            if (confirm('Are you sure you want to reset all settings to default values?')) {
                // Clear localStorage
                localStorage.clear();
                
                // Reset toggle switches
                toggleSwitches.forEach(toggle => {
                    if (toggle.id === 'darkModeToggle') {
                        toggle.checked = false;
                        document.body.classList.remove('dark-mode');
                    } else if (toggle.id === 'autoSave' || toggle.id === 'notificationsEnabled' || toggle.id === 'dataCollection') {
                        toggle.checked = true;
                    } else {
                        toggle.checked = false;
                    }
                });
                
                // Reset sliders
                const notificationVolume = document.getElementById('notificationVolume');
                notificationVolume.value = 75;
                updateSliderDisplay(notificationVolume);
                
                const fontSizeSlider = document.getElementById('fontSizeSlider');
                fontSizeSlider.value = 16;
                updateSliderDisplay(fontSizeSlider);
                
                const cacheSize = document.getElementById('cacheSize');
                cacheSize.value = 500;
                updateSliderDisplay(cacheSize);
                
                // Reset dropdowns
                document.getElementById('languageSelect').value = 'en';
                document.getElementById('saveLocation').value = 'local';
                document.getElementById('notificationFrequency').value = 'instant';
                document.getElementById('autoLogout').value = '30';
                document.getElementById('themeSelect').value = 'light';
                
                // Apply conditional logic
                applyConditionalLogic();
                
                // Show success message
                showStatusMessage('All settings have been reset to default values.', 'success');
            }
        }
        
        // Show status message
        function showStatusMessage(message, type) {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message';
            
            if (type === 'success') {
                statusMessage.classList.add('status-success');
            }
            
            // Hide message after 3 seconds
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
            
            statusMessage.style.display = 'block';
        }
        
        // Switch between settings sections
        function switchSection(sectionId) {
            // Update active section
            settingsSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });
            
            // Update active sidebar link
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
        
        // Event Listeners
        backButton.addEventListener('click', () => {
            alert('Navigating back to the main app...');
        });
        
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeToggle.checked);
            localStorage.setItem('darkMode', darkModeToggle.checked);
        });
        
        saveButton.addEventListener('click', saveSettings);
        
        cancelButton.addEventListener('click', () => {
            // Reload settings from localStorage
            initializeSettings();
            showStatusMessage('Changes discarded.', 'success');
        });
        
        resetSettingsBtn.addEventListener('click', resetSettings);
        
        // Sidebar navigation
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                switchSection(sectionId);
            });
        });
        
        // Update slider displays when changed
        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                updateSliderDisplay(slider);
            });
        });
        
        // Apply conditional logic when toggle switches change
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', applyConditionalLogic);
        });
        
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', () => {
            const theme = themeSelect.value;
            
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                darkModeToggle.checked = true;
            } else if (theme === 'light') {
                document.body.classList.remove('dark-mode');
                darkModeToggle.checked = false;
            } else {
                // System default - check prefers-color-scheme
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.classList.toggle('dark-mode', prefersDark);
                darkModeToggle.checked = prefersDark;
            }
        });
        
        // Initialize the app
        initializeSettings();
        
        // Set initial slider displays
        sliders.forEach(slider => {
            updateSliderDisplay(slider);
        });
    