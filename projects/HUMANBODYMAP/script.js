        // DOM Elements
        const bodyParts = document.querySelectorAll('.body-part');
        const defaultInfo = document.getElementById('default-info');
        const partDescriptions = document.querySelectorAll('.body-part-description');
        
        // Initialize the interactive map
        function init() {
            addEventListeners();
        }
        
        // Add event listeners to body parts
        function addEventListeners() {
            bodyParts.forEach(part => {
                part.addEventListener('click', function() {
                    const partId = this.getAttribute('data-part');
                    showBodyPartInfo(partId);
                    
                    // Add visual feedback
                    bodyParts.forEach(p => p.classList.remove('pulse'));
                    this.classList.add('pulse');
                });
            });
        }
        
        // Show information for selected body part
        function showBodyPartInfo(partId) {
            // Hide default message
            defaultInfo.classList.remove('active');
            
            // Hide all body part descriptions
            partDescriptions.forEach(desc => {
                desc.classList.remove('active');
            });
            
            // Show selected body part description
            const selectedPart = document.getElementById(`${partId}-info`);
            if (selectedPart) {
                selectedPart.classList.add('active');
            } else {
                // If info not available for this part, show default
                defaultInfo.classList.add('active');
            }
            
            // Scroll info panel to top
            document.querySelector('.info-panel').scrollTop = 0;
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', init);
        
        // Add some interactive effects
        setTimeout(() => {
            // Make brain pulse initially to draw attention
            document.querySelector('.brain').classList.add('pulse');
        }, 1000);
        
        // Add keyboard navigation for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') showBodyPartInfo('brain');
            if (e.key === '2') showBodyPartInfo('heart');
            if (e.key === '3') showBodyPartInfo('lungs');
            if (e.key === '4') showBodyPartInfo('stomach');
            if (e.key === '5') showBodyPartInfo('liver');
            if (e.key === '6') showBodyPartInfo('kidneys');
            if (e.key === '7') showBodyPartInfo('bones');
        });