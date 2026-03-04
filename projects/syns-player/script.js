        const vizCards = [viz1, viz2, viz3, viz4].map(id => document.getElementById(id));
        const bars = document.querySelectorAll('.bar');
        const bass = document.getElementById('bass');
        const mid = document.getElementById('mid');
        const treble = document.getElementById('treble');
        const playBtn = document.getElementById('playBtn');
        
        let isPlaying = false;
        let animationId;
        
        // Visual effects based on "fake" audio sliders
        function updateVisuals() {
            if (!isPlaying) return;
            
            const bassVal = parseInt(bass.value) / 100;
            const midVal = parseInt(mid.value) / 100;
            const trebleVal = parseInt(treble.value) / 100;
            
            // Update grid cards
            vizCards.forEach((card, i) => {
                const hue = (i * 90 + Date.now() * 0.01) % 360;
                const scale = 0.8 + (bassVal * 0.5) + (Math.sin(Date.now() * 0.01 + i) * 0.1);
                card.style.transform = `scale(${scale})`;
                card.style.background = `hsl(${hue}, 80%, 60%)`;
                card.style.boxShadow = `0 0 ${20 + bassVal * 40}px hsl(${hue}, 80%, 70%)`;
                
                // Change emoji
                const emojis = ['🔮', '🎵', '⚡', '💫', '🌈', '🎸'];
                card.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            });
            
            // Update spectrum bars
            bars.forEach((bar, i) => {
                const randomFactor = 0.5 + Math.random() * 0.5;
                let height = 20 + 
                    (bassVal * 60 * (i < 2 ? 1 : 0.3)) + 
                    (midVal * 40 * (i > 1 && i < 5 ? 1 : 0.3)) + 
                    (trebleVal * 50 * (i > 4 ? 1 : 0.3));
                
                height = Math.min(95, height * randomFactor);
                bar.style.height = height + '%';
                
                // Color shift
                const hue = (i * 30 + Date.now() * 0.02) % 360;
                bar.style.background = `linear-gradient(to top, hsl(${hue}, 90%, 60%), hsl(${hue + 40}, 90%, 70%))`;
            });
            
            animationId = requestAnimationFrame(updateVisuals);
        }
        
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                playBtn.textContent = '⏸ SYNESTHESIA';
                playBtn.style.background = '#f0f';
                playBtn.style.boxShadow = '0 0 30px #f0f';
                updateVisuals();
            } else {
                playBtn.textContent = '▶ SYNESTHESIA';
                playBtn.style.background = '#0ff';
                playBtn.style.boxShadow = '0 0 30px #0ff';
                cancelAnimationFrame(animationId);
                
                // Reset
                vizCards.forEach(card => {
                    card.style.transform = 'scale(1)';
                    card.style.background = '#222';
                    card.style.boxShadow = 'inset 0 0 20px #000';
                    card.textContent = '⚪';
                });
                
                bars.forEach(bar => {
                    bar.style.height = '20%';
                    bar.style.background = 'linear-gradient(to top, #f0f, #0ff)';
                });
            }
        });