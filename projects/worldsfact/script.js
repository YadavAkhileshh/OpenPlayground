
        // World Facts Database
        const worldFacts = {
            science: [
                { id: 101, fact: "A single bolt of lightning contains enough energy to toast 100,000 slices of bread.", source: "NASA" },
                { id: 102, fact: "The human nose can detect over 1 trillion different scents.", source: "Science Magazine" },
                { id: 103, fact: "Bananas are naturally radioactive due to their potassium content, but you'd need to eat 10 million bananas at once to die of radiation poisoning.", source: "University of Cambridge" },
                { id: 104, fact: "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to orbit the Sun.", source: "NASA" },
                { id: 105, fact: "Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.", source: "National Geographic" },
                { id: 106, fact: "Water can boil and freeze at the same time under the right conditions, a phenomenon known as the 'triple point'.", source: "Scientific American" },
                { id: 107, fact: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.", source: "Smithsonian Magazine" },
                { id: 108, fact: "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron on hot days.", source: "Official Eiffel Tower Website" },
                { id: 109, fact: "There are more atoms in a single glass of water than there are glasses of water in all the oceans on Earth.", source: "University of California" },
                { id: 110, fact: "A neutron star is so dense that a teaspoon of its material would weigh about 10 million tons on Earth.", source: "NASA" }
            ],
            history: [
                { id: 201, fact: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.", source: "Historical Records" },
                { id: 202, fact: "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.", source: "Guinness World Records" },
                { id: 203, fact: "In Ancient Rome, people used urine as a mouthwash. The ammonia in urine acted as a cleansing agent.", source: "Roman History Texts" },
                { id: 204, fact: "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.", source: "NASA" },
                { id: 205, fact: "Vikings navigated using sunstones (calcite crystals) that could locate the sun even on cloudy days.", source: "Archaeological Studies" },
                { id: 206, fact: "The Titanic's chief baker survived the sinking by drinking copious amounts of alcohol, which insulated him from the freezing water.", source: "Titanic Survivor Accounts" },
                { id: 207, fact: "In 1923, jockey Frank Hayes won a horse race at Belmont Park in New York despite having died of a heart attack mid-race.", source: "New York Times Archives" },
                { id: 208, fact: "Albert Einstein was offered the presidency of Israel in 1952 but declined, saying he lacked the necessary people skills.", source: "Einstein Archives" },
                { id: 209, fact: "The Library of Alexandria wasn't destroyed in a single fire but gradually declined over several centuries.", source: "Historical Research" },
                { id: 210, fact: "Napoleon was once attacked by a horde of rabbits while hunting. His servants had released tame rabbits, which swarmed him thinking he had food.", source: "French Historical Accounts" }
            ],
            space: [
                { id: 301, fact: "There is a planet made of diamonds called 55 Cancri e that's twice the size of Earth and about 40 light-years away.", source: "Yale University Research" },
                { id: 302, fact: "One day on Mercury is equivalent to 59 Earth days, while one year is only 88 Earth days.", source: "NASA" },
                { id: 303, fact: "If two pieces of the same type of metal touch in space, they will permanently bond together in a process called cold welding.", source: "European Space Agency" },
                { id: 304, fact: "The footprints on the Moon will stay there for at least 100 million years since there's no wind or water to erode them.", source: "NASA" },
                { id: 305, fact: "The largest known star, UY Scuti, is so big that if it replaced our Sun, it would extend beyond the orbit of Jupiter.", source: "Astronomy & Astrophysics Journal" },
                { id: 306, fact: "Space is completely silent because there's no air to carry sound waves.", source: "NASA" },
                { id: 307, fact: "A teaspoon of a neutron star would weigh about 10 million tons, roughly the same as Mount Everest.", source: "Harvard-Smithsonian Center for Astrophysics" },
                { id: 308, fact: "The Sun makes up 99.86% of the mass of our entire solar system.", source: "NASA Solar System Fact Sheet" },
                { id: 309, fact: "Venus is the only planet in our solar system that rotates clockwise. All others rotate counter-clockwise.", source: "NASA Venus Fact Sheet" },
                { id: 310, fact: "There are more stars in the universe than grains of sand on all the beaches on Earth.", source: "Hubble Space Telescope Institute" }
            ],
            geography: [
                { id: 401, fact: "Canada has more lakes than the rest of the world's lakes combined.", source: "World Resources Institute" },
                { id: 402, fact: "The driest place on Earth is the Atacama Desert in Chile, where some areas haven't seen rain in over 400 years.", source: "NASA Earth Observatory" },
                { id: 403, fact: "Russia spans 11 time zones, the most of any country in the world.", source: "Russian Geographical Society" },
                { id: 404, fact: "Istanbul is the only city in the world located on two continents: Europe and Asia.", source: "National Geographic" },
                { id: 405, fact: "The African country of Lesotho is the only independent state in the world that lies entirely above 1,000 meters (3,281 ft) in elevation.", source: "UNESCO" },
                { id: 406, fact: "The Pacific Ocean is so large that it could fit all of Earth's landmasses inside it and still have room for another Africa.", source: "NOAA" },
                { id: 407, fact: "Mount Everest grows about 4 mm higher every year due to tectonic plate movement.", source: "National Geographic Society" },
                { id: 408, fact: "The Amazon Rainforest produces 20% of the world's oxygen.", source: "World Wildlife Fund" },
                { id: 409, fact: "There are no deserts in Europe. It's the only continent without one.", source: "European Environment Agency" },
                { id: 410, fact: "Alaska is the westernmost, easternmost, and northernmost state in the U.S. due to the Aleutian Islands crossing the 180th meridian.", source: "U.S. Geological Survey" }
            ],
            nature: [
                { id: 501, fact: "A blue whale's heart is so large that a human could swim through its arteries.", source: "National Geographic" },
                { id: 502, fact: "Octopuses have blue blood, three hearts, and can change color and texture to blend into their surroundings in milliseconds.", source: "Marine Biological Laboratory" },
                { id: 503, fact: "The world's oldest known living tree is a bristlecone pine named Methuselah, located in California's White Mountains. It's estimated to be over 4,800 years old.", source: "National Geographic" },
                { id: 504, fact: "A single strand of spider silk is stronger than a steel wire of the same thickness.", source: "University of Oxford" },
                { id: 505, fact: "Crows are so intelligent that they can recognize human faces and hold grudges against people who have treated them poorly.", source: "University of Washington" },
                { id: 506, fact: "The immortal jellyfish (Turritopsis dohrnii) can revert back to its juvenile polyp stage after reaching maturity, essentially making it biologically immortal.", source: "Marine Biology Journal" },
                { id: 507, fact: "Some species of bamboo can grow up to 91 cm (36 inches) in just 24 hours.", source: "Kew Royal Botanic Gardens" },
                { id: 508, fact: "A group of flamingos is called a 'flamboyance'.", source: "Oxford English Dictionary" },
                { id: 509, fact: "The smell of freshly cut grass is actually a plant distress call, releasing chemicals to warn nearby plants and attract beneficial insects.", source: "Scientific Reports Journal" },
                { id: 510, fact: "The pistol shrimp can create a bubble that reaches temperatures of 4,400°C (7,952°F) - hotter than the surface of the Sun - when it snaps its claw.", source: "Nature Journal" }
            ],
            culture: [
                { id: 601, fact: "In Japan, there are more than 20 different ways to say 'sorry', each with a different level of formality and context.", source: "Japanese Language Institute" },
                { id: 602, fact: "The national anthem of Greece has 158 verses, but only the first two are commonly sung.", source: "Greek Ministry of Culture" },
                { id: 603, fact: "In Denmark, it's traditional to throw cinnamon on people who are still single when they turn 25.", source: "Danish Cultural Institute" },
                { id: 604, fact: "The world's oldest known recipe is for beer, found on a 3,900-year-old Sumerian tablet.", source: "University of Chicago" },
                { id: 605, fact: "In Switzerland, it's illegal to own just one guinea pig because they're social animals and get lonely.", source: "Swiss Animal Protection Act" },
                { id: 606, fact: "The shortest commercial flight in the world is in Scotland, from Westray to Papa Westray, lasting just 47 seconds.", source: "Guinness World Records" },
                { id: 607, fact: "In France, it's illegal to name a pig 'Napoleon'.", source: "French Civil Code" },
                { id: 608, fact: "The 'Happy Birthday' song is still under copyright until 2030 in the United States, which is why restaurants often sing their own versions.", source: "U.S. Copyright Office" },
                { id: 609, fact: "Iceland has no mosquitoes. The climate is too cold for them to complete their life cycle.", source: "Icelandic Institute of Natural History" },
                { id: 610, fact: "In the Philippines, there's a festival where participants throw tomatoes at each other, similar to Spain's La Tomatina.", source: "Philippine Department of Tourism" }
            ]
        };

        // App state
        const appState = {
            currentCategory: 'all',
            currentFactIndex: 0,
            factsViewed: 0,
            favorites: JSON.parse(localStorage.getItem('worldFactsFavorites')) || [],
            history: JSON.parse(localStorage.getItem('worldFactsHistory')) || [],
            searchQuery: '',
            currentFacts: []
        };

        // DOM Elements
        const categoryItems = document.querySelectorAll('.category-item');
        const currentCategoryName = document.getElementById('current-category-name');
        const currentFactIndex = document.getElementById('current-fact-index');
        const totalCategoryFacts = document.getElementById('total-category-facts');
        const factContent = document.getElementById('fact-content');
        const factCategoryTag = document.getElementById('fact-category-tag');
        const factSource = document.getElementById('fact-source');
        const factId = document.getElementById('fact-id');
        const factCard = document.getElementById('fact-card');
        const searchBox = document.getElementById('search-box');
        const historyList = document.getElementById('history-list');

        // Stats elements
        const totalFactsElement = document.getElementById('total-facts');
        const factsViewedElement = document.getElementById('facts-viewed');
        const favoritesCountElement = document.getElementById('favorites-count');
        const allCountElement = document.getElementById('all-count');
        const scienceCountElement = document.getElementById('science-count');
        const historyCountElement = document.getElementById('history-count');
        const spaceCountElement = document.getElementById('space-count');
        const geographyCountElement = document.getElementById('geography-count');
        const natureCountElement = document.getElementById('nature-count');
        const cultureCountElement = document.getElementById('culture-count');

        // Buttons
        const prevFactBtn = document.getElementById('prev-fact');
        const randomFactBtn = document.getElementById('random-fact');
        const favoriteBtn = document.getElementById('favorite-btn');
        const nextFactBtn = document.getElementById('next-fact');

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            updateFactCounts();
            updateStats();
            loadCurrentCategory();
            updateHistoryDisplay();
            setupEventListeners();
            showRandomFact();
        });

        // Setup event listeners
        function setupEventListeners() {
            // Category selection
            categoryItems.forEach(item => {
                item.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    switchCategory(category);
                });
            });
            
            // Navigation buttons
            prevFactBtn.addEventListener('click', showPreviousFact);
            randomFactBtn.addEventListener('click', showRandomFact);
            nextFactBtn.addEventListener('click', showNextFact);
            favoriteBtn.addEventListener('click', toggleFavorite);
            
            // Search functionality
            searchBox.addEventListener('input', function() {
                appState.searchQuery = this.value.toLowerCase();
                filterFacts();
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(event) {
                // Left arrow for previous fact
                if (event.key === 'ArrowLeft') {
                    showPreviousFact();
                }
                // Right arrow for next fact
                else if (event.key === 'ArrowRight') {
                    showNextFact();
                }
                // Space or R for random fact
                else if (event.key === ' ' || event.key === 'r' || event.key === 'R') {
                    event.preventDefault();
                    showRandomFact();
                }
                // F for favorite
                else if (event.key === 'f' || event.key === 'F') {
                    toggleFavorite();
                }
            });
        }

        // Update fact counts in the sidebar
        function updateFactCounts() {
            let totalFacts = 0;
            
            for (const category in worldFacts) {
                const count = worldFacts[category].length;
                totalFacts += count;
                
                // Update category count elements
                const countElement = document.getElementById(`${category}-count`);
                if (countElement) {
                    countElement.textContent = count;
                }
            }
            
            // Update total facts
            totalFactsElement.textContent = totalFacts;
            allCountElement.textContent = totalFacts;
        }

        // Update statistics
        function updateStats() {
            factsViewedElement.textContent = appState.factsViewed;
            favoritesCountElement.textContent = appState.favorites.length;
        }

        // Switch category
        function switchCategory(category) {
            appState.currentCategory = category;
            appState.currentFactIndex = 0;
            
            // Update active category in sidebar
            categoryItems.forEach(item => {
                if (item.getAttribute('data-category') === category) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Update category name display
            const categoryNames = {
                'all': 'All Facts',
                'science': 'Science',
                'history': 'History',
                'space': 'Space',
                'geography': 'Geography',
                'nature': 'Nature',
                'culture': 'Culture'
            };
            
            currentCategoryName.textContent = categoryNames[category];
            currentCategoryName.innerHTML = `<i class="fas fa-${getCategoryIcon(category)}"></i> ${categoryNames[category]}`;
            
            // Load facts for the category
            loadCurrentCategory();
            
            // Show first fact
            if (appState.currentFacts.length > 0) {
                displayFact(appState.currentFacts[0]);
            } else {
                displayNoFactsMessage();
            }
        }

        // Get icon for category
        function getCategoryIcon(category) {
            const icons = {
                'all': 'star',
                'science': 'flask',
                'history': 'landmark',
                'space': 'rocket',
                'geography': 'globe-asia',
                'nature': 'leaf',
                'culture': 'theater-masks'
            };
            return icons[category] || 'star';
        }

        // Load current category facts
        function loadCurrentCategory() {
            if (appState.currentCategory === 'all') {
                // Combine all facts
                appState.currentFacts = [];
                for (const category in worldFacts) {
                    appState.currentFacts = appState.currentFacts.concat(
                        worldFacts[category].map(fact => ({
                            ...fact,
                            category: category
                        }))
                    );
                }
            } else {
                // Get facts from specific category
                appState.currentFacts = worldFacts[appState.currentCategory].map(fact => ({
                    ...fact,
                    category: appState.currentCategory
                }));
            }
            
            // Apply search filter if any
            if (appState.searchQuery) {
                filterFacts();
            }
            
            // Update total facts count for category
            totalCategoryFacts.textContent = appState.currentFacts.length;
            
            // Shuffle the facts for random experience
            shuffleArray(appState.currentFacts);
        }

        // Filter facts based on search query
        function filterFacts() {
            if (!appState.searchQuery) {
                loadCurrentCategory();
                return;
            }
            
            const query = appState.searchQuery.toLowerCase();
            
            if (appState.currentCategory === 'all') {
                // Filter across all categories
                appState.currentFacts = [];
                for (const category in worldFacts) {
                    const filtered = worldFacts[category]
                        .filter(fact => 
                            fact.fact.toLowerCase().includes(query) || 
                            fact.source.toLowerCase().includes(query)
                        )
                        .map(fact => ({
                            ...fact,
                            category: category
                        }));
                    
                    appState.currentFacts = appState.currentFacts.concat(filtered);
                }
            } else {
                // Filter within current category
                appState.currentFacts = worldFacts[appState.currentCategory]
                    .filter(fact => 
                        fact.fact.toLowerCase().includes(query) || 
                        fact.source.toLowerCase().includes(query)
                    )
                    .map(fact => ({
                        ...fact,
                        category: appState.currentCategory
                    }));
            }
            
            totalCategoryFacts.textContent = appState.currentFacts.length;
            appState.currentFactIndex = 0;
            
            if (appState.currentFacts.length > 0) {
                displayFact(appState.currentFacts[0]);
            } else {
                displayNoFactsMessage();
            }
        }

        // Display a fact
        function displayFact(fact) {
            if (!fact) return;
            
            // Update fact display
            factContent.textContent = fact.fact;
            factSource.textContent = `Source: ${fact.source}`;
            factId.textContent = fact.id.toString().padStart(3, '0');
            
            // Update category tag
            const categoryColors = {
                'science': 'var(--science)',
                'history': 'var(--history)',
                'space': 'var(--space)',
                'geography': 'var(--geography)',
                'nature': 'var(--nature)',
                'culture': 'var(--culture)'
            };
            
            const categoryNames = {
                'science': 'Science',
                'history': 'History',
                'space': 'Space',
                'geography': 'Geography',
                'nature': 'Nature',
                'culture': 'Culture'
            };
            
            factCategoryTag.textContent = categoryNames[fact.category];
            factCategoryTag.style.backgroundColor = categoryColors[fact.category];
            
            // Update fact index display
            currentFactIndex.textContent = appState.currentFactIndex + 1;
            
            // Update favorite button
            updateFavoriteButton(fact.id);
            
            // Add to history
            addToHistory(fact);
            
            // Update facts viewed count
            appState.factsViewed++;
            updateStats();
            
            // Save to localStorage
            localStorage.setItem('worldFactsViewed', appState.factsViewed);
        }

        // Display message when no facts are found
        function displayNoFactsMessage() {
            factContent.textContent = "No facts found matching your search. Try a different search term or category.";
            factSource.textContent = "";
            factId.textContent = "000";
            factCategoryTag.textContent = "No Results";
            factCategoryTag.style.backgroundColor = "var(--gray)";
            currentFactIndex.textContent = "0";
            favoriteBtn.disabled = true;
        }

        // Show previous fact
        function showPreviousFact() {
            if (appState.currentFacts.length === 0) return;
            
            appState.currentFactIndex--;
            if (appState.currentFactIndex < 0) {
                appState.currentFactIndex = appState.currentFacts.length - 1;
            }
            
            displayFact(appState.currentFacts[appState.currentFactIndex]);
        }

        // Show next fact
        function showNextFact() {
            if (appState.currentFacts.length === 0) return;
            
            appState.currentFactIndex++;
            if (appState.currentFactIndex >= appState.currentFacts.length) {
                appState.currentFactIndex = 0;
            }
            
            displayFact(appState.currentFacts[appState.currentFactIndex]);
        }

        // Show random fact
        function showRandomFact() {
            if (appState.currentFacts.length === 0) return;
            
            // If we're in "all" category, sometimes pick from a random category for variety
            if (appState.currentCategory === 'all' && Math.random() > 0.7) {
                const categories = Object.keys(worldFacts);
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const randomFactFromCategory = worldFacts[randomCategory][Math.floor(Math.random() * worldFacts[randomCategory].length)];
                
                // Create a fact object with category
                const factWithCategory = {
                    ...randomFactFromCategory,
                    category: randomCategory
                };
                
                // Find index in current facts (might not be there due to search filter)
                const foundIndex = appState.currentFacts.findIndex(f => f.id === factWithCategory.id);
                if (foundIndex >= 0) {
                    appState.currentFactIndex = foundIndex;
                    displayFact(appState.currentFacts[foundIndex]);
                } else {
                    // If not found in filtered results, just display it
                    displayFact(factWithCategory);
                }
            } else {
                // Regular random selection from current facts
                appState.currentFactIndex = Math.floor(Math.random() * appState.currentFacts.length);
                displayFact(appState.currentFacts[appState.currentFactIndex]);
            }
        }

        // Add fact to history
        function addToHistory(fact) {
            // Check if fact is already in history
            const existingIndex = appState.history.findIndex(item => item.id === fact.id);
            
            // Remove if already exists (to bring it to the front)
            if (existingIndex >= 0) {
                appState.history.splice(existingIndex, 1);
            }
            
            // Add to beginning of history
            appState.history.unshift({
                id: fact.id,
                fact: fact.fact,
                category: fact.category,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 10 items
            if (appState.history.length > 10) {
                appState.history = appState.history.slice(0, 10);
            }
            
            // Update display
            updateHistoryDisplay();
            
            // Save to localStorage
            localStorage.setItem('worldFactsHistory', JSON.stringify(appState.history));
        }

        // Update history display
        function updateHistoryDisplay() {
            if (appState.history.length === 0) {
                historyList.innerHTML = `
                    <li class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>Your fact history will appear here</p>
                    </li>
                `;
                return;
            }
            
            const categoryColors = {
                'science': 'var(--science)',
                'history': 'var(--history)',
                'space': 'var(--space)',
                'geography': 'var(--geography)',
                'nature': 'var(--nature)',
                'culture': 'var(--culture)'
            };
            
            const categoryNames = {
                'science': 'Science',
                'history': 'History',
                'space': 'Space',
                'geography': 'Geography',
                'nature': 'Nature',
                'culture': 'Culture'
            };
            
            historyList.innerHTML = '';
            
            appState.history.forEach(item => {
                const historyItem = document.createElement('li');
                historyItem.className = 'history-item';
                
                // Format time
                const time = new Date(item.timestamp);
                const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                historyItem.innerHTML = `
                    <div class="history-fact">${item.fact}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="history-category" style="background-color: ${categoryColors[item.category]}">
                            ${categoryNames[item.category]}
                        </span>
                        <span style="color: var(--gray); font-size: 0.8rem;">${timeString}</span>
                    </div>
                `;
                
                // Add click event to load this fact
                historyItem.addEventListener('click', function() {
                    // Find the fact in current facts
                    const factIndex = appState.currentFacts.findIndex(f => f.id === item.id);
                    if (factIndex >= 0) {
                        appState.currentFactIndex = factIndex;
                        displayFact(appState.currentFacts[factIndex]);
                    }
                });
                
                historyList.appendChild(historyItem);
            });
        }

        // Toggle favorite status
        function toggleFavorite() {
            if (appState.currentFacts.length === 0) return;
            
            const currentFact = appState.currentFacts[appState.currentFactIndex];
            const factId = currentFact.id;
            
            // Check if already favorited
            const favoriteIndex = appState.favorites.indexOf(factId);
            
            if (favoriteIndex >= 0) {
                // Remove from favorites
                appState.favorites.splice(favoriteIndex, 1);
            } else {
                // Add to favorites
                appState.favorites.push(factId);
            }
            
            // Update button and save
            updateFavoriteButton(factId);
            localStorage.setItem('worldFactsFavorites', JSON.stringify(appState.favorites));
            updateStats();
        }

        // Update favorite button
        function updateFavoriteButton(factId) {
            const isFavorite = appState.favorites.includes(factId);
            
            if (isFavorite) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Remove Favorite';
                favoriteBtn.classList.add('active');
            } else {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
                favoriteBtn.classList.remove('active');
            }
            
            favoriteBtn.disabled = false;
        }

        // Utility function to shuffle array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    