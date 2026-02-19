
        // Yoga poses data
        const yogaPoses = [
            {
                id: 1,
                name: "Downward-Facing Dog",
                sanskrit: "Adho Mukha Svanasana",
                difficulty: "beginner",
                category: "standing",
                focus: ["flexibility", "strength"],
                image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A foundational yoga pose that stretches the entire body while building strength.",
                instructions: [
                    "Start on your hands and knees with wrists under shoulders and knees under hips.",
                    "Spread your fingers wide and press firmly through your palms.",
                    "Tuck your toes and lift your hips up and back, straightening your legs as much as possible.",
                    "Keep your head between your arms and gaze toward your navel.",
                    "Hold for 5-10 breaths, then slowly release back to hands and knees."
                ],
                benefits: [
                    "Strengthens arms and shoulders",
                    "Stretches hamstrings, calves, and spine",
                    "Improves digestion",
                    "Calms the mind and relieves stress",
                    "Energizes the body"
                ],
                precautions: "Avoid this pose if you have wrist, shoulder, or back injuries. Use caution if you have high blood pressure."
            },
            {
                id: 2,
                name: "Warrior II",
                sanskrit: "Virabhadrasana II",
                difficulty: "beginner",
                category: "standing",
                focus: ["strength", "balance"],
                image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A powerful standing pose that builds strength and stability while improving focus.",
                instructions: [
                    "Stand with feet wide apart, about 4-5 feet.",
                    "Turn your right foot out 90 degrees and left foot in slightly.",
                    "Bend your right knee until it's directly over your right ankle.",
                    "Extend your arms parallel to the floor, reaching actively in opposite directions.",
                    "Gaze over your right hand and hold for 5-10 breaths.",
                    "Repeat on the other side."
                ],
                benefits: [
                    "Strengthens legs and ankles",
                    "Stretches groins and chest",
                    "Improves balance and concentration",
                    "Stimulates abdominal organs",
                    "Increases stamina"
                ],
                precautions: "Avoid if you have knee or hip injuries. Those with neck problems should keep gaze forward instead of turning head."
            },
            {
                id: 3,
                name: "Tree Pose",
                sanskrit: "Vrikshasana",
                difficulty: "beginner",
                category: "balance",
                focus: ["balance", "concentration"],
                image: "https://images.unsplash.com/photo-1593810450967-f9c42742e326?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A balancing pose that improves focus and stability while strengthening the legs.",
                instructions: [
                    "Stand tall with feet together and arms at your sides.",
                    "Shift weight to your left foot and place the sole of your right foot on your inner left thigh.",
                    "Bring your palms together at your chest in prayer position.",
                    "For a greater challenge, extend arms overhead like branches of a tree.",
                    "Focus on a fixed point to help maintain balance.",
                    "Hold for 5-10 breaths, then switch sides."
                ],
                benefits: [
                    "Improves balance and coordination",
                    "Strengthens legs and core",
                    "Increases focus and concentration",
                    "Stretches thighs, groins, and shoulders",
                    "Improves posture"
                ],
                precautions: "Avoid if you have low blood pressure or balance issues. Use a wall for support if needed."
            },
            {
                id: 4,
                name: "Cobra Pose",
                sanskrit: "Bhujangasana",
                difficulty: "beginner",
                category: "backbend",
                focus: ["flexibility", "strength"],
                image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A gentle backbend that strengthens the spine and opens the chest.",
                instructions: [
                    "Lie on your stomach with legs extended and tops of feet on the floor.",
                    "Place your hands under your shoulders, elbows close to your body.",
                    "Press the tops of your feet and thighs firmly into the floor.",
                    "Inhale and slowly lift your chest off the floor, using your back muscles.",
                    "Keep elbows slightly bent and shoulders away from your ears.",
                    "Hold for 3-5 breaths, then exhale and release back down."
                ],
                benefits: [
                    "Strengthens the spine",
                    "Stretches chest and shoulders",
                    "Improves flexibility of the upper back",
                    "Stimulates abdominal organs",
                    "Helps relieve stress and fatigue"
                ],
                precautions: "Avoid if you have a back injury, carpal tunnel syndrome, or headache. Pregnant women should avoid this pose."
            },
            {
                id: 5,
                name: "Triangle Pose",
                sanskrit: "Trikonasana",
                difficulty: "intermediate",
                category: "standing",
                focus: ["flexibility", "strength"],
                image: "https://images.unsplash.com/photo-1593810451137-5dc55105dace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A standing pose that creates length and space throughout the entire body.",
                instructions: [
                    "Stand with feet wide apart, about 3-4 feet.",
                    "Turn your right foot out 90 degrees and left foot in slightly.",
                    "Extend arms parallel to the floor.",
                    "Reach toward your right foot with your right hand, lowering it to your shin, ankle, or the floor.",
                    "Extend your left arm straight up toward the ceiling.",
                    "Gaze up at your left hand and hold for 5-10 breaths.",
                    "Repeat on the other side."
                ],
                benefits: [
                    "Stretches hips, groins, hamstrings, and calves",
                    "Strengthens legs and knees",
                    "Opens chest and shoulders",
                    "Improves digestion",
                    "Relieves stress"
                ],
                precautions: "Avoid if you have low blood pressure, migraine, or neck injuries. Those with high blood pressure should look forward instead of up."
            },
            {
                id: 6,
                name: "Headstand",
                sanskrit: "Sirsasana",
                difficulty: "advanced",
                category: "inversion",
                focus: ["strength", "balance"],
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "Often called the 'king of asanas', this inversion strengthens the entire body and calms the mind.",
                instructions: [
                    "Kneel on the floor and interlace your fingers, placing your forearms on the ground.",
                    "Place the crown of your head on the floor, cradled by your hands.",
                    "Lift your hips and walk your feet closer to your head.",
                    "Slowly lift your legs off the ground, bending your knees if needed.",
                    "Once balanced, extend your legs straight up toward the ceiling.",
                    "Hold for 10-30 seconds, then slowly release.",
                    "Rest in Child's Pose afterward."
                ],
                benefits: [
                    "Strengthens arms, shoulders, and core",
                    "Improves balance and concentration",
                    "Stimulates the pituitary and pineal glands",
                    "Calms the nervous system",
                    "Improves digestion"
                ],
                precautions: "Avoid if you have neck injuries, high blood pressure, heart conditions, or glaucoma. Never practice without proper instruction and preparation."
            },
            {
                id: 7,
                name: "Pigeon Pose",
                sanskrit: "Eka Pada Rajakapotasana",
                difficulty: "intermediate",
                category: "seated",
                focus: ["flexibility", "relaxation"],
                image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A deep hip opener that releases tension and improves flexibility.",
                instructions: [
                    "Start on all fours in tabletop position.",
                    "Bring your right knee forward toward your right wrist.",
                    "Slide your left leg back, keeping the hip squared to the front.",
                    "Lower your hips toward the floor, using props if needed.",
                    "Keep your torso upright or fold forward over your front leg.",
                    "Hold for 5-10 breaths, then switch sides."
                ],
                benefits: [
                    "Deeply stretches hip flexors and rotators",
                    "Improves flexibility in the hips",
                    "Relieves lower back tension",
                    "Stimulates abdominal organs",
                    "Calms the nervous system"
                ],
                precautions: "Avoid if you have knee or hip injuries. Use props like blankets or blocks for support if needed."
            },
            {
                id: 8,
                name: "Bridge Pose",
                sanskrit: "Setu Bandhasana",
                difficulty: "beginner",
                category: "backbend",
                focus: ["strength", "flexibility"],
                image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "A gentle backbend that strengthens the back, glutes, and hamstrings.",
                instructions: [
                    "Lie on your back with knees bent and feet flat on the floor, hip-width apart.",
                    "Place your arms alongside your body with palms facing down.",
                    "Press your feet and arms firmly into the floor.",
                    "Inhale and lift your hips toward the ceiling.",
                    "Keep your thighs parallel and engage your glutes.",
                    "Hold for 5-10 breaths, then slowly lower down vertebra by vertebra."
                ],
                benefits: [
                    "Strengthens back, glutes, and hamstrings",
                    "Stretches chest, neck, and spine",
                    "Improves digestion",
                    "Calms the brain and reduces anxiety",
                    "Therapeutic for asthma and high blood pressure"
                ],
                precautions: "Avoid if you have neck injuries. Those with knee injuries should keep knees aligned over ankles."
            }
        ];

        // DOM elements
        const posesContainer = document.getElementById('posesContainer');
        const poseDetailContent = document.getElementById('poseDetailContent');
        const searchInput = document.getElementById('searchInput');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const focusFilter = document.getElementById('focusFilter');
        const resetFiltersBtn = document.getElementById('resetFilters');

        // Filter state
        let filters = {
            difficulty: 'all',
            category: 'all',
            focus: 'all',
            search: ''
        };

        // Initialize the app
        function init() {
            renderPoseCards(yogaPoses);
            setupFilterButtons();
            setupSearch();
            setupResetButton();
            
            // Select the first pose by default
            if (yogaPoses.length > 0) {
                selectPose(yogaPoses[0]);
            }
        }

        // Render pose cards
        function renderPoseCards(poses) {
            posesContainer.innerHTML = '';
            
            if (poses.length === 0) {
                posesContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-search"></i>
                        <h3>No Poses Found</h3>
                        <p>Try adjusting your filters or search terms to find yoga poses.</p>
                    </div>
                `;
                return;
            }
            
            poses.forEach(pose => {
                const poseCard = document.createElement('div');
                poseCard.className = 'pose-card';
                poseCard.dataset.id = pose.id;
                
                // Determine difficulty class
                let difficultyClass = '';
                switch(pose.difficulty) {
                    case 'beginner': difficultyClass = 'difficulty-beginner'; break;
                    case 'intermediate': difficultyClass = 'difficulty-intermediate'; break;
                    case 'advanced': difficultyClass = 'difficulty-advanced'; break;
                }
                
                poseCard.innerHTML = `
                    <div class="pose-image">
                        <img src="${pose.image}" alt="${pose.name}">
                    </div>
                    <div class="pose-info">
                        <h3 class="pose-name">${pose.name}</h3>
                        <p class="pose-sanskrit">${pose.sanskrit}</p>
                        <div class="pose-tags">
                            <span class="pose-tag">${pose.category}</span>
                            ${pose.focus.map(f => `<span class="pose-tag">${f}</span>`).join('')}
                        </div>
                        <div class="pose-difficulty ${difficultyClass}">${pose.difficulty.charAt(0).toUpperCase() + pose.difficulty.slice(1)}</div>
                        <p>${pose.description}</p>
                    </div>
                `;
                
                poseCard.addEventListener('click', () => selectPose(pose));
                posesContainer.appendChild(poseCard);
            });
        }

        // Setup filter buttons
        function setupFilterButtons() {
            // Difficulty filter
            difficultyFilter.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    difficultyFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filters.difficulty = btn.dataset.difficulty;
                    filterPoses();
                });
            });
            
            // Category filter
            categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filters.category = btn.dataset.category;
                    filterPoses();
                });
            });
            
            // Focus filter
            focusFilter.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    focusFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filters.focus = btn.dataset.focus;
                    filterPoses();
                });
            });
        }

        // Setup search functionality
        function setupSearch() {
            searchInput.addEventListener('input', (e) => {
                filters.search = e.target.value.toLowerCase();
                filterPoses();
            });
        }

        // Setup reset button
        function setupResetButton() {
            resetFiltersBtn.addEventListener('click', () => {
                // Reset filter buttons
                difficultyFilter.querySelector('.filter-btn[data-difficulty="all"]').classList.add('active');
                difficultyFilter.querySelectorAll('.filter-btn:not([data-difficulty="all"])').forEach(b => b.classList.remove('active'));
                
                categoryFilter.querySelector('.filter-btn[data-category="all"]').classList.add('active');
                categoryFilter.querySelectorAll('.filter-btn:not([data-category="all"])').forEach(b => b.classList.remove('active'));
                
                focusFilter.querySelector('.filter-btn[data-focus="all"]').classList.add('active');
                focusFilter.querySelectorAll('.filter-btn:not([data-focus="all"])').forEach(b => b.classList.remove('active'));
                
                // Reset search
                searchInput.value = '';
                
                // Reset filter state
                filters = {
                    difficulty: 'all',
                    category: 'all',
                    focus: 'all',
                    search: ''
                };
                
                // Render all poses
                renderPoseCards(yogaPoses);
                
                // Select the first pose
                if (yogaPoses.length > 0) {
                    selectPose(yogaPoses[0]);
                }
            });
        }

        // Filter poses based on current filters
        function filterPoses() {
            let filteredPoses = yogaPoses.filter(pose => {
                // Difficulty filter
                if (filters.difficulty !== 'all' && pose.difficulty !== filters.difficulty) {
                    return false;
                }
                
                // Category filter
                if (filters.category !== 'all' && pose.category !== filters.category) {
                    return false;
                }
                
                // Focus filter
                if (filters.focus !== 'all' && !pose.focus.includes(filters.focus)) {
                    return false;
                }
                
                // Search filter
                if (filters.search !== '') {
                    const searchTerm = filters.search;
                    const nameMatch = pose.name.toLowerCase().includes(searchTerm);
                    const sanskritMatch = pose.sanskrit.toLowerCase().includes(searchTerm);
                    const descMatch = pose.description.toLowerCase().includes(searchTerm);
                    
                    if (!nameMatch && !sanskritMatch && !descMatch) {
                        return false;
                    }
                }
                
                return true;
            });
            
            renderPoseCards(filteredPoses);
            
            // Select the first pose in filtered results if available
            if (filteredPoses.length > 0) {
                selectPose(filteredPoses[0]);
            } else {
                poseDetailContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No Poses Found</h3>
                        <p>Try adjusting your filters or search terms to find yoga poses.</p>
                    </div>
                `;
            }
        }

        // Select and display pose details
        function selectPose(pose) {
            // Remove active class from all pose cards
            document.querySelectorAll('.pose-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to selected pose card
            const selectedCard = document.querySelector(`.pose-card[data-id="${pose.id}"]`);
            if (selectedCard) {
                selectedCard.classList.add('active');
            }
            
            // Determine difficulty class
            let difficultyClass = '';
            switch(pose.difficulty) {
                case 'beginner': difficultyClass = 'difficulty-beginner'; break;
                case 'intermediate': difficultyClass = 'difficulty-intermediate'; break;
                case 'advanced': difficultyClass = 'difficulty-advanced'; break;
            }
            
            // Create pose detail HTML
            const poseDetailHTML = `
                <div class="pose-detail-content">
                    <div class="pose-detail-image">
                        <img src="${pose.image}" alt="${pose.name}">
                    </div>
                    
                    <h3 class="pose-name">${pose.name}</h3>
                    <p class="pose-sanskrit">${pose.sanskrit}</p>
                    
                    <div class="detail-section">
                        <div class="detail-title">
                            <i class="fas fa-layer-group"></i>
                            <span>Difficulty & Category</span>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <div class="pose-difficulty ${difficultyClass}">${pose.difficulty.charAt(0).toUpperCase() + pose.difficulty.slice(1)}</div>
                            <div class="pose-tag">${pose.category}</div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">
                            <i class="fas fa-align-left"></i>
                            <span>Description</span>
                        </div>
                        <p>${pose.description}</p>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">
                            <i class="fas fa-list-ol"></i>
                            <span>Instructions</span>
                        </div>
                        <ol class="instructions-list">
                            ${pose.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">
                            <i class="fas fa-heart"></i>
                            <span>Benefits</span>
                        </div>
                        <div class="benefits-list">
                            ${pose.benefits.map(benefit => `<div class="benefit-tag">${benefit}</div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Precautions</span>
                        </div>
                        <div class="precautions">
                            <p>${pose.precautions}</p>
                        </div>
                    </div>
                </div>
            `;
            
            poseDetailContent.innerHTML = poseDetailHTML;
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', init);
    