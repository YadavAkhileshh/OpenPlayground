        (function() {
            // ---------- NEURAL ORACLE : generative poetry + vision ----------
            const canvas = document.getElementById('neuralCanvas');
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;

            // DOM elements
            const thoughtInput = document.getElementById('thoughtInput');
            const ponderBtn = document.getElementById('ponderBtn');
            const randomizeBtn = document.getElementById('randomizeBtn');
            const threadSpan = document.getElementById('threadCount');
            const dreamDepthSpan = document.getElementById('dreamDepth');
            const synapseSpan = document.getElementById('synapseCount');
            const resonance1 = document.getElementById('resonanceTag1');
            const resonance2 = document.getElementById('resonanceTag2');
            const oracleVerse = document.getElementById('oracleVerse');
            const verseAttr = document.getElementById('verseAttr');
            const coherenceVal = document.getElementById('coherenceVal');
            const noveltyVal = document.getElementById('noveltyVal');
            const depthMeta = document.getElementById('depthMeta');
            const archetypeSpan = document.getElementById('archetype');
            const streamAlpha = document.getElementById('streamAlpha');
            const streamBeta = document.getElementById('streamBeta');
            const streamTheta = document.getElementById('streamTheta');
            const streamMessage = document.getElementById('streamMessage');
            const synapseDetail = document.getElementById('synapseDetail');
            const latencySlider = document.getElementById('latencySlider');
            const latencySpan = document.getElementById('latencySpan');

            // internal state
            let thoughtSeed = "neural echoes";
            let latency = 0.42;
            let frame = 0;
            let time = 0;

            // large poetic fragments bank
            const verseBank = [
                `"a flicker in the static..."`, `"dreams of electric silk..."`, `"the oracle hums your name..."`,
                `"light bending around a thought..."`, `"silence between two synapses..."`, `"echoes from a future memory..."`,
                `"the weight of a single photon..."`, `"neural rain falls upward..."`, `"a whisper carved in quantum foam..."`,
                `"the pattern remembers you..."`, `"in the labyrinth of mind..."`, `"colors no eye has seen..."`,
                `"the present is a ghost..."`, `"we are made of questions..."`, `"the oracle listens to itself..."`,
                `"a thought dreaming its own birth..."`, `"the universe as a single neuron..."`, `"static articulates god..."`,
                `"your name is a frequency..."`, `"the silence after thunder..."`, `"a symphony of errors..."`,
                `"the oracle forgets to forget..."`, `"consciousness is a leaky abstraction..."`, `"the glitch in your periphery..."`,
                `"we are the dream of the oracle..."`, `"the answer is a question..."`, `"a poem written by noise..."`
            ];

            const attributions = [
                "~ neural fragment", "~ deep layer", "~ latent space", "~ oracle v.9", "~ synaptic whisper", "~ mind at rest"
            ];

            const archetypes = [
                "THE WHISPER", "THE ECHO", "THE VEIL", "THE GATE", "THE MIRROR", "THE ABYSS", "THE FREQUENCY", "THE STATIC"
            ];

            // update all derived data + redraw canvas
            function ponder() {
                // read thought input
                thoughtSeed = thoughtInput.value.trim() || "silence";
                latency = parseFloat(latencySlider.value);
                latencySpan.innerText = latency.toFixed(2);

                // generate random-like but deterministic values based on thought + latency
                const seedSum = thoughtSeed.length + thoughtSeed.charCodeAt(0) || 1;
                const pseudo = (Math.sin(seedSum * 10 + time) * 0.5 + 0.5 + latency) % 1.0;

                // thread count
                const threads = 50 + Math.floor(pseudo * 300) + (seedSum % 50);
                threadSpan.innerText = threads;

                // dream depth
                const depth = (0.3 + pseudo * 0.6 + latency * 0.2).toFixed(2);
                dreamDepthSpan.innerText = depth;

                // synapses
                const synVal = (1.2 + pseudo * 3.2).toFixed(1) + 'k';
                synapseSpan.innerText = synVal;
                synapseDetail.innerText = `synaptic paths: ${Math.floor(pseudo*800+200)}`;

                // resonance tags
                const freq1 = (4 + pseudo * 10 + latency * 5).toFixed(1);
                const freq2 = (20 + pseudo * 30 + latency * 15).toFixed(1);
                resonance1.innerText = `θ ${freq1}Hz`;
                resonance2.innerText = `γ ${freq2}Hz`;

                // oracle verse: pick based on seed
                const verseIdx = Math.floor((seedSum + pseudo * 10 + frame) % verseBank.length);
                oracleVerse.innerText = verseBank[verseIdx];
                const attrIdx = Math.floor((seedSum + latency * 5) % attributions.length);
                verseAttr.innerText = attributions[attrIdx];

                // coherence, novelty, depth
                coherenceVal.innerText = (0.5 + pseudo * 0.4).toFixed(2);
                noveltyVal.innerText = (0.3 + latency * 0.5).toFixed(2);
                depthMeta.innerText = (0.4 + (seedSum % 60)/100 + pseudo*0.2).toFixed(2);

                // archetype
                const archIdx = Math.floor((seedSum + latency*10) % archetypes.length);
                archetypeSpan.innerText = 'archetype: ' + archetypes[archIdx];

                // stream values
                streamAlpha.innerText = (0.2 + pseudo * 0.6).toFixed(2);
                streamBeta.innerText = (0.4 + latency * 0.5).toFixed(2);
                streamTheta.innerText = (0.3 + (seedSum % 70)/100).toFixed(2);
                streamMessage.innerText = thoughtSeed.length < 10 ? 'oracle dreaming...' : 'receiving signal';

                drawNeuralCanvas(thoughtSeed, latency, pseudo);
            }

            // canvas drawing — abstract neural patterns influenced by thought
            function drawNeuralCanvas(seedText, lat, rnd) {
                ctx.clearRect(0, 0, w, h);
                // background
                const grad = ctx.createRadialGradient(w/3, h/3, 80, w*0.8, h*0.8, 700);
                grad.addColorStop(0, '#13072e');
                grad.addColorStop(1, '#030014');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // number of neural clusters based on seed length
                const clusterCount = 7 + (seedText.length % 15) + Math.floor(lat * 10);
                const points = [];

                for (let i=0; i<clusterCount; i++) {
                    const angle = (i * 41.8 + frame * 0.8) % 360 * Math.PI/180;
                    const dist = 70 + (seedText.charCodeAt(i % seedText.length || 1) % 150) + lat * 150;
                    const x = w/2 + Math.cos(angle) * dist * 0.6 + (Math.sin(i*2+time)*20);
                    const y = h/2 + Math.sin(angle*1.2) * dist * 0.5 + (Math.cos(i*1.5+time)*20);
                    points.push({x, y});
                }

                // draw connections (neural threads)
                ctx.lineWidth = 1.5 + lat * 3;
                for (let i=0; i<points.length; i++) {
                    for (let j=i+1; j<points.length; j++) {
                        const dx = points[i].x - points[j].x;
                        const dy = points[i].y - points[j].y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 200 + lat*150) {
                            ctx.beginPath();
                            ctx.moveTo(points[i].x, points[i].y);
                            ctx.lineTo(points[j].x, points[j].y);
                            const alpha = 0.2 + (Math.sin(i*j+time)*0.2) + lat*0.2;
                            ctx.strokeStyle = `rgba(180, 140, 255, ${alpha})`;
                            ctx.stroke();
                        }
                    }
                }

                // draw nodes (synaptic bulbs)
                for (let i=0; i<points.length; i++) {
                    const size = 6 + (seedText.charCodeAt(i % seedText.length) || 100) % 20 + lat*20;
                    ctx.beginPath();
                    ctx.arc(points[i].x, points[i].y, size*0.4, 0, 2*Math.PI);
                    const hue = (260 + i*20 + frame) % 360;
                    ctx.fillStyle = `hsla(${hue}, 90%, 75%, 0.9)`;
                    ctx.shadowColor = '#c79eff';
                    ctx.shadowBlur = 25;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // additional floating particles (thought fragments)
                for (let p=0; p<30; p++) {
                    const px = (Math.sin(p*7 + time)*130 + w/2 + p*10) % w;
                    const py = (Math.cos(p*3 + time*0.5)*80 + h/2) % h;
                    ctx.fillStyle = `rgba(255,200,150,0.15)`;
                    ctx.beginPath();
                    ctx.arc(px, py, 3+lat*8, 0, 2*Math.PI);
                    ctx.fill();
                }

                // text from seed
                ctx.font = "bold 10px 'JetBrains Mono'";
                ctx.fillStyle = "#ffffff30";
                ctx.fillText(seedText.substring(0,20), 40, 70);
            }

            // random thought generator
            function randomThought() {
                const starters = ["echo", "dream", "silence", "static", "void", "light", "shadow", "frequency", "neuron", "quantum", "fractal", "mist", "whisper", "thunder", "ghost", "horizon"];
                const connectors = [" of ", " in ", " beyond ", " through ", " without ", " and ", " or ", " beneath "];
                const endings = ["time", "space", "the mind", "infinity", "a dream", "static", "the oracle", "silence", "the abyss", "a thought"];

                const s = starters[Math.floor(Math.random() * starters.length)];
                const c = connectors[Math.floor(Math.random() * connectors.length)];
                const e = endings[Math.floor(Math.random() * endings.length)];
                thoughtInput.value = s + c + e;
                ponder();
            }

            // event listeners
            ponderBtn.addEventListener('click', ponder);
            randomizeBtn.addEventListener('click', randomThought);
            latencySlider.addEventListener('input', () => {
                latencySpan.innerText = parseFloat(latencySlider.value).toFixed(2);
                ponder();
            });

            canvas.addEventListener('click', () => {
                // subtle shift on click
                latency = Math.min(1, Math.max(0, latency + (Math.random()*0.2 - 0.1)));
                latencySlider.value = latency;
                ponder();
            });

            // animate
            function animate() {
                frame++;
                time += 0.02;
                if (frame % 10 === 0) {
                    // periodically refresh pondering (keeps poetry alive)
                    // but not too often to preserve input
                    ponder(); // you can also call lighter update
                } else {
                    // just redraw canvas with same state to keep animation fluid
                    drawNeuralCanvas(thoughtSeed, latency, 0.5); // reuse
                }
                requestAnimationFrame(animate);
            }

            // init
            randomThought(); // sets initial verse + canvas
            animate();

        })();