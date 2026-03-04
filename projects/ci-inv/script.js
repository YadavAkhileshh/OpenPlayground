    (function() {
        // ---------- SCIENTIST DATA (inspired by famous names) ----------
        const scientists = [
            { name: "Galileo Galilei", field: "Astronomy", invention: "improved telescope, heliocentrism", description: "Father of modern observational astronomy.", icon: "fa-solid fa-telescope" },
            { name: "Marie Curie", field: "Physics/Chemistry", invention: "discovery of Radium & Polonium", description: "First person to win two Nobel Prizes.", icon: "fa-solid fa-radiation" },
            { name: "Albert Einstein", field: "Physics", invention: "Theory of Relativity", description: "E = mc², changed our view of space-time.", icon: "fa-regular fa-lightbulb" },
            { name: "Nikola Tesla", field: "Electrical", invention: "AC motor, Tesla coil", description: "Visionary of modern electricity.", icon: "fa-solid fa-bolt" },
            { name: "Isaac Newton", field: "Physics", invention: "laws of motion, calculus", description: "Laid groundwork for classical mechanics.", icon: "fa-solid fa-apple-alt" },
            { name: "Ada Lovelace", field: "Computer", invention: "first algorithm", description: "World's first computer programmer.", icon: "fa-solid fa-code" },
            { name: "Louis Pasteur", field: "Chemistry", invention: "pasteurization, vaccines", description: "Pioneer of germ theory.", icon: "fa-solid fa-flask" },
            { name: "Alan Turing", field: "Computer", invention: "Turing machine, codebreaking", description: "Father of theoretical computer science.", icon: "fa-solid fa-microchip" },
            { name: "Rosalind Franklin", field: "Biology", invention: "DNA structure (Photo 51)", description: "Key work in discovering DNA double helix.", icon: "fa-solid fa-dna" },
            { name: "Thomas Edison", field: "Inventor", invention: "phonograph, light bulb", description: "Held over 1000 patents.", icon: "fa-regular fa-lightbulb" },
            { name: "Alexander Fleming", field: "Biology", invention: "penicillin", description: "Discovered first antibiotic.", icon: "fa-solid fa-capsules" },
            { name: "James Watt", field: "Engineering", invention: "improved steam engine", description: "Powered the Industrial Revolution.", icon: "fa-solid fa-gear" },
            { name: "Katherine Johnson", field: "Mathematics", invention: "orbital calculations (NASA)", description: "Human computer, spaceflight pioneer.", icon: "fa-solid fa-calculator" },
            { name: "Michael Faraday", field: "Physics", invention: "electromagnetic induction", description: "Discovered principles behind generators.", icon: "fa-solid fa-magnet" },
            { name: "Grace Hopper", field: "Computer", invention: "compiler, COBOL", description: "Rear Admiral, programming visionary.", icon: "fa-solid fa-laptop-code" },
            { name: "Nicolaus Copernicus", field: "Astronomy", invention: "heliocentric model", description: "Revolutionized our view of the cosmos.", icon: "fa-regular fa-sun" }
        ];

        // add extra unique field for filtering
        const allFields = ["All", ...new Set(scientists.map(s => s.field.split('/')[0].trim()))]; // simplified primary field

        // references
        const cardContainer = document.getElementById('cardContainer');
        const searchInput = document.getElementById('searchInput');
        const filterButtonsDiv = document.getElementById('filterButtons');

        // state
        let activeFilter = "All";
        let searchTerm = "";

        // ---------- render filter buttons ----------
        function renderFilterButtons() {
            const fieldsForButtons = ["All", "Physics", "Chemistry", "Biology", "Astronomy", "Computer", "Electrical", "Engineering", "Inventor", "Mathematics"]; // combined set
            // But to avoid missing any, we use a merged set from data + common ones.
            const uniqueFromData = [...new Set(scientists.map(s => s.field.split('/')[0].trim()))];
            const allUnique = ["All", ...new Set([...uniqueFromData, "Physics", "Chemistry", "Biology", "Astronomy", "Computer", "Electrical", "Engineering", "Inventor", "Mathematics"])];

            filterButtonsDiv.innerHTML = allUnique.map(field => {
                const lowerField = field.toLowerCase();
                const icon = field === "All" ? "fa-solid fa-grid-2" : 
                             (field === "Physics" ? "fa-solid fa-atom" :
                              field === "Chemistry" ? "fa-solid fa-flask" :
                              field === "Biology" ? "fa-solid fa-leaf" :
                              field === "Astronomy" ? "fa-regular fa-star" :
                              field === "Computer" ? "fa-solid fa-display" :
                              field === "Electrical" ? "fa-solid fa-bolt" :
                              field === "Engineering" ? "fa-solid fa-wrench" :
                              field === "Inventor" ? "fa-regular fa-lightbulb" :
                              field === "Mathematics" ? "fa-solid fa-calculator" : "fa-solid fa-tag");
                return `<button class="filter-btn ${activeFilter === field ? 'active' : ''}" data-field="${field}"><i class="${icon}"></i> ${field}</button>`;
            }).join('');
            
            // attach listeners
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const field = btn.dataset.field;
                    activeFilter = field;
                    // re-render buttons to show active
                    renderFilterButtons();
                    // apply filter + search
                    filterAndRenderCards();
                });
            });
        }

        // ---------- render cards based on filter & search ----------
        function filterAndRenderCards() {
            const filtered = scientists.filter(person => {
                // field filter
                const personPrimary = person.field.split('/')[0].trim();
                const matchesField = activeFilter === "All" || personPrimary === activeFilter || person.field.includes(activeFilter);
                
                // search filter (name, invention, description)
                const lowerSearch = searchTerm.toLowerCase();
                const matchesSearch = searchTerm === "" || 
                    person.name.toLowerCase().includes(lowerSearch) ||
                    person.invention.toLowerCase().includes(lowerSearch) ||
                    person.description.toLowerCase().includes(lowerSearch) ||
                    person.field.toLowerCase().includes(lowerSearch);
                
                return matchesField && matchesSearch;
            });

            if (filtered.length === 0) {
                cardContainer.innerHTML = `<div class="no-results"><i class="fa-regular fa-face-frown"></i> No scientists match your criteria. Try adjusting filters.</div>`;
                return;
            }

            // build cards html
            const cardsHTML = filtered.map((s, index) => {
                // icon for avatar: use font-awesome or default
                const avatarIcon = s.icon || "fa-solid fa-user-graduate";
                // field badge text (simplify)
                const fieldBadge = s.field;
                return `
                <div class="scientist-card" style="animation-delay: ${index * 0.03}s;">
                    <div class="card-avatar">
                        <i class="${avatarIcon}"></i>
                    </div>
                    <div class="scientist-name">${s.name}</div>
                    <div class="scientist-field"><i class="fa-regular fa-compass"></i> ${fieldBadge}</div>
                    <div class="scientist-desc">${s.description}</div>
                    <div class="invention-tag"><i class="fa-solid fa-microscope"></i> ${s.invention}</div>
                    <div class="card-footer">
                        <span><i class="fa-regular fa-clock"></i> pioneer</span>
                        <span><i class="fa-regular fa-star"></i> legacy</span>
                    </div>
                </div>
            `}).join('');
            
            cardContainer.innerHTML = cardsHTML;
        }

        // ---------- search handler ----------
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            filterAndRenderCards();
        });

        // ---------- initial load ----------
        renderFilterButtons();
        filterAndRenderCards();

        // optional: add keyboard clear
    })();