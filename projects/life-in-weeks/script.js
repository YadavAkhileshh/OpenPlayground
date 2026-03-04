document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const birthdateInput = document.getElementById('birthdate');
    const lifeExpectancySlider = document.getElementById('lifeExpectancy');
    const expectancyValue = document.getElementById('expectancyValue');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const ageDisplay = document.getElementById('ageDisplay');
    const weeksLived = document.getElementById('weeksLived');
    const weeksLeft = document.getElementById('weeksLeft');
    const lifeGrid = document.getElementById('lifeGrid');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const toggleLabelsBtn = document.getElementById('toggleLabels');
    const milestonesList = document.getElementById('milestones');
    
    // Default birthdate (25 years ago from today)
    const defaultBirthdate = new Date();
    defaultBirthdate.setFullYear(defaultBirthdate.getFullYear() - 25);
    birthdateInput.valueAsDate = defaultBirthdate;
    
    // Update slider value display
    lifeExpectancySlider.addEventListener('input', function() {
        expectancyValue.textContent = this.value;
    });
    
    // Initialize the visualization
    initializeVisualization();
    
    // Event listeners
    visualizeBtn.addEventListener('click', initializeVisualization);
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    toggleLabelsBtn.addEventListener('click', toggleYearLabels);
    
    function initializeVisualization() {
        const birthdate = new Date(birthdateInput.value);
        const lifeExpectancy = parseInt(lifeExpectancySlider.value);
        
        // Calculate age and weeks
        const today = new Date();
        const ageInMs = today - birthdate;
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        const weeksLivedCount = Math.floor(ageInYears * 52.1775);
        const totalWeeks = lifeExpectancy * 52.1775;
        const weeksLeftCount = Math.floor(totalWeeks - weeksLivedCount);
        
        // Update stats display
        ageDisplay.innerHTML = `You are <span class="highlight">${Math.floor(ageInYears)}</span> years old`;
        weeksLived.innerHTML = `You've lived <span class="highlight">${weeksLivedCount.toLocaleString()}</span> weeks`;
        weeksLeft.innerHTML = `Approximately <span class="highlight">${weeksLeftCount.toLocaleString()}</span> weeks remain`;
        
        // Generate life grid
        generateLifeGrid(birthdate, lifeExpectancy, weeksLivedCount, ageInYears);
        
        // Update milestones
        updateMilestones(birthdate, lifeExpectancy, ageInYears);
    }
    
    function generateLifeGrid(birthdate, lifeExpectancy, weeksLivedCount, ageInYears) {
        // Clear existing grid
        lifeGrid.innerHTML = '';
        
        const totalWeeks = lifeExpectancy * 52;
        const years = lifeExpectancy;
        const weekSize = 16; // Default week square size in pixels
        let showYearLabels = true;
        
        // Create grid for each year
        for (let year = 0; year < years; year++) {
            const yearRow = document.createElement('div');
            yearRow.className = 'year-row';
            
            // Year label on the left
            if (showYearLabels) {
                const yearLabel = document.createElement('div');
                yearLabel.className = 'year-label-left';
                yearLabel.textContent = year;
                yearRow.appendChild(yearLabel);
            }
            
            const weekRow = document.createElement('div');
            weekRow.className = 'week-row';
            
            // Create 52 weeks for each year
            for (let week = 0; week < 52; week++) {
                const weekIndex = year * 52 + week;
                
                const weekSquare = document.createElement('div');
                weekSquare.className = 'week-square';
                weekSquare.setAttribute('data-week', weekIndex);
                
                // Determine week type
                if (weekIndex < weeksLivedCount) {
                    weekSquare.classList.add('past');
                    
                    // Check for current year (past but within current age)
                    if (year === Math.floor(ageInYears) && week < (ageInYears % 1) * 52) {
                        weekSquare.classList.add('past');
                    }
                } else if (weekIndex >= weeksLivedCount && weekIndex < weeksLivedCount + 1) {
                    weekSquare.classList.add('current');
                } else {
                    weekSquare.classList.add('future');
                }
                
                // Add milestone markers at specific ages
                const currentAge = year + (week / 52);
                if (isMilestoneAge(currentAge)) {
                    weekSquare.classList.add('milestone');
                }
                
                // Add tooltip
                const weekAge = year + (week / 52);
                const actualDate = new Date(birthdate);
                actualDate.setDate(actualDate.getDate() + weekIndex * 7);
                
                weekSquare.title = `Age: ${weekAge.toFixed(1)} years\nWeek ${weekIndex + 1} of ${totalWeeks}\nDate: ${actualDate.toLocaleDateString()}`;
                
                weekRow.appendChild(weekSquare);
            }
            
            yearRow.appendChild(weekRow);
            lifeGrid.appendChild(yearRow);
        }
    }
    
    function isMilestoneAge(age) {
        const milestones = [5, 10, 13, 16, 18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
        return milestones.some(milestone => {
            return Math.abs(age - milestone) < 0.1;
        });
    }
    
    function updateMilestones(birthdate, lifeExpectancy, ageInYears) {
        milestonesList.innerHTML = '';
        
        const milestoneAges = [
            {age: 5, label: "Start school"},
            {age: 13, label: "Become a teenager"},
            {age: 16, label: "Learn to drive"},
            {age: 18, label: "Become an adult"},
            {age: 21, label: "Legal drinking age (US)"},
            {age: 25, label: "Car insurance discount"},
            {age: 30, label: "Typical age to start a family"},
            {age: 40, label: "Middle age milestone"},
            {age: 50, label: "Half a century"},
            {age: 65, label: "Traditional retirement age"},
            {age: 70, label: "Average global life expectancy"},
            {age: 80, label: "Octogenarian"},
            {age: 90, label: "Nonagenarian (if you reach this!)"}
        ];
        
        milestoneAges.forEach(milestone => {
            if (milestone.age <= lifeExpectancy) {
                const li = document.createElement('li');
                const milestoneDate = new Date(birthdate);
                milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone.age);
                
                // Check if milestone has passed
                const hasPassed = ageInYears > milestone.age;
                
                li.innerHTML = `
                    <strong>Age ${milestone.age}:</strong> ${milestone.label}
                    <br><small>${hasPassed ? 'Passed on ' : 'Will be on '}${milestoneDate.toLocaleDateString()}</small>
                `;
                
                if (hasPassed) {
                    li.style.opacity = "0.8";
                    li.style.borderLeftColor = "#6D9F71";
                } else if (milestone.age - ageInYears < 5) {
                    li.style.borderLeftColor = "#FF9A8B";
                    li.style.fontWeight = "600";
                }
                
                milestonesList.appendChild(li);
            }
        });
    }
    
    function zoomIn() {
        const weekSquares = document.querySelectorAll('.week-square');
        let currentSize = parseInt(getComputedStyle(weekSquares[0]).width);
        
        if (currentSize < 24) {
            weekSquares.forEach(square => {
                square.style.width = `${currentSize + 2}px`;
                square.style.height = `${currentSize + 2}px`;
            });
        }
    }
    
    function zoomOut() {
        const weekSquares = document.querySelectorAll('.week-square');
        let currentSize = parseInt(getComputedStyle(weekSquares[0]).width);
        
        if (currentSize > 10) {
            weekSquares.forEach(square => {
                square.style.width = `${currentSize - 2}px`;
                square.style.height = `${currentSize - 2}px`;
            });
        }
    }
    
    function toggleYearLabels() {
        const yearLabels = document.querySelectorAll('.year-label-left');
        const isVisible = yearLabels[0].style.display !== 'none';
        
        yearLabels.forEach(label => {
            label.style.display = isVisible ? 'none' : 'block';
        });
        
        toggleLabelsBtn.innerHTML = isVisible ? 
            `<i class="fas fa-tag"></i> Show Year Labels` : 
            `<i class="fas fa-tag"></i> Hide Year Labels`;
    }
    
    // Initialize with default values
    initializeVisualization();
});