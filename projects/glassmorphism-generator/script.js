document.addEventListener('DOMContentLoaded', () => {
    const blurSlider = document.getElementById('blur');
    const opacitySlider = document.getElementById('opacity');
    const radiusSlider = document.getElementById('radius');
    const borderSlider = document.getElementById('border');
    const shadowSlider = document.getElementById('shadow');
    const bgColorPicker = document.getElementById('bg-color');

    const blurValueSpan = document.getElementById('blur-value');
    const opacityValueSpan = document.getElementById('opacity-value');
    const radiusValueSpan = document.getElementById('radius-value');
    const borderValueSpan = document.getElementById('border-value');
    const shadowValueSpan = document.getElementById('shadow-value');
    const bgColorValueSpan = document.getElementById('bg-color-value');

    const glassCard = document.getElementById('glass-card');
    const cssOutput = document.getElementById('css-output');
    const copyCssBtn = document.getElementById('copy-css-btn');

    // Function to update the glassmorphism effect and CSS output
    function updateGlassmorphism() {
        const blur = blurSlider.value;
        const opacity = opacitySlider.value;
        const radius = radiusSlider.value;
        const border = borderSlider.value;
        const shadow = shadowSlider.value;
        const bgColor = bgColorPicker.value;

        // Convert hex color to RGBA for consistency with opacity slider
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
        };

        const { r, g, b } = hexToRgb(bgColor);
        const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        const borderColor = `rgba(255, 255, 255, ${parseFloat(opacity) + 0.1})`; // Slightly more opaque border

        // Apply styles to the glass card
        glassCard.style.backdropFilter = `blur(${blur}px)`;
        glassCard.style.webkitBackdropFilter = `blur(${blur}px)`; // For Safari support
        glassCard.style.backgroundColor = rgbaColor;
        glassCard.style.borderRadius = `${radius}px`;
        glassCard.style.border = `${border}px solid ${borderColor}`;
        glassCard.style.boxShadow = `0 ${shadow * 10}px ${shadow * 30}px 0 rgba(0, 0, 0, ${shadow})`;

        // Update value spans
        blurValueSpan.textContent = `${blur}px`;
        opacityValueSpan.textContent = parseFloat(opacity).toFixed(2);
        radiusValueSpan.textContent = `${radius}px`;
        borderValueSpan.textContent = `${border}px`;
        shadowValueSpan.textContent = parseFloat(shadow).toFixed(2);
        bgColorValueSpan.textContent = bgColor;

        // Generate CSS code
        const cssCode = `
background: ${rgbaColor};
border-radius: ${radius}px;
border: ${border}px solid ${borderColor};
box-shadow: 0 ${shadow * 10}px ${shadow * 30}px 0 rgba(0, 0, 0, ${shadow});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px); /* For Safari */
`;
        cssOutput.textContent = cssCode.trim();
    }

    // Event Listeners for sliders and color picker
    blurSlider.addEventListener('input', updateGlassmorphism);
    opacitySlider.addEventListener('input', updateGlassmorphism);
    radiusSlider.addEventListener('input', updateGlassmorphism);
    borderSlider.addEventListener('input', updateGlassmorphism);
    shadowSlider.addEventListener('input', updateGlassmorphism);
    bgColorPicker.addEventListener('input', updateGlassmorphism);

    // Copy CSS to clipboard functionality
    copyCssBtn.addEventListener('click', () => {
        const cssToCopy = cssOutput.textContent;
        navigator.clipboard.writeText(cssToCopy)
            .then(() => {
                copyCssBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
                copyCssBtn.style.backgroundColor = '#28a745'; // Green color for feedback
                setTimeout(() => {
                    copyCssBtn.innerHTML = '<i class="ri-clipboard-line"></i> Copy CSS';
                    copyCssBtn.style.backgroundColor = ''; // Reset to default
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy CSS: ' + err);
                console.error('Failed to copy CSS:', err);
            });
    });

    // Initial call to set up the default glassmorphism effect
    updateGlassmorphism();
});