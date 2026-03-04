        const obj = document.getElementById('impossibleObject');
        const rotX = document.getElementById('rotX');
        const rotY = document.getElementById('rotY');
        const distort = document.getElementById('distort');
        const faces = document.querySelectorAll('.face');
        
        function updateObject() {
            const x = rotX.value;
            const y = rotY.value;
            const d = distort.value / 100;
            
            obj.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
            
            // Distortion: modify translateZ and colors
            faces.forEach((face, index) => {
                // Weird scaling based on distortion
                const scale = 0.8 + (d * 0.5 * Math.sin(Date.now() * 0.001 + index));
                face.style.transform = face.style.transform.replace(/scale\([^)]+\)/, '');
                face.style.transform += ` scale(${scale})`;
                
                // Color shift
                const hue = (index * 60 + Date.now() * 0.05) % 360;
                face.style.borderColor = `hsl(${hue}, 100%, 60%)`;
                face.style.boxShadow = `0 0 ${20 * d}px hsl(${hue}, 100%, 60%)`;
                
                // Change symbols
                const symbols = ['⌬', '⏣', '⎔', '⬡', '⧫', '⬢'];
                face.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            });
            
            requestAnimationFrame(updateObject);
        }
        
        // Sliders update the base rotation immediately
        rotX.addEventListener('input', () => {
            // updateObject handles continuous animation, so we just trigger style
        });
        rotY.addEventListener('input', () => {});
        distort.addEventListener('input', () => {});
        
        // Presets
        document.getElementById('tesseract').addEventListener('click', () => {
            rotX.value = 45;
            rotY.value = 45;
            distort.value = 200;
        });
        document.getElementById('mobius').addEventListener('click', () => {
            rotX.value = 180;
            rotY.value = 0;
            distort.value = 80;
        });
        document.getElementById('penrose').addEventListener('click', () => {
            rotX.value = 30;
            rotY.value = 60;
            distort.value = 150;
        });
        document.getElementById('klein').addEventListener('click', () => {
            rotX.value = 120;
            rotY.value = 240;
            distort.value = 300;
        });
        
        // Start animation loop
        updateObject();