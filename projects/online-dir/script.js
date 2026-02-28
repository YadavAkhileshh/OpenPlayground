        (function() {
            // ---------- sample dataset ----------
            const people = [
                { id: 1, name: "Aisha Kapoor", role: "Product Lead", email: "aisha.k@innovate.io", dept: "Product" },
                { id: 2, name: "James Chen", role: "Frontend Architect", email: "j.chen@creativelab.com", dept: "Engineering" },
                { id: 3, name: "Elena Rossi", role: "UX Director", email: "elena.r@designstudio.net", dept: "Design" },
                { id: 4, name: "Marcus Webb", role: "DevOps Engineer", email: "marcus.webb@cloudbase.org", dept: "Engineering" },
                { id: 5, name: "Priya Mehta", role: "Content Strategist", email: "priya.m@mediahub.co", dept: "Marketing" },
                { id: 6, name: "Oliver Schmidt", role: "Data Analyst", email: "o.schmidt@dataviz.de", dept: "Data" },
                { id: 7, name: "Nadia Ahmed", role: "HR Generalist", email: "nadia.a@peoplefirst.com", dept: "HR" },
                { id: 8, name: "Liam O'Brien", role: "Customer Success", email: "liam.ob@clientlove.ie", dept: "Support" },
                { id: 9, name: "Zara van Dijk", role: "QA Lead", email: "z.vandijk@quality.nu", dept: "Engineering" },
                { id: 10, name: "Sofia Garcia", role: "Brand Manager", email: "sofia.g@brandhub.es", dept: "Marketing" },
                { id: 11, name: "David Kim", role: "Backend Developer", email: "d.kim@buildstack.io", dept: "Engineering" },
                { id: 12, name: "Claire Moreau", role: "Product Designer", email: "claire.m@designlab.fr", dept: "Design" },
                { id: 13, name: "Aarav Patel", role: "Sales Executive", email: "aarav.p@expand.com", dept: "Sales" },
                { id: 14, name: "Maya Lopez", role: "Office Manager", email: "maya.l@company.org", dept: "Admin" },
                { id: 15, name: "Chen Wei", role: "AI Researcher", email: "wei.c@futuretech.cn", dept: "Data" }
            ];

            // ---------- global UI elements ----------
            const gridEl = document.getElementById('directoryGrid');
            const searchInput = document.getElementById('searchInput');
            const searchBtn = document.getElementById('searchBtn');
            const clearBtn = document.getElementById('clearBtn');
            const filterContainer = document.getElementById('filterContainer');
            const resultCountSpan = document.getElementById('resultCount');

            // ---------- state ----------
            let currentSearchTerm = '';
            let currentFilterDept = 'All';        // 'All' or department name

            // ----- helper: get unique depts sorted -----
            const allDepts = ['All', ...new Set(people.map(p => p.dept))].sort((a,b) => {
                if (a === 'All') return -1;   // keep 'All' first
                if (b === 'All') return 1;
                return a.localeCompare(b);
            });

            // ----- render filter chips (department) -----
            function renderFilters() {
                // remove old chips except static label (filterContainer holds label + chips)
                // keep first child (span.filter-label)
                const label = filterContainer.querySelector('.filter-label');
                filterContainer.innerHTML = '';            // simpler: rebuild all
                filterContainer.appendChild(label);        // re-attach label

                allDepts.forEach(dept => {
                    const chip = document.createElement('span');
                    chip.className = 'filter-tag';
                    if (dept === currentFilterDept) chip.classList.add('active-filter');
                    chip.textContent = dept;
                    chip.setAttribute('data-dept', dept);
                    chip.addEventListener('click', () => {
                        // update active filter
                        currentFilterDept = dept;
                        renderFilters();              // refresh active style
                        applySearchAndFilter();
                    });
                    filterContainer.appendChild(chip);
                });
            }

            // ----- core filtering logic (search + dept) -----
            function filterPeople() {
                return people.filter(person => {
                    // 1) department filter
                    if (currentFilterDept !== 'All' && person.dept !== currentFilterDept) return false;

                    // 2) search term (case-insensitive, across name, role, email, dept)
                    if (currentSearchTerm.trim() !== '') {
                        const term = currentSearchTerm.trim().toLowerCase();
                        const haystack = `${person.name} ${person.role} ${person.email} ${person.dept}`.toLowerCase();
                        return haystack.includes(term);
                    }
                    return true;
                });
            }

            // ----- render person cards & update count -----
            function renderDirectory() {
                const filtered = filterPeople();
                // update result count
                const count = filtered.length;
                resultCountSpan.textContent = `${count} ${count === 1 ? 'person' : 'people'}`;

                if (filtered.length === 0) {
                    gridEl.innerHTML = `<div class="no-results">✨ no matching entries · try another filter ✨</div>`;
                    return;
                }

                // build cards
                let htmlString = '';
                filtered.forEach(p => {
                    htmlString += `
                        <div class="person-card" data-id="${p.id}" role="article">
                            <div class="person-avatar">${p.name.charAt(0)}${p.name.split(' ')[1]?.charAt(0) || ''}</div>
                            <div class="person-name">${escapeHtml(p.name)}</div>
                            <div class="person-role">${escapeHtml(p.role)}</div>
                            <div class="person-email">${escapeHtml(p.email)}</div>
                            <div class="person-department">${escapeHtml(p.dept)}</div>
                        </div>
                    `;
                });
                gridEl.innerHTML = htmlString;

                // optional: attach click event to each card (just for demo, alert with name)
                document.querySelectorAll('.person-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        // don't trigger if clicking on interactive child, but it's fine
                        const id = card.getAttribute('data-id');
                        const person = people.find(p => p.id == id);
                        if (person) {
                            alert(`📇 ${person.name} · ${person.role} (${person.dept})\n✉️ ${person.email}`);
                        }
                    });
                });
            }

            // tiny helper to avoid XSS (just for demo completeness)
            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // ----- connect search and filters -----
            function applySearchAndFilter() {
                currentSearchTerm = searchInput.value;   // read from input
                renderDirectory();
            }

            // ----- clear all filters and reset -----
            function clearAllFilters() {
                currentSearchTerm = '';
                currentFilterDept = 'All';
                searchInput.value = '';
                renderFilters();               // reset active style
                renderDirectory();
            }

            // ----- event binding -----
            searchBtn.addEventListener('click', () => {
                applySearchAndFilter();
            });

            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    applySearchAndFilter();
                }
            });

            clearBtn.addEventListener('click', clearAllFilters);

            // optional: live search as you type (debounce not needed for moderate list)
            // but we add input event for smoother feel
            searchInput.addEventListener('input', () => {
                // update results as you type (like realtime directory)
                currentSearchTerm = searchInput.value;
                renderDirectory();   // preserve current filter
            });

            // ----- initial render -----
            renderFilters();           // builds filter chips with 'All' active
            renderDirectory();         // shows full list

            // ----- ensure currentFilterDept stays in sync after renderFilters -----
            // (renderFilters overwrites based on currentFilterDept, but we also call it on filter change)
        })();