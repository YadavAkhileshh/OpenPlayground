        (function() {
            // ---------- SONOSPHERIC ATLAS : acoustic topography ----------
            const canvas = document.getElementById('sonicCanvas');
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;

            // DOM elements
            const pitchSlider = document.getElementById('pitchSlider');
            const harmonicsSlider = document.getElementById('harmonicsSlider');
            const resonanceSlider = document.getElementById('resonanceSonicSlider');
            const pitchSpan = document.getElementById('pitchVal');
            const harmonicsSpan = document.getElementById('harmonicsVal');
            const resonanceSpan = document.getElementById('resonanceSonicVal');

            const fundamentalFreq = document.getElementById('fundamentalFreq');
            const harmonicCount = document.getElementById('harmonicCount');
            const amplitudeVal = document.getElementById('amplitudeVal');
            const lowBand = document.getElementById('lowBand');
            const midBand = document.getElementById('midBand');
            const highBand = document.getElementById('highBand');
            const soundVerse = document.getElementById('soundVerse');
            const waveDesc = document.getElementById('waveDesc');
            const attackVal = document.getElementById('attackVal');
            const decayVal = document.getElementById('decayVal');
            const sustainVal = document.getElementById('sustainVal');
            const soundSignature = document.getElementById('soundSignature');
            const fluxLow = document.getElementById('fluxLow');
            const fluxMid = document.getElementById('fluxMid');
            const fluxHigh = document.getElementById('fluxHigh');
            const sonicPoem = document.getElementById('sonicPoem');

            // internal state
            let pitch = 0.52, harmonics = 0.38, resonance = 0.71;
            let waveType = 0; // 0: sine, 1: saw, 2: noise
            let frame = 0;
            let time = 0;

            // verse bank
            const verseBank = [
                "the mountain hums",
                "valley resonance",
                "echo in the canyon",
                "stone vibrates",
                "wind through peaks",
                "earth's frequency",
                "granite song",
                "tectonic melody",
                "the peak whispers",
                "basalt drone"
            ];

            // update all derived data + redraw canvas
            function resound() {
                // read sliders
                pitch = parseFloat(pitchSlider.value);
                harmonics = parseFloat(harmonicsSlider.value);
                resonance = parseFloat(resonanceSlider.value);

                pitchSpan.innerText = pitch.toFixed(2);
                harmonicsSpan.innerText = harmonics.toFixed(2);
                resonanceSpan.innerText = resonance.toFixed(2);

                // fundamental frequency
                const freq = 40 + pitch * 300;
                fundamentalFreq.innerText = Math.round(freq) + ' Hz';

                // harmonic count
                const harmCount = 1 + Math.floor(harmonics * 12);
                harmonicCount.innerText = harmCount;

                // amplitude
                const amp = (0.3 + resonance * 0.6).toFixed(2);
                amplitudeVal.innerText = amp;

                // band tags
                lowBand.innerText = 'LOW ' + Math.round(40 + pitch*100) + ' Hz';
                midBand.innerText = 'MID ' + Math.round(200 + harmonics*400) + ' Hz';
                highBand.innerText = 'HIGH ' + Math.round(800 + resonance*2000) + ' Hz';

                // verse
                const verseIdx = Math.floor((pitch*10 + harmonics*8 + time) % verseBank.length);
                soundVerse.innerText = '"' + verseBank[verseIdx] + '"';

                // wave description
                const waveNames = ['sine wave', 'sawtooth', 'noise field'];
                waveDesc.innerText = waveNames[waveType] + ' · ' + Math.round(freq) + ' Hz';

                // ADSR
                attackVal.innerText = (0.1 + pitch * 0.7).toFixed(2);
                decayVal.innerText = (0.2 + harmonics * 0.6).toFixed(2);
                sustainVal.innerText = (0.3 + resonance * 0.6).toFixed(2);

                // signature
                const hex1 = Math.floor(Math.random()*0xFFFF).toString(16).toUpperCase().padStart(4,'0');
                const hex2 = Math.floor(Math.random()*0xFF).toString(16).toUpperCase().padStart(2,'0');
                soundSignature.innerText = `FFT: 0x${hex1} · ${hex2}`;

                // flux values
                fluxLow.innerText = (0.2 + pitch * 0.7).toFixed(2);
                fluxMid.innerText = (0.3 + harmonics * 0.6).toFixed(2);
                fluxHigh.innerText = (0.4 + resonance * 0.5).toFixed(2);

                const poems = ["listening to mountains...", "stone resonance", "earth's hum", "granite frequencies", "tectonic song"];
                sonicPoem.innerText = poems[Math.floor(Math.random() * poems.length)];

                drawTopography();
            }

            // canvas drawing — acoustic topography influenced by sound parameters
            function drawTopography() {
                ctx.clearRect(0, 0, w, h);
                // deep background
                const grad = ctx.createLinearGradient(0, 0, w, h);
                grad.addColorStop(0, '#030c1c');
                grad.addColorStop(1, '#1a2f48');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // draw topographic layers (contour lines) based on sound waves
                const layers = 12 + Math.floor(harmonics * 20);
                for (let layer=0; layer<layers; layer++) {
                    ctx.beginPath();
                    const yOffset = h * 0.3 + layer * 20 + Math.sin(time * 2 + layer) * 10 * resonance;
                    
                    for (let x=0; x<w; x+=8) {
                        // wave function based on waveType
                        let wave = 0;
                        if (waveType === 0) { // sine
                            wave = Math.sin(x * 0.02 + time * 3 + layer * 2) * 20 * pitch;
                        } else if (waveType === 1) { // saw
                            wave = ((x * 0.02 + time * 3 + layer) % 6 - 3) * 15 * harmonics;
                        } else { // noise
                            wave = (Math.random() * 2 - 1) * 30 * resonance;
                        }
                        
                        const y = yOffset + wave + Math.cos(x * 0.01 + layer) * 15 * harmonics;
                        
                        if (x===0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    
                    const hue = 200 + layer * 5 + resonance * 30;
                    ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.1+resonance*0.2})`;
                    ctx.lineWidth = 1 + resonance * 2;
                    ctx.stroke();
                }

                // frequency peaks (mountains)
                for (let peak=0; peak<8; peak++) {
                    const x = peak * 70 + 40 + Math.sin(time + peak) * 20;
                    const height = 80 + Math.sin(peak * 2 + time) * 40 * pitch + 50 * harmonics;
                    const yBase = h * 0.7;
                    
                    ctx.beginPath();
                    ctx.moveTo(x - 25, yBase);
                    ctx.lineTo(x, yBase - height);
                    ctx.lineTo(x + 25, yBase);
                    ctx.fillStyle = `rgba(100, 180, 255, ${0.2+resonance*0.2})`;
                    ctx.fill();
                    ctx.strokeStyle = '#b0e0ff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // sound particles
                for (let p=0; p<40; p++) {
                    const x = (p * 30 + time * 50) % w;
                    const y = h * 0.3 + Math.sin(x*0.02 + time*5) * 40 * resonance + Math.cos(p*2 + harmonics*10) * 30;
                    ctx.fillStyle = `rgba(200, 220, 255, ${0.2+pitch*0.3})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 3 + resonance*6, 0, 2*Math.PI);
                    ctx.fill();
                }

                // text overlay
                ctx.font = "12px 'JetBrains Mono'";
                ctx.fillStyle = "#b0d2ff";
                ctx.fillText(waveType === 0 ? '∼' : (waveType === 1 ? '⏛' : '⌇'), 30, 50);
            }

            // wave button handlers
            document.getElementById('waveSine').addEventListener('click', () => { waveType = 0; resound(); });
            document.getElementById('waveSaw').addEventListener('click', () => { waveType = 1; resound(); });
            document.getElementById('waveNoise').addEventListener('click', () => { waveType = 2; resound(); });

            // sliders
            pitchSlider.addEventListener('input', resound);
            harmonicsSlider.addEventListener('input', resound);
            resonanceSlider.addEventListener('input', resound);

            // canvas click for random mutation
            canvas.addEventListener('click', () => {
                pitch = Math.min(1, Math.max(0, pitch + (Math.random()*0.2 - 0.1)));
                harmonics = Math.min(1, Math.max(0, harmonics + (Math.random()*0.2 - 0.1)));
                resonance = Math.min(1, Math.max(0, resonance + (Math.random()*0.2 - 0.1)));
                pitchSlider.value = pitch;
                harmonicsSlider.value = harmonics;
                resonanceSlider.value = resonance;
                resound();
            });

            // animation loop
            function animate() {
                frame++;
                time += 0.02;
                if (frame % 3 === 0) {
                    // update some dynamic fields
                    drawTopography();
                    if (frame % 15 === 0) {
                        // occasionally update flux and poem
                        fluxLow.innerText = (0.2 + pitch * 0.7 + Math.sin(time)*0.1).toFixed(2);
                        fluxMid.innerText = (0.3 + harmonics * 0.6 + Math.cos(time*0.8)*0.1).toFixed(2);
                        fluxHigh.innerText = (0.4 + resonance * 0.5 + Math.sin(time*1.2)*0.1).toFixed(2);
                        const poems = ["listening to mountains...", "stone resonance", "earth's hum", "granite frequencies", "tectonic song"];
                        sonicPoem.innerText = poems[Math.floor(Math.random() * poems.length)];
                    }
                } else {
                    drawTopography();
                }
                requestAnimationFrame(animate);
            }

            // init
            resound();
            animate();

        })();