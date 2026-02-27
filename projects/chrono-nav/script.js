        (function() {
            // ---------- CHRONO-NAVIGATOR : temporal landscape ----------
            const canvas = document.getElementById('chronoCanvas');
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;

            // DOM elements
            const dilationSlider = document.getElementById('dilationSlider');
            const foldSlider = document.getElementById('foldSlider');
            const resonanceSlider = document.getElementById('resonanceSlider');
            const dilationSpan = document.getElementById('dilationVal');
            const foldSpan = document.getElementById('foldVal');
            const resonanceSpan = document.getElementById('resonanceVal');

            const currentEra = document.getElementById('currentEra');
            const paradoxLevel = document.getElementById('paradoxLevel');
            const entropyVal = document.getElementById('entropyVal');
            const markerPast = document.getElementById('markerPast');
            const markerPresent = document.getElementById('markerPresent');
            const markerFuture = document.getElementById('markerFuture');
            const timelineVerse = document.getElementById('timelineVerse');
            const eraDescription = document.getElementById('eraDescription');
            const chronoFlux = document.getElementById('chronoFlux');
            const memoryDecay = document.getElementById('memoryDecay');
            const causality = document.getElementById('causality');
            const timelineID = document.getElementById('timelineID');
            const fluxA = document.getElementById('fluxA');
            const fluxB = document.getElementById('fluxB');
            const fluxC = document.getElementById('fluxC');
            const chronoPoem = document.getElementById('chronoPoem');

            // internal state
            let dilation = 0.48, folding = 0.31, resonance = 0.62;
            let era = 1; // 0: past, 1: present, 2: future
            let frame = 0;
            let time = 0;

            // verse bank
            const verseBank = [
                "time bends like light",
                "yesterday is a mountain",
                "tomorrow's shadow",
                "the present is a door",
                "echoes from the future",
                "a fracture in time",
                "memory is a river",
                "the clock dissolves",
                "causality is a suggestion",
                "all moments at once"
            ];

            // update all derived data + redraw canvas
            function navigateTime() {
                // read sliders
                dilation = parseFloat(dilationSlider.value);
                folding = parseFloat(foldSlider.value);
                resonance = parseFloat(resonanceSlider.value);

                dilationSpan.innerText = dilation.toFixed(2);
                foldSpan.innerText = folding.toFixed(2);
                resonanceSpan.innerText = resonance.toFixed(2);

                // era based on button (0,1,2) plus modifiers
                const eras = ["PALEOZOIC", "HOLOCENE", "NEXUS"];
                if (era === 0) currentEra.innerText = eras[0];
                else if (era === 1) currentEra.innerText = eras[1];
                else currentEra.innerText = eras[2];

                // paradox level
                const paradox = (0.1 + dilation * 0.5 + folding * 0.3).toFixed(2);
                paradoxLevel.innerText = paradox;

                // entropy
                const entropy = (0.3 + resonance * 0.6 + folding * 0.2).toFixed(2);
                entropyVal.innerText = entropy;

                // markers text based on era
                if (era === 0) {
                    markerPast.innerText = '◀◀ DEEP TIME';
                    markerPresent.innerText = '◆ ECHO';
                    markerFuture.innerText = 'VEIL ▶';
                } else if (era === 1) {
                    markerPast.innerText = '◀ PAST';
                    markerPresent.innerText = '◆ NOW';
                    markerFuture.innerText = 'FUTURE ▶';
                } else {
                    markerPast.innerText = '◀ ECHO';
                    markerPresent.innerText = '◆ NEXUS';
                    markerFuture.innerText = 'BEYOND ▶';
                }

                // verse
                const verseIdx = Math.floor((dilation*10 + folding*8 + time) % verseBank.length);
                timelineVerse.innerText = '"' + verseBank[verseIdx] + '"';
                eraDescription.innerText = era === 0 ? 'deep time distortion' : (era === 1 ? 'present moment flux' : 'future echo chamber');

                // paradox values
                chronoFlux.innerText = (0.5 + dilation * 0.5).toFixed(2);
                memoryDecay.innerText = (0.3 + folding * 0.6).toFixed(2);
                causality.innerText = (0.7 - resonance * 0.3).toFixed(2);

                // timeline ID
                const hex1 = Math.floor(Math.random()*0xFFFF).toString(16).toUpperCase().padStart(4,'0');
                const hex2 = Math.floor(Math.random()*0xFF).toString(16).toUpperCase().padStart(2,'0');
                timelineID.innerText = `LINE: 0x${hex1} · ${hex2}`;

                // flux values
                fluxA.innerText = (0.2 + dilation * 0.7).toFixed(2);
                fluxB.innerText = (0.3 + folding * 0.6).toFixed(2);
                fluxC.innerText = (0.4 + resonance * 0.5).toFixed(2);

                const poems = ["navigating timelines...", "chronos weeps", "time is a spiral", "eternity now", "the clock has no hands"];
                chronoPoem.innerText = poems[Math.floor(Math.random() * poems.length)];

                drawTimeline();
            }

            // canvas drawing — abstract temporal landscape
            function drawTimeline() {
                ctx.clearRect(0, 0, w, h);
                // deep background
                const grad = ctx.createLinearGradient(0, 0, w, h);
                grad.addColorStop(0, '#020617');
                grad.addColorStop(1, '#14253d');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // horizon line (time axis)
                const midY = h * 0.6;
                ctx.beginPath();
                ctx.moveTo(0, midY);
                ctx.lineTo(w, midY);
                ctx.strokeStyle = '#5f9eff40';
                ctx.lineWidth = 2;
                ctx.stroke();

                // temporal waves (influence of dilation, folding)
                for (let wave=0; wave<5; wave++) {
                    ctx.beginPath();
                    for (let x=0; x<w; x+=15) {
                        const t = x / w;
                        const depth = (Math.sin(x*0.02 + time*2 + wave) * 20 * dilation) + (Math.cos(x*0.01 + folding*10) * 30 * folding);
                        const y = midY + depth + wave*15;
                        if (x===0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    const hue = 200 + wave*10 + resonance*30;
                    ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.3)`;
                    ctx.lineWidth = 1.5 + resonance*3;
                    ctx.stroke();
                }

                // time particles (memory echoes)
                for (let p=0; p<40; p++) {
                    const x = (p * 37 + time*50) % w;
                    const y = midY + Math.sin(x*0.02 + time*3) * 40 * dilation + Math.cos(p*2 + folding*10) * 30;
                    ctx.fillStyle = `rgba(180, 220, 255, ${0.2+resonance*0.3})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 4 + dilation*8, 0, 2*Math.PI);
                    ctx.fill();
                }

                // era-specific overlays
                if (era === 0) { // past: sepia/reddish tint
                    ctx.fillStyle = '#ffdbb530';
                    ctx.fillRect(0,0,w,h);
                } else if (era === 2) { // future: cool cyan tint
                    ctx.fillStyle = '#a0f0ff20';
                    ctx.fillRect(0,0,w,h);
                }

                // time folds (folding effect)
                for (let f=0; f<3; f++) {
                    const foldX = w * (0.3 + f*0.3 + folding*0.2);
                    ctx.beginPath();
                    ctx.moveTo(foldX, 0);
                    ctx.lineTo(foldX + 20*folding, h);
                    ctx.strokeStyle = `rgba(255,200,100,${0.3+folding*0.3})`;
                    ctx.lineWidth = 3 + folding*10;
                    ctx.stroke();
                }

                // text overlay
                ctx.font = "12px 'JetBrains Mono'";
                ctx.fillStyle = "#b0d2ff";
                ctx.fillText("t=" + time.toFixed(2), 30, 40);
            }

            // era button handlers
            document.getElementById('eraPast').addEventListener('click', () => { era = 0; navigateTime(); });
            document.getElementById('eraPresent').addEventListener('click', () => { era = 1; navigateTime(); });
            document.getElementById('eraFuture').addEventListener('click', () => { era = 2; navigateTime(); });

            // sliders
            dilationSlider.addEventListener('input', navigateTime);
            foldSlider.addEventListener('input', navigateTime);
            resonanceSlider.addEventListener('input', navigateTime);

            // canvas click for random mutation
            canvas.addEventListener('click', () => {
                dilation = Math.min(1, Math.max(0, dilation + (Math.random()*0.2 - 0.1)));
                folding = Math.min(1, Math.max(0, folding + (Math.random()*0.2 - 0.1)));
                resonance = Math.min(1, Math.max(0, resonance + (Math.random()*0.2 - 0.1)));
                dilationSlider.value = dilation;
                foldSlider.value = folding;
                resonanceSlider.value = resonance;
                navigateTime();
            });

            // animation loop
            function animate() {
                frame++;
                time += 0.02;
                if (frame % 5 === 0) {
                    // update some dynamic fields without full regenerate? just redraw canvas and maybe flux
                    drawTimeline();
                    // occasionally update flux/poem
                    if (frame % 15 === 0) {
                        fluxA.innerText = (0.2 + dilation * 0.7 + Math.sin(time)*0.1).toFixed(2);
                        fluxB.innerText = (0.3 + folding * 0.6 + Math.cos(time*0.8)*0.1).toFixed(2);
                        fluxC.innerText = (0.4 + resonance * 0.5 + Math.sin(time*1.2)*0.1).toFixed(2);
                        const poems = ["navigating timelines...", "chronos weeps", "time is a spiral", "eternity now", "the clock has no hands"];
                        chronoPoem.innerText = poems[Math.floor(Math.random() * poems.length)];
                    }
                } else {
                    drawTimeline();
                }
                requestAnimationFrame(animate);
            }

            // init
            navigateTime();
            animate();

        })();