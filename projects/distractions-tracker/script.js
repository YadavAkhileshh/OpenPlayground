
        // Distraction data with tips
        const distractionData = {
            "Phone": {
                name: "Phone notifications & social media",
                icon: "fas fa-mobile-alt",
                tips: [
                    "Use Do Not Disturb mode during study sessions",
                    "Place your phone in another room",
                    "Use app blockers like Forest or Freedom",
                    "Schedule specific times to check your phone"
                ]
            },
            "Noise": {
                name: "Environmental noise",
                icon: "fas fa-volume-up",
                tips: [
                    "Use noise-cancelling headphones",
                    "Try white noise or instrumental music",
                    "Study in a library or quiet café",
                    "Use earplugs if needed"
                ]
            },
            "Multitasking": {
                name: "Multitasking (switching between tasks)",
                icon: "fas fa-tasks",
                tips: [
                    "Practice single-tasking with timers (Pomodoro technique)",
                    "Close unrelated browser tabs and applications",
                    "Make a study plan and stick to one subject at a time",
                    "Take short breaks between focused sessions"
                ]
            },
            "Procrastination": {
                name: "Procrastination & lack of motivation",
                icon: "fas fa-clock",
                tips: [
                    "Break tasks into smaller, manageable chunks",
                    "Set specific, achievable goals for each session",
                    "Use the 5-minute rule: commit to just 5 minutes of work",
                    "Reward yourself after completing tasks"
                ]
            },
            "People": {
                name: "Interruptions from people",
                icon: "fas fa-users",
                tips: [
                    "Communicate your study schedule to others",
                    "Use a 'Do Not Disturb' sign on your door",
                    "Study in a location where you're less likely to be interrupted",
                    "Set boundaries with clear communication"
                ]
            },
            "Internet": {
                name: "Unnecessary internet browsing",
                icon: "fas fa-wifi",
                tips: [
                    "Use website blockers during study time",
                    "Keep only necessary tabs open",
                    "Use browser extensions that limit time on distracting sites",
                    "Turn off Wi-Fi if not needed for studying"
                ]
            },
            "Fatigue": {
                name: "Fatigue or lack of sleep",
                icon: "fas fa-bed",
                tips: [
                    "Ensure 7-9 hours of quality sleep each night",
                    "Take power naps (20-30 minutes) if needed",
                    "Study during your natural energy peaks",
                    "Stay hydrated and maintain a consistent sleep schedule"
                ]
            },
            "Hunger": {
                name: "Hunger or thirst",
                icon: "fas fa-utensils",
                tips: [
                    "Have healthy snacks and water nearby before starting",
                    "Eat balanced meals to maintain energy levels",
                    "Avoid heavy meals that cause drowsiness",
                    "Take short snack breaks if needed"
                ]
            }
        };

        // Session tracking
        let sessionData = {
            currentSelections: [],
            history: [],
            sessionCount: 1
        };

        // Load data from localStorage if available
        function loadData() {
            const savedData = localStorage.getItem('distractionTrackerData');
            if (savedData) {
                sessionData = JSON.parse(savedData);
                updateSessionCount();
                
                // Check checkboxes based on history
                const checkboxes = document.querySelectorAll('input[name="distraction"]');
                checkboxes.forEach(checkbox => {
                    // For demo purposes, we won't auto-check based on history
                    // but we could implement this if needed
                    checkbox.checked = false;
                });
            }
        }

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('distractionTrackerData', JSON.stringify(sessionData));
        }

        // Update the session counter
        function updateSessionCount() {
            document.getElementById('sessionCount').textContent = sessionData.sessionCount;
        }

        // Update the summary based on selected distractions
        function updateSummary() {
            const selectedDistractions = Array.from(document.querySelectorAll('input[name="distraction"]:checked'))
                .map(checkbox => checkbox.value);
            
            sessionData.currentSelections = selectedDistractions;
            
            // Update total count
            document.getElementById('totalDistractions').textContent = selectedDistractions.length;
            
            // Update progress bar
            const totalCheckboxes = document.querySelectorAll('input[name="distraction"]').length;
            const progressPercentage = (selectedDistractions.length / totalCheckboxes) * 100;
            document.getElementById('progressFill').style.width = `${progressPercentage}%`;
            
            // Update frequent distractions tags
            const tagsContainer = document.getElementById('distractionTags');
            
            if (selectedDistractions.length === 0) {
                tagsContainer.innerHTML = '<div class="empty-state">No distractions selected yet. Start tracking by selecting distractions you encounter.</div>';
                document.getElementById('topDistraction').textContent = '-';
            } else {
                // Create distraction tags
                tagsContainer.innerHTML = '';
                selectedDistractions.forEach(distraction => {
                    const tag = document.createElement('div');
                    tag.className = 'distraction-tag';
                    tag.innerHTML = `<i class="${distractionData[distraction].icon}"></i> ${distraction}`;
                    tagsContainer.appendChild(tag);
                });
                
                // Update most frequent distraction (for now, just the first one)
                document.getElementById('topDistraction').textContent = selectedDistractions[0];
            }
            
            // Update tips based on selected distractions
            updateTips(selectedDistractions);
            
            // Save to localStorage
            saveData();
        }

        // Update tips section based on selected distractions
        function updateTips(selectedDistractions) {
            const tipsContainer = document.getElementById('tipsList');
            
            if (selectedDistractions.length === 0) {
                tipsContainer.innerHTML = '<div class="empty-state">Select distractions above to see personalized tips for improving your focus.</div>';
                return;
            }
            
            tipsContainer.innerHTML = '';
            
            // Show tips for selected distractions
            selectedDistractions.forEach(distraction => {
                if (distractionData[distraction]) {
                    const tipCard = document.createElement('div');
                    tipCard.className = 'tip-card';
                    
                    let tipsHTML = `<h4><i class="${distractionData[distraction].icon}"></i> ${distraction}</h4>`;
                    tipsHTML += '<ul>';
                    
                    distractionData[distraction].tips.forEach(tip => {
                        tipsHTML += `<li>${tip}</li>`;
                    });
                    
                    tipsHTML += '</ul>';
                    tipCard.innerHTML = tipsHTML;
                    tipsContainer.appendChild(tipCard);
                }
            });
        }

        // Reset for a new session
        function resetSession() {
            // Uncheck all checkboxes
            const checkboxes = document.querySelectorAll('input[name="distraction"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Add current session to history if there were any selections
            if (sessionData.currentSelections.length > 0) {
                sessionData.history.push({
                    date: new Date().toLocaleDateString(),
                    distractions: [...sessionData.currentSelections]
                });
                
                sessionData.sessionCount++;
                updateSessionCount();
            }
            
            // Clear current selections
            sessionData.currentSelections = [];
            
            // Update UI
            updateSummary();
            
            // Save data
            saveData();
            
            // Show a brief confirmation
            const resetBtn = document.getElementById('resetBtn');
            const originalText = resetBtn.innerHTML;
            resetBtn.innerHTML = '<i class="fas fa-check"></i> New Session Started!';
            resetBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
            
            setTimeout(() => {
                resetBtn.innerHTML = originalText;
                resetBtn.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
            }, 2000);
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Load saved data
            loadData();
            
            // Add event listeners to checkboxes
            const checkboxes = document.querySelectorAll('input[name="distraction"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSummary);
            });
            
            // Add event listener to reset button
            document.getElementById('resetBtn').addEventListener('click', resetSession);
            
            // Initialize the summary
            updateSummary();
            
            // For demo purposes, pre-select a couple of common distractions
            setTimeout(() => {
                document.getElementById('phone').checked = true;
                document.getElementById('internet').checked = true;
                updateSummary();
            }, 500);
        });
    