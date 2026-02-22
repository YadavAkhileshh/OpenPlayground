
        (function() {
            // ----- anatomy database -----
            const organData = {
                'organ-heart': {
                    name: 'Heart',
                    system: 'cardiovascular',
                    desc: 'A fist-sized muscular organ located slightly left of the chest.',
                    function: 'Pumps blood through the circulatory system. It has four chambers: left/right atrium and ventricles.',
                    funFact: '💓 your heart creates enough pressure to squirt blood 30 feet!',
                    extra: 'resting heart rate: 60–100 bpm'
                },
                'organ-left-lung': {
                    name: 'Left Lung',
                    system: 'respiratory',
                    desc: 'The left lung is slightly smaller than the right to make room for the heart.',
                    function: 'Exchanges oxygen and carbon dioxide between air and blood (external respiration).',
                    funFact: '🫁 lungs contain about 2,400 kilometres of airways and 300 million alveoli.',
                    extra: 'left lung has 2 lobes, right lung has 3 lobes.'
                },
                'organ-right-lung': {
                    name: 'Right Lung',
                    system: 'respiratory',
                    desc: 'Larger than the left lung, divided into three lobes.',
                    function: 'Supplies oxygen to the blood and removes carbon dioxide.',
                    funFact: '🫁 if unfolded, the lungs would cover a tennis court!',
                    extra: 'diaphragm contraction draws air in.'
                },
                'organ-brain': {
                    name: 'Brain',
                    system: 'nervous',
                    desc: 'The control center of the body, composed of ~86 billion neurons.',
                    function: 'Processes sensory information, regulates body functions, enables thought and emotion.',
                    funFact: '🧠 while awake, your brain generates enough electricity to light a small bulb.',
                    extra: 'cerebrum · cerebellum · brainstem'
                },
                'organ-stomach': {
                    name: 'Stomach',
                    system: 'digestive',
                    desc: 'J-shaped organ that receives food from the esophagus.',
                    function: 'Secretes acid and enzymes to digest proteins; churns food into chyme.',
                    funFact: '🥘 stomach lining renews itself every few days to avoid digesting itself.',
                    extra: 'holds up to 1–1.5 liters.'
                },
                'organ-liver': {
                    name: 'Liver',
                    system: 'digestive',
                    desc: 'The largest internal organ (about 1.5 kg).',
                    function: 'Detoxifies blood, produces bile, stores glucose, synthesizes proteins.',
                    funFact: '🧪 more than 500 vital functions have been identified in the liver.',
                    extra: 'only organ that can regenerate.'
                },
                'organ-left-kidney': {
                    name: 'Left Kidney',
                    system: 'digestive', // we group kidney here for simplicity but it's urinary
                    desc: 'Bean-shaped organ located toward the back of the abdominal cavity.',
                    function: 'Filters blood to produce urine, regulates electrolytes and blood pressure.',
                    funFact: '💧 kidneys filter about 150 litres of blood daily to make 1–2 litres of urine.',
                    extra: 'left kidney sits slightly higher than right.'
                },
                'organ-right-kidney': {
                    name: 'Right Kidney',
                    system: 'digestive',
                    desc: 'Similar to left, but slightly lower due to the liver.',
                    function: 'Same: filtration, waste removal, fluid balance.',
                    funFact: '🫘 each kidney contains about 1 million nephrons.',
                    extra: 'kidneys also produce hormones.'
                },
                'organ-intestines': {
                    name: 'Intestines',
                    system: 'digestive',
                    desc: 'Small intestine (~6m) and large intestine (~1.5m).',
                    function: 'Absorb nutrients and water; form and eliminate stool.',
                    funFact: '🌿 the large intestine houses trillions of bacteria (gut microbiome).',
                    extra: 'small intestine has villi to increase surface area.'
                },
                'organ-spine': {
                    name: 'Spinal Cord',
                    system: 'nervous',
                    desc: 'Long bundle of nerves running from brainstem to lower back.',
                    function: 'Transmits signals between brain and body; controls reflexes.',
                    funFact: '⚡ protected by 33 vertebrae; a reflex arc takes only 0.02 seconds.',
                    extra: 'about 45 cm long.'
                }
            };

            // DOM elements
            const organs = document.querySelectorAll('.organ');
            const infoName = document.getElementById('organName');
            const infoSystem = document.getElementById('organSystem');
            const infoDesc = document.getElementById('organDesc');
            const infoFunction = document.getElementById('organFunction');
            const funFactSpan = document.getElementById('funFact');
            const extraFactSpan = document.getElementById('extraFact');

            // system filter buttons
            const sysButtons = document.querySelectorAll('.sys-btn');
            let activeSystem = 'all';   // 'all', 'cardiovascular', etc

            // currently selected organ id
            let currentSelectedId = 'organ-heart'; // default

            // --- functions ---
            function updateInfoPanel(organId) {
                const data = organData[organId];
                if (!data) return;

                infoName.textContent = data.name;
                infoSystem.textContent = data.system;
                infoDesc.textContent = data.desc;
                infoFunction.textContent = data.function;
                funFactSpan.innerHTML = `💡 ${data.funFact}`;
                extraFactSpan.textContent = data.extra;
            }

            function clearSelectedHighlight() {
                organs.forEach(org => org.classList.remove('selected'));
            }

            function setSelected(organId) {
                clearSelectedHighlight();
                const organEl = document.getElementById(organId);
                if (organEl) {
                    organEl.classList.add('selected');
                    currentSelectedId = organId;
                    updateInfoPanel(organId);
                }
            }

            // filter organs by system
            function applySystemFilter(system) {
                activeSystem = system;
                organs.forEach(org => {
                    const organSystem = org.dataset.system;
                    if (system === 'all' || organSystem === system) {
                        org.style.display = 'block'; // SVG elements visibility
                        org.style.opacity = '1';
                    } else {
                        org.style.display = 'block'; // keep in layout but fade
                        org.style.opacity = '0.25';
                    }
                });

                // if currently selected organ is hidden, try to pick first visible
                const currentEl = document.getElementById(currentSelectedId);
                if (currentEl && (system !== 'all' && currentEl.dataset.system !== system)) {
                    // select first visible organ
                    const firstVisible = Array.from(organs).find(org => {
                        return (system === 'all' || org.dataset.system === system);
                    });
                    if (firstVisible) {
                        setSelected(firstVisible.id);
                    } else {
                        // fallback to heart
                        setSelected('organ-heart');
                    }
                } else if (!currentEl) {
                    setSelected('organ-heart');
                }
                // update active button style
                sysButtons.forEach(btn => {
                    const btnSys = btn.dataset.system;
                    if (btnSys === system) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            }

            // --- event listeners ---
            organs.forEach(organ => {
                organ.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const organId = organ.getAttribute('id');
                    setSelected(organId);
                });
            });

            sysButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const system = btn.dataset.system;
                    applySystemFilter(system);
                });
            });

            // initial default: select heart, ensure all visible
            setSelected('organ-heart');
            // set active system to 'all'
            applySystemFilter('all');

            // bonus: click on background (svg container) doesn't change.
        })();
    