    (function() {
        // ---------- ANCIENT ARCHITECTURE DATASET ----------
        const monuments = [
            { name: "Great Pyramid", location: "Giza, Egypt", era: "Egyptian", century: "26th c. BCE", description: "Last standing wonder of the ancient world.", icon: "fa-solid fa-pyramid", footprint: "⚊ 230m base" },
            { name: "Parthenon", location: "Athens, Greece", era: "Greek", century: "447 BCE", description: "Temple of Athena, masterpiece of Doric order.", icon: "fa-solid fa-columns", footprint: "69.5 x 30.9m" },
            { name: "Colosseum", location: "Rome, Italy", era: "Roman", century: "80 CE", description: "Flavian Amphitheatre, held 50k spectators.", icon: "fa-solid fa-roman-statue", footprint: "189m long" },
            { name: "Angkor Wat", location: "Siem Reap, Cambodia", era: "Asian", century: "12th c.", description: "Largest religious structure, Hindu then Buddhist.", icon: "fa-solid fa-dragon", footprint: "162.6ha" },
            { name: "Chichén Itzá", location: "Yucatán, México", era: "Mesoamerican", century: "600–1200 CE", description: "El Castillo pyramid, serpent shadow equinox.", icon: "fa-solid fa-mask", footprint: "6.5km²" },
            { name: "Petra", location: "Jordan", era: "Roman", century: "5th c. BCE – 1st c.", description: "Nabatean city carved into rose-red cliff.", icon: "fa-solid fa-mountain", footprint: "Al-Khazneh" },
            { name: "Great Wall", location: "China", era: "Asian", century: "7th c. BCE – 16th c.", description: "Series of fortifications over 21,000 km.", icon: "fa-solid fa-wall", footprint: "21,196 km" },
            { name: "Luxor Temple", location: "Thebes, Egypt", era: "Egyptian", century: "1400 BCE", description: "Dedicated to Amun-Ra, giant colonnades.", icon: "fa-solid fa-chess-board", footprint: "190m long" },
            { name: "Temple of Olympian Zeus", location: "Athens, Greece", era: "Greek", century: "6th c. BCE – 131 CE", description: "Colossal Corinthian temple, 104 columns.", icon: "fa-solid fa-university", footprint: "41m x 108m" },
            { name: "Teotihuacan", location: "Mexico", era: "Mesoamerican", century: "100 BCE – 250 CE", description: "City of pyramids: Sun and Moon.", icon: "fa-solid fa-sun", footprint: "20km²" },
            { name: "Hagia Sophia", location: "Istanbul, Turkey", era: "Roman", century: "537 CE", description: "Byzantine cathedral, massive dome.", icon: "fa-regular fa-building", footprint: "82m x 73m" },
            { name: "Moai Statues", location: "Easter Island", era: "Asian", century: "1250–1500", description: "Monolithic human figures, Rapa Nui.", icon: "fa-solid fa-people-group", footprint: "13m tall" },
            { name: "Stonehenge", location: "Wiltshire, UK", era: "European", century: "3000–2000 BCE", description: "Neolithic ring of standing stones.", icon: "fa-solid fa-circle-notch", footprint: "33m diameter" },
            { name: "Horyu-ji", location: "Nara, Japan", era: "Asian", century: "607 CE", description: "Buddhist temple, oldest wooden buildings.", icon: "fa-brands fa-pagelines", footprint: "pagoda" }
        ];

        // references
        const grid = document.getElementById('ancientGrid');
        const searchInput = document.getElementById('searchInput');
        const eraButtons = document.querySelectorAll('.era-btn');
        
        let activeEra = "all";
        let searchText = "";

        // helper: normalize era (for filter)
        function normalizeEra(monumentEra) {
            return monumentEra.trim().toLowerCase();
        }

        // filter & render
        function renderAncientWonders() {
            const filtered = monuments.filter(item => {
                // era match
                const eraMatch = activeEra === "all" || item.era.toLowerCase() === activeEra.toLowerCase();
                // search match (name, location, description, era, century)
                const lowerSearch = searchText.toLowerCase();
                const searchMatch = !searchText || 
                    item.name.toLowerCase().includes(lowerSearch) ||
                    item.location.toLowerCase().includes(lowerSearch) ||
                    item.description.toLowerCase().includes(lowerSearch) ||
                    item.era.toLowerCase().includes(lowerSearch) ||
                    item.century.toLowerCase().includes(lowerSearch);
                return eraMatch && searchMatch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="no-results-antiquity"><i class="fa-regular fa-compass"></i>  no ancient ruins match your dig</div>`;
                return;
            }

            const cards = filtered.map((m, idx) => {
                // small rotation offset for each (via style)
                const rotDelay = idx * 0.04;
                return `
                <div class="antiquity-card" style="animation-delay: ${rotDelay}s;">
                    <div class="ruin-icon"><i class="${m.icon}"></i></div>
                    <div class="ruin-name">${m.name}</div>
                    <div class="ruin-location"><i class="fa-regular fa-map"></i> ${m.location}</div>
                    <div class="ruin-era"><i class="fa-regular fa-calendar"></i> ${m.century}</div>
                    <div class="ruin-desc">${m.description}</div>
                    <div class="ruin-footprint">
                        <span><i class="fa-regular fa-square"></i> ${m.footprint}</span>
                        <span><i class="fa-regular fa-gem"></i> ${m.era}</span>
                    </div>
                </div>
                `;
            }).join('');
            grid.innerHTML = cards;
        }

        // event listeners for era buttons
        eraButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                eraButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const era = btn.dataset.era; // 'all', 'Egyptian', ...
                activeEra = era;
                renderAncientWonders();
            });
        });

        // search input
        searchInput.addEventListener('input', (e) => {
            searchText = e.target.value;
            renderAncientWonders();
        });

        // initial render
        renderAncientWonders();

        // tiny extra: active era default "all" already set in html
    })();