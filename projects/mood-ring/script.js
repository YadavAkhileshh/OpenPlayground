        const moods = [
            { name: "PEACE", color: "#a8e6cf", phrase: "calm like the ocean" },
            { name: "JOY", color: "#ffd93d", phrase: "bouncing with butterflies" },
            { name: "FIRE", color: "#ff6b6b", phrase: "passion ignites" },
            { name: "DREAM", color: "#6c5ce7", phrase: "head in the clouds" },
            { name: "EARTH", color: "#51a351", phrase: "grounded and growing" },
            { name: "LOVE", color: "#ff8a8a", phrase: "heart wide open" },
            { name: "MYSTERY", color: "#a55eea", phrase: "something magical awaits" },
            { name: "ENERGY", color: "#f9ca24", phrase: "sparks are flying" }
        ];
        
        const ring = document.getElementById('moodRing');
        const moodName = document.getElementById('moodName');
        const moodPhrase = document.getElementById('moodPhrase');
        
        function setMood(index) {
            const mood = moods[index % moods.length];
            
            // Update ring with conic gradient based on mood (simplified: change base color)
            ring.style.background = `radial-gradient(circle at 30% 30%, white, ${mood.color})`;
            ring.style.boxShadow = `0 20px 30px rgba(0,0,0,0.3), 0 0 80px ${mood.color}`;
            
            moodName.textContent = mood.name;
            moodPhrase.textContent = `✨ ${mood.phrase} ✨`;
        }
        
        ring.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * moods.length);
            setMood(randomIndex);
        });
        
        ring.addEventListener('mouseenter', () => {
            ring.style.transform = 'scale(1.05)';
            ring.style.transition = '0.3s';
        });
        
        ring.addEventListener('mouseleave', () => {
            ring.style.transform = 'scale(1)';
        });
        
        // Initialize
        setMood(0);