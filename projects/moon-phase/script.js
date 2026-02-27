        (function() {
            // ----- moon phase calculation utilities (simplified, angle-based) -----
            // We map lunation [0..1) to phase: 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter

            const canvas = document.getElementById('moonPhaseCanvas');
            const ctx = canvas.getContext('2d');
            const phaseNameLabel = document.getElementById('phaseNameLabel');
            const illumPercentSpan = document.getElementById('illumPercent');
            const moonAgeSpan = document.getElementById('moonAge');
            const nextFullSpan = document.getElementById('nextFull');
            const nextNewSpan = document.getElementById('nextNew');
            const illumFill = document.getElementById('illumFill');
            const phaseSlider = document.getElementById('phaseSlider');
            const currentDateDisplay = document.getElementById('currentDateDisplay');
            const quickContainer = document.getElementById('quickPhaseContainer');

            // phase names array
            const phaseNames = [
                "New Moon",
                "Waxing Crescent",
                "First Quarter",
                "Waxing Gibbous",
                "Full Moon",
                "Waning Gibbous",
                "Last Quarter",
                "Waning Crescent"
            ];

            // map lunation (0..1) to phase index 0-7
            function lunationToPhaseIndex(lunation) {
                // lunation 0 = new moon, 0.5 = full moon.
                // Normalize to 0-1, then to 8 bins
                const idx = Math.floor((lunation % 1) * 8) % 8;
                return idx;
            }

            // get phase name from lunation (0-1)
            function getPhaseName(lunation) {
                return phaseNames[lunationToPhaseIndex(lunation)];
            }

            // calculate illumination percentage (0-1) from lunation (0-1)
            // illumination = 50% * (1 - cos(2*pi*lunation)) -> 0 at new, 1 at full.
            function illuminationFromLunation(lunation) {
                return 0.5 * (1 - Math.cos(2 * Math.PI * lunation));
            }

            // age in days (assuming 29.53 days cycle)
            const CYCLE_DAYS = 29.53058867;

            function daysFromLunation(lunation) {
                return (lunation * CYCLE_DAYS).toFixed(1);
            }

            // draw moon on canvas given lunation (0..1)
            function drawMoon(lunation) {
                const w = canvas.width;
                const h = canvas.height;
                ctx.clearRect(0, 0, w, h);
                
                // background (space)
                ctx.fillStyle = '#0a0f18';
                ctx.fillRect(0, 0, w, h);
                
                // draw outer glow
                ctx.shadowColor = '#c0d8ff';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(w/2, h/2, 170, 0, 2 * Math.PI);
                ctx.fillStyle = '#182536';
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';

                // main moon circle (dark base)
                ctx.beginPath();
                ctx.arc(w/2, h/2, 160, 0, 2 * Math.PI);
                ctx.fillStyle = '#1e293b';
                ctx.fill();
                ctx.strokeStyle = '#56759b';
                ctx.lineWidth = 2;
                ctx.stroke();

                // calculate phase angle: lunation 0 = new (fully dark), 0.5 = full (fully bright)
                // we'll draw illuminated portion as a white ellipse offset.
                // we use terminator at x = cos(2pi*lunation) * radius
                const rad = 160;
                const centerX = w/2;
                const centerY = h/2;
                
                // terminator position: from -rad (new: fully dark left) to +rad (full: fully bright)
                // we map illumination such that lunation 0-> terminator = -rad (all dark), 0.5-> +rad (all bright)
                // but for drawing we can do it using clipping.
                // simpler: use composite operation to draw illuminated part as a white circle clipped by half-plane
                
                // first, draw the dark part (shadowed) — we draw gray background, but we already filled with #1e293b.
                // Then draw illuminated area (white/yellowish) with proper terminator.
                
                // determine direction: waxing (0->0.5) illuminated on the right side, waning (0.5->1) illuminated on left.
                const t = (lunation % 1.0);
                
                // angle of illumination: 0° at new, 180° at full. terminator line perpendicular.
                // we use clipping region: for waxing (0-0.5), illuminated side is right half (x > centerX + offset)
                // but offset moves terminator.
                
                // terminator offset from center: maps from -rad (new) to +rad (full) and back.
                let offset;
                if (t <= 0.5) {
                    // waxing: offset goes from -rad to +rad
                    offset = -rad + (t * 2) * (2 * rad); // at t=0 -> -rad, t=0.5 -> +rad
                } else {
                    // waning: offset goes from +rad back to -rad
                    offset = rad - ((t - 0.5) * 2) * (2 * rad); // t=0.5->+rad, t=1->-rad
                }
                
                // terminator line x = centerX + offset; but we want illuminated side opposite the sun.
                // for waxing: sun on right -> illuminated right side (x > centerX+offset) 
                // for waning: sun on left (after full) -> illuminated left side (x < centerX+offset)
                
                ctx.save();
                // clip to moon circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, rad, 0, 2*Math.PI);
                ctx.clip();

                // draw illuminated overlay
                ctx.beginPath();
                ctx.arc(centerX, centerY, rad, 0, 2*Math.PI);
                
                // gradient fill for illuminated part (soft)
                const grad = ctx.createLinearGradient(centerX-50, centerY-50, centerX+80, centerY+80);
                grad.addColorStop(0, '#fafaf0');
                grad.addColorStop(0.8, '#ffe6aa');
                
                // we fill the whole circle then clip to illuminated region using composite.
                // simpler: we set fillStyle but restrict drawing with clipping region based on terminator.
                ctx.fillStyle = grad;
                
                // define clipping for illuminated region:
                ctx.save();
                ctx.beginPath();
                if (t <= 0.5) { // waxing: right side illuminated
                    // rectangle from terminator line to right edge
                    ctx.rect(centerX + offset, centerY - rad*2, rad*2, rad*4);
                } else { // waning: left side illuminated
                    ctx.rect(centerX - rad*2, centerY - rad*2, rad*2 - offset + rad, rad*4); // left side up to terminator
                }
                ctx.clip();
                
                // fill illuminated area
                ctx.fill();
                ctx.restore();

                // restore canvas state
                ctx.restore();

                // add specular/highlight
                ctx.beginPath();
                ctx.arc(centerX-25, centerY-25, 20, 0, 2*Math.PI);
                ctx.fillStyle = '#ffffff10';
                ctx.fill();

                // draw tiny stars around? optional but nice.
            }

            // update all UI based on lunation (0..1)
            function updateFromLunation(lunation) {
                // ensure within 0-1
                lunation = lunation % 1.0;
                if (lunation < 0) lunation += 1.0;

                // phase name
                const phaseIdx = lunationToPhaseIndex(lunation);
                const phaseName = phaseNames[phaseIdx];
                phaseNameLabel.textContent = phaseName;

                // illumination percent
                const illum = illuminationFromLunation(lunation);
                const illumPercent = Math.round(illum * 100);
                illumPercentSpan.textContent = illumPercent + '%';
                illumFill.style.width = illumPercent + '%';

                // moon age in days
                const ageDays = (lunation * CYCLE_DAYS).toFixed(1);
                moonAgeSpan.textContent = ageDays + ' days';

                // next full / new moon estimation: days until next full (lunation 0.5)
                let daysToFull, daysToNew;
                if (lunation <= 0.5) {
                    daysToFull = ((0.5 - lunation) * CYCLE_DAYS).toFixed(1);
                } else {
                    daysToFull = ((1.5 - lunation) * CYCLE_DAYS).toFixed(1);
                }
                if (lunation <= 1.0) {
                    daysToNew = ((1.0 - lunation) * CYCLE_DAYS).toFixed(1);
                } else {
                    daysToNew = ((2.0 - lunation) * CYCLE_DAYS).toFixed(1);
                }
                nextFullSpan.textContent = `in ${daysToFull} days`;
                nextNewSpan.textContent = `in ${daysToNew} days`;

                // draw canvas
                drawMoon(lunation);

                // sync slider without triggering event loop
                phaseSlider.value = lunation * 100;

                // highlight active quick chip
                document.querySelectorAll('.phase-chip').forEach(chip => {
                    const chipLun = parseFloat(chip.dataset.lunation);
                    if (Math.abs(chipLun - lunation) < 0.01) chip.classList.add('active-chip');
                    else chip.classList.remove('active-chip');
                });
            }

            // handle slider input
            function onSliderChange() {
                const val = parseFloat(phaseSlider.value) / 100;
                updateFromLunation(val);
            }

            // compute today's lunation (simplified: using a fixed reference date: known new moon: 2024-10-02 18:49 UTC? we use simple epoch)
            // new moon reference: 2023-01-21 20:53 UTC (known). Let's set epoch for easier: 2023-01-22 00:00 as new? but anyway we want demo.
            // use a simpler fixed offset: for demo purposes, set a known lunation for today.
            function getTodaysLunation() {
                // using Jan 1 2025 as new moon approx (actual new moon Jan 11 2025, but we want something)
                // we'll use a fixed reference to make it look reasonable: choose new moon on 2025-01-11.
                const refNewMoon = new Date('2025-01-11T00:00:00Z').getTime();
                const now = new Date().getTime();
                const diffDays = (now - refNewMoon) / (1000 * 3600 * 24);
                const lunation = (diffDays / CYCLE_DAYS) % 1.0;
                return lunation >= 0 ? lunation : lunation + 1.0;
            }

            // set today's date display
            function updateDateDisplay() {
                const today = new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                currentDateDisplay.textContent = today.toLocaleDateString(undefined, options);
            }

            // create quick phase chips
            function initQuickChips() {
                const quickPhases = [
                    { name: '🌑 new', lunation: 0.0 },
                    { name: '🌒 waxing crescent', lunation: 0.125 },
                    { name: '🌓 first quarter', lunation: 0.25 },
                    { name: '🌔 waxing gibbous', lunation: 0.375 },
                    { name: '🌕 full', lunation: 0.5 },
                    { name: '🌖 waning gibbous', lunation: 0.625 },
                    { name: '🌗 last quarter', lunation: 0.75 },
                    { name: '🌘 waning crescent', lunation: 0.875 }
                ];
                quickContainer.innerHTML = '';
                quickPhases.forEach(p => {
                    const chip = document.createElement('span');
                    chip.className = 'phase-chip';
                    chip.textContent = p.name;
                    chip.dataset.lunation = p.lunation;
                    chip.addEventListener('click', () => {
                        updateFromLunation(p.lunation);
                    });
                    quickContainer.appendChild(chip);
                });
            }

            // event listeners
            phaseSlider.addEventListener('input', onSliderChange);

            document.getElementById('todayBtn').addEventListener('click', () => {
                const todaysLunation = getTodaysLunation();
                updateFromLunation(todaysLunation);
            });

            // initial set
            updateDateDisplay();
            initQuickChips();

            // set initial lunation: start with waxing gibbous (around 0.4)
            const startLunation = 0.4; // waxing gibbous
            updateFromLunation(startLunation);
        })();