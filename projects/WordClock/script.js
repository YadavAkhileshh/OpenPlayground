
        // DOM Elements
        const wordClock = document.getElementById('wordClock');
        const timePoem = document.getElementById('timePoem');
        const dateDisplay = document.getElementById('dateDisplay');
        const digitalHour = document.getElementById('digitalHour');
        const digitalMinute = document.getElementById('digitalMinute');
        const digitalSecond = document.getElementById('digitalSecond');
        const styleButtons = document.querySelectorAll('.style-btn');
        
        // Time words mapping
        const timeWords = {
            it: ['it'],
            is: ['is'],
            a: ['a'],
            quarter: ['quarter'],
            twenty: ['twenty'],
            five: ['five'],
            half: ['half'],
            ten: ['ten'],
            to: ['to'],
            past: ['past'],
            nine: ['nine'],
            one: ['one'],
            six: ['six'],
            three: ['three'],
            four: ['four'],
            five2: ['five'],
            two: ['two'],
            eight: ['eight'],
            eleven: ['eleven'],
            seven: ['seven'],
            twelve: ['twelve'],
            ten2: ['ten'],
            oclock: ["o'clock"],
            in: ['in'],
            the: ['the'],
            night: ['night'],
            morning: ['morning'],
            afternoon: ['afternoon']
        };
        
        // Poetic styles with different time phrases
        const poeticStyles = {
            classic: {
                // Different phrases for different times of day
                earlyMorning: ["The dawn's first light", "Whispers of morning", "Night yields to day"],
                morning: ["Morning unfolds", "The day begins anew", "Sunlight on dew"],
                midday: ["The sun at its peak", "Noon's golden hour", "Day in full bloom"],
                afternoon: ["Afternoon's gentle arc", "The sun begins to wane", "Day's later chapter"],
                evening: ["Evening's soft descent", "Twilight's embrace", "Day gives way to night"],
                night: ["Night's deep quiet", "Stars begin to wake", "Moonlight's gentle reign"],
                midnight: ["The hinge of night", "Deepest stillness", "Day reborn in dark"]
            },
            romantic: {
                earlyMorning: ["Love's first awakening", "Your eyes in dawn light", "Promise of a new day"],
                morning: ["Morning's sweet embrace", "Sunlight kisses your face", "Day born of our dreams"],
                midday: ["Passion at its height", "Our love in full sun", "Hearts beating as one"],
                afternoon: ["Quiet afternoon bliss", "Lingering in your gaze", "Time slows for our kiss"],
                evening: ["Evening's tender hour", "Our shadows grow long", "Love's evening song"],
                night: ["Night's velvet curtain", "Whispers in the dark", "Our eternal spark"],
                midnight: ["Midnight's secret vow", "Love beyond time", "Our forever now"]
            },
            modern: {
                earlyMorning: ["Digital dawn breaks", "The world reboots", "Silence before noise"],
                morning: ["Notifications bloom", "Routines engage", "The daily scroll"],
                midday: ["Peak connectivity", "Algorithms hum", "Data streams converge"],
                afternoon: ["The afternoon lull", "Productivity wanes", "Distraction calls"],
                evening: ["Screens cast soft glow", "The digital unwind", "Virtual sunset"],
                night: ["Dark mode engaged", "Quiet in the feed", "Offline dreams"],
                midnight: ["The infinite scroll", "Eyes on blue light", "Time without end"]
            },
            haiku: {
                earlyMorning: ["Dawn's first light appears", "Night whispers her farewell", "A new day is born"],
                morning: ["Morning sun rises", "Dewdrops on green leaflets", "The world awakens"],
                midday: ["Sun at highest point", "Shadows grow very short", "Noontime's quiet heat"],
                afternoon: ["Afternoon sun glows", "Long shadows start to form", "Day begins to fade"],
                evening: ["Evening descends now", "Sky painted with sunset", "Day meets the nighttime"],
                night: ["Moonlight on water", "Stars tell ancient stories", "Night's deep quiet reigns"],
                midnight: ["The clock strikes midnight", "One day ends, one begins", "Timeless moment held"]
            }
        };
        
        // Current poetic style
        let currentStyle = 'classic';
        
        // Initialize style buttons
        styleButtons.forEach(button => {
            button.addEventListener('click', () => {
                styleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentStyle = button.dataset.style;
                updatePoeticTime();
            });
        });
        
        // Month and day names for date display
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        
        const dayOrdinals = {
            1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth',
            6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
            11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth',
            15: 'fifteenth', 16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth',
            19: 'nineteenth', 20: 'twentieth', 21: 'twenty-first', 22: 'twenty-second',
            23: 'twenty-third', 24: 'twenty-fourth', 25: 'twenty-fifth', 26: 'twenty-sixth',
            27: 'twenty-seventh', 28: 'twenty-eighth', 29: 'twenty-ninth', 30: 'thirtieth',
            31: 'thirty-first'
        };
        
        // Update the word clock display
        function updateWordClock(hours, minutes) {
            // Clear all active classes
            document.querySelectorAll('.word-cell').forEach(cell => {
                cell.classList.remove('active', 'time-active');
            });
            
            // Always activate "IT IS"
            document.querySelector('.w-it').classList.add('active');
            document.querySelector('.w-is').classList.add('active');
            
            // Determine time words to activate
            const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
            let minuteWord = '';
            let relation = '';
            let displayHour = hour12;
            
            // Handle minutes
            if (minutes === 0) {
                minuteWord = '';
                relation = '';
            } else if (minutes === 15) {
                minuteWord = 'quarter';
                relation = 'past';
            } else if (minutes === 30) {
                minuteWord = 'half';
                relation = 'past';
            } else if (minutes === 45) {
                minuteWord = 'quarter';
                relation = 'to';
                displayHour = (hour12 % 12) + 1;
                if (displayHour > 12) displayHour = 1;
            } else if (minutes === 20) {
                minuteWord = 'twenty';
                relation = 'past';
            } else if (minutes === 25) {
                minuteWord = 'twenty five';
                relation = 'past';
            } else if (minutes === 35) {
                minuteWord = 'twenty five';
                relation = 'to';
                displayHour = (hour12 % 12) + 1;
                if (displayHour > 12) displayHour = 1;
            } else if (minutes === 40) {
                minuteWord = 'twenty';
                relation = 'to';
                displayHour = (hour12 % 12) + 1;
                if (displayHour > 12) displayHour = 1;
            } else if (minutes === 5) {
                minuteWord = 'five';
                relation = 'past';
            } else if (minutes === 10) {
                minuteWord = 'ten';
                relation = 'past';
            } else if (minutes === 50) {
                minuteWord = 'ten';
                relation = 'to';
                displayHour = (hour12 % 12) + 1;
                if (displayHour > 12) displayHour = 1;
            } else if (minutes === 55) {
                minuteWord = 'five';
                relation = 'to';
                displayHour = (hour12 % 12) + 1;
                if (displayHour > 12) displayHour = 1;
            } else {
                // For other minutes, we'll just show the hour
                minuteWord = '';
                relation = '';
            }
            
            // Activate minute word if needed
            if (minuteWord) {
                if (minuteWord === 'quarter') {
                    document.querySelector('.w-a').classList.add('active');
                    document.querySelector('.w-quarter').classList.add('time-active');
                } else if (minuteWord === 'half') {
                    document.querySelector('.w-half').classList.add('time-active');
                } else if (minuteWord === 'twenty') {
                    document.querySelector('.w-twenty').classList.add('time-active');
                } else if (minuteWord === 'twenty five') {
                    document.querySelector('.w-twenty').classList.add('time-active');
                    document.querySelector('.w-five').classList.add('time-active');
                } else if (minuteWord === 'ten') {
                    document.querySelector('.w-ten').classList.add('time-active');
                } else if (minuteWord === 'five') {
                    document.querySelector('.w-five').classList.add('time-active');
                }
            }
            
            // Activate relation word if needed
            if (relation === 'past') {
                document.querySelector('.w-past').classList.add('time-active');
            } else if (relation === 'to') {
                document.querySelector('.w-to').classList.add('time-active');
            }
            
            // Activate hour word
            let hourWordElement = null;
            switch(displayHour) {
                case 1: hourWordElement = document.querySelector('.w-one'); break;
                case 2: hourWordElement = document.querySelector('.w-two'); break;
                case 3: hourWordElement = document.querySelector('.w-three'); break;
                case 4: hourWordElement = document.querySelector('.w-four'); break;
                case 5: hourWordElement = document.querySelector('.w-five2'); break;
                case 6: hourWordElement = document.querySelector('.w-six'); break;
                case 7: hourWordElement = document.querySelector('.w-seven'); break;
                case 8: hourWordElement = document.querySelector('.w-eight'); break;
                case 9: hourWordElement = document.querySelector('.w-nine'); break;
                case 10: hourWordElement = document.querySelector('.w-ten2'); break;
                case 11: hourWordElement = document.querySelector('.w-eleven'); break;
                case 12: hourWordElement = document.querySelector('.w-twelve'); break;
            }
            
            if (hourWordElement) {
                hourWordElement.classList.add('time-active');
            }
            
            // Activate "o'clock" if it's exactly on the hour
            if (minutes === 0) {
                document.querySelector('.w-oclock').classList.add('time-active');
            }
            
            // Activate time of day
            document.querySelector('.w-in').classList.add('active');
            document.querySelector('.w-the').classList.add('active');
            
            let timeOfDayElement = null;
            if (hours >= 5 && hours < 12) {
                timeOfDayElement = document.querySelector('.w-morning');
            } else if (hours >= 12 && hours < 18) {
                timeOfDayElement = document.querySelector('.w-afternoon');
            } else {
                timeOfDayElement = document.querySelector('.w-night');
            }
            
            if (timeOfDayElement) {
                timeOfDayElement.classList.add('time-active');
            }
        }
        
        // Update poetic time display
        function updatePoeticTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            // Get time of day category
            let timeCategory = '';
            if (hours >= 0 && hours < 5) timeCategory = 'midnight';
            else if (hours >= 5 && hours < 8) timeCategory = 'earlyMorning';
            else if (hours >= 8 && hours < 12) timeCategory = 'morning';
            else if (hours >= 12 && hours < 14) timeCategory = 'midday';
            else if (hours >= 14 && hours < 17) timeCategory = 'afternoon';
            else if (hours >= 17 && hours < 21) timeCategory = 'evening';
            else timeCategory = 'night';
            
            // Get phrases for current style and time category
            const phrases = poeticStyles[currentStyle][timeCategory];
            
            // For haiku style, split the single string into three lines
            if (currentStyle === 'haiku') {
                const haikuLines = phrases.split('\n');
                document.getElementById('line1').textContent = haikuLines[0] || phrases;
                document.getElementById('line2').textContent = haikuLines[1] || '';
                document.getElementById('line3').textContent = haikuLines[2] || '';
            } else {
                // Select random phrases for variety
                const line1 = phrases[Math.floor(Math.random() * phrases.length)];
                let line2 = phrases[Math.floor(Math.random() * phrases.length)];
                let line3 = phrases[Math.floor(Math.random() * phrases.length)];
                
                // Ensure we don't repeat the same line
                while (line2 === line1) {
                    line2 = phrases[Math.floor(Math.random() * phrases.length)];
                }
                while (line3 === line1 || line3 === line2) {
                    line3 = phrases[Math.floor(Math.random() * phrases.length)];
                }
                
                document.getElementById('line1').textContent = line1;
                document.getElementById('line2').textContent = line2;
                document.getElementById('line3').textContent = line3;
            }
        }
        
        // Update date display
        function updateDateDisplay() {
            const now = new Date();
            const dayName = days[now.getDay()];
            const date = now.getDate();
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();
            
            const ordinal = dayOrdinals[date] || date + 'th';
            dateDisplay.textContent = `${dayName}, the ${ordinal} of ${monthName} ${year}`;
        }
        
        // Update digital time display
        function updateDigitalTime() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            digitalHour.textContent = hours.toString().padStart(2, '0');
            digitalMinute.textContent = minutes.toString().padStart(2, '0');
            digitalSecond.textContent = seconds.toString().padStart(2, '0');
        }
        
        // Main update function
        function updateClock() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            
            updateWordClock(hours, minutes);
            updatePoeticTime();
            updateDigitalTime();
            
            // Update date every minute (not every second)
            if (now.getSeconds() === 0) {
                updateDateDisplay();
            }
        }
        
        // Initialize
        updateDateDisplay();
        updateClock();
        
        // Update the clock every second
        setInterval(updateClock, 1000);
        
        // Add some random "breathing" animation to active words
        setInterval(() => {
            const activeWords = document.querySelectorAll('.word-cell.time-active');
            activeWords.forEach(word => {
                const scale = 1.05 + Math.random() * 0.05;
                word.style.transform = `scale(${scale})`;
                
                // Random subtle color variation
                const hue = 40 + Math.random() * 10;
                word.style.color = `hsl(${hue}, 70%, 85%)`;
            });
        }, 2000);
        
        // Add initial animation
        window.addEventListener('load', () => {
            const words = document.querySelectorAll('.word-cell');
            words.forEach((word, index) => {
                word.style.opacity = '0';
                word.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    word.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    word.style.opacity = '1';
                    word.style.transform = 'scale(1)';
                }, index * 20);
            });
        });
    