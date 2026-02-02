        document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const fileInput = document.getElementById('fileInput');
            const uploadTrigger = document.getElementById('uploadTrigger');
            const randomBtn = document.getElementById('randomBtn');
            const clearBtn = document.getElementById('clearBtn');
            const polaroidWall = document.getElementById('polaroidWall');
            const emptyState = document.getElementById('emptyState');
            
            // Sample image URLs for random photos
            const sampleImages = [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
                'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
                'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
                'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
                'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5'
            ];
            
            // Sample captions for Polaroids
            const sampleCaptions = [
                "Beautiful sunset 🌅",
                "Mountain adventure 🏔️",
                "Beach day 🏖️",
                "City lights 🌃",
                "Forest path 🌲",
                "Coffee time ☕",
                "Road trip 🚗",
                "Good vibes ✨"
            ];
            
            // Polaroid counter
            let polaroidCount = 0;
            let zIndexCounter = 1;
            
            // Event listeners
            uploadTrigger.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        createPolaroid(event.target.result, `My Photo ${polaroidCount + 1}`);
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
            
            randomBtn.addEventListener('click', addRandomPolaroids);
            
            clearBtn.addEventListener('click', function() {
                const polaroids = document.querySelectorAll('.polaroid');
                polaroids.forEach(polaroid => polaroid.remove());
                emptyState.style.display = 'block';
                polaroidCount = 0;
            });
            
            // Function to create a new Polaroid
            function createPolaroid(imageSrc, caption) {
                // Hide empty state if it's visible
                if (emptyState.style.display !== 'none') {
                    emptyState.style.display = 'none';
                }
                
                // Create Polaroid element
                const polaroid = document.createElement('div');
                polaroid.className = 'polaroid';
                polaroid.id = `polaroid-${polaroidCount}`;
                
                // Set random position and rotation
                const wallRect = polaroidWall.getBoundingClientRect();
                const maxX = wallRect.width - 280;
                const maxY = wallRect.height - 320;
                
                const randomX = Math.floor(Math.random() * maxX);
                const randomY = Math.floor(Math.random() * maxY);
                const randomRotation = Math.floor(Math.random() * 30) - 15; // Between -15 and 15 degrees
                
                polaroid.style.left = `${randomX}px`;
                polaroid.style.top = `${randomY}px`;
                polaroid.style.setProperty('--rotation', `${randomRotation}deg`);
                polaroid.style.zIndex = zIndexCounter++;
                
                // Create image element
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = caption;
                img.draggable = false; // Prevent image drag interfering with polaroid drag
                
                // Create caption element
                const captionElement = document.createElement('div');
                captionElement.className = 'polaroid-caption';
                captionElement.textContent = caption;
                captionElement.contentEditable = true;
                captionElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
                
                // Create controls
                const controls = document.createElement('div');
                controls.className = 'polaroid-controls';
                
                // Rotate left button
                const rotateLeftBtn = document.createElement('button');
                rotateLeftBtn.innerHTML = '<i class="fas fa-undo"></i>';
                rotateLeftBtn.title = "Rotate left";
                rotateLeftBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    rotatePolaroid(polaroid, -15);
                });
                
                // Rotate right button
                const rotateRightBtn = document.createElement('button');
                rotateRightBtn.innerHTML = '<i class="fas fa-redo"></i>';
                rotateRightBtn.title = "Rotate right";
                rotateRightBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    rotatePolaroid(polaroid, 15);
                });
                
                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.title = "Delete";
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    polaroid.remove();
                    polaroidCount--;
                    
                    // Show empty state if no polaroids left
                    if (polaroidCount === 0) {
                        emptyState.style.display = 'block';
                    }
                });
                
                // Add buttons to controls
                controls.appendChild(rotateLeftBtn);
                controls.appendChild(rotateRightBtn);
                controls.appendChild(deleteBtn);
                
                // Assemble the polaroid
                polaroid.appendChild(img);
                polaroid.appendChild(captionElement);
                polaroid.appendChild(controls);
                
                // Add drag functionality
                makeDraggable(polaroid);
                
                // Add double-click to bring to front
                polaroid.addEventListener('dblclick', function() {
                    polaroid.style.zIndex = zIndexCounter++;
                });
                
                // Add to wall
                polaroidWall.appendChild(polaroid);
                polaroidCount++;
            }
            
            // Function to add random polaroids
            function addRandomPolaroids() {
                const count = 3; // Add 3 random polaroids
                
                for (let i = 0; i < count; i++) {
                    const randomImageIndex = Math.floor(Math.random() * sampleImages.length);
                    const randomCaptionIndex = Math.floor(Math.random() * sampleCaptions.length);
                    
                    // Use a smaller version of Unsplash images for better performance
                    const imageUrl = `${sampleImages[randomImageIndex]}?w=400&h=300&fit=crop`;
                    
                    createPolaroid(imageUrl, sampleCaptions[randomCaptionIndex]);
                }
            }
            
            // Function to rotate a polaroid
            function rotatePolaroid(polaroid, degrees) {
                const currentRotation = parseFloat(polaroid.style.getPropertyValue('--rotation') || 0);
                const newRotation = currentRotation + degrees;
                
                polaroid.style.setProperty('--rotation', `${newRotation}deg`);
            }
            
            // Function to make polaroids draggable
            function makeDraggable(element) {
                let isDragging = false;
                let offsetX, offsetY;
                
                element.addEventListener('mousedown', startDrag);
                element.addEventListener('touchstart', startDragTouch);
                
                function startDrag(e) {
                    e.preventDefault();
                    isDragging = true;
                    
                    // Bring to front when starting to drag
                    element.style.zIndex = zIndexCounter++;
                    
                    // Calculate offset
                    const rect = element.getBoundingClientRect();
                    offsetX = e.clientX - rect.left;
                    offsetY = e.clientY - rect.top;
                    
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', stopDrag);
                }
                
                function startDragTouch(e) {
                    if (e.touches.length !== 1) return;
                    
                    e.preventDefault();
                    isDragging = true;
                    
                    // Bring to front when starting to drag
                    element.style.zIndex = zIndexCounter++;
                    
                    // Calculate offset for touch
                    const rect = element.getBoundingClientRect();
                    offsetX = e.touches[0].clientX - rect.left;
                    offsetY = e.touches[0].clientY - rect.top;
                    
                    document.addEventListener('touchmove', dragTouch);
                    document.addEventListener('touchend', stopDrag);
                }
                
                function drag(e) {
                    if (!isDragging) return;
                    
                    // Calculate new position
                    const wallRect = polaroidWall.getBoundingClientRect();
                    const newX = e.clientX - wallRect.left - offsetX;
                    const newY = e.clientY - wallRect.top - offsetY;
                    
                    // Keep within wall boundaries
                    const maxX = wallRect.width - element.offsetWidth;
                    const maxY = wallRect.height - element.offsetHeight;
                    
                    const boundedX = Math.max(0, Math.min(newX, maxX));
                    const boundedY = Math.max(0, Math.min(newY, maxY));
                    
                    element.style.left = `${boundedX}px`;
                    element.style.top = `${boundedY}px`;
                }
                
                function dragTouch(e) {
                    if (!isDragging || e.touches.length !== 1) return;
                    
                    // Calculate new position for touch
                    const wallRect = polaroidWall.getBoundingClientRect();
                    const newX = e.touches[0].clientX - wallRect.left - offsetX;
                    const newY = e.touches[0].clientY - wallRect.top - offsetY;
                    
                    // Keep within wall boundaries
                    const maxX = wallRect.width - element.offsetWidth;
                    const maxY = wallRect.height - element.offsetHeight;
                    
                    const boundedX = Math.max(0, Math.min(newX, maxX));
                    const boundedY = Math.max(0, Math.min(newY, maxY));
                    
                    element.style.left = `${boundedX}px`;
                    element.style.top = `${boundedY}px`;
                }
                
                function stopDrag() {
                    isDragging = false;
                    document.removeEventListener('mousemove', drag);
                    document.removeEventListener('touchmove', dragTouch);
                    document.removeEventListener('mouseup', stopDrag);
                    document.removeEventListener('touchend', stopDrag);
                }
            }
            
            // Add a few random polaroids on load for demo purposes
            setTimeout(addRandomPolaroids, 500);
        });