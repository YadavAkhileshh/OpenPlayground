        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const templateGrid = document.getElementById('templateGrid');
            const colorGrid = document.getElementById('colorGrid');
            const gradientGrid = document.getElementById('gradientGrid');
            const imageUpload = document.getElementById('imageUpload');
            const backgroundImage = document.getElementById('backgroundImage');
            const canvas = document.getElementById('thumbnailCanvas');
            const ctx = canvas.getContext('2d');
            const titleText = document.getElementById('titleText');
            const subtitleText = document.getElementById('subtitleText');
            const titleSize = document.getElementById('titleSize');
            const titleSizeValue = document.getElementById('titleSizeValue');
            const subtitleSize = document.getElementById('subtitleSize');
            const subtitleSizeValue = document.getElementById('subtitleSizeValue');
            const fontSelect = document.getElementById('fontSelect');
            const exportBtn = document.getElementById('exportBtn');
            const resetBtn = document.getElementById('resetBtn');
            const saveTemplateBtn = document.getElementById('saveTemplateBtn');
            const sizeButtons = document.querySelectorAll('.size-btn');
            const qualityOptions = document.querySelectorAll('.quality-option');
            const optionTabs = document.querySelectorAll('.option-tab');
            const elementsGrid = document.getElementById('elementsGrid');
            const loadingOverlay = document.getElementById('loadingOverlay');
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            const elementControls = document.getElementById('elementControls');
            
            // State
            let currentTemplate = 'modern';
            let currentBackground = { type: 'color', value: '#1a1a2e' };
            let backgroundImageData = null;
            let elements = [];
            let selectedElement = null;
            let isDragging = false;
            let isResizing = false;
            let dragOffsetX = 0;
            let dragOffsetY = 0;
            let canvasScale = 1;
            let exportQuality = 1;
            let textStyles = {
                bold: false,
                italic: false,
                shadow: true,
                uppercase: false
            };
            
            // Templates
            const templates = [
                { id: 'modern', name: 'Modern', icon: 'fas fa-bolt', colors: ['#1a1a2e', '#06d6a0'] },
                { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad', colors: ['#0f0c29', '#ff006e'] },
                { id: 'tech', name: 'Tech', icon: 'fas fa-microchip', colors: ['#000428', '#004e92'] },
                { id: 'vlog', name: 'Vlog', icon: 'fas fa-video', colors: ['#3a1c71', '#ff9563'] },
                { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap', colors: ['#00416A', '#E4E5E6'] },
                { id: 'minimal', name: 'Minimal', icon: 'fas fa-minus', colors: ['#ffffff', '#000000'] }
            ];
            
            // Color Options
            const colorOptions = [
                '#1a1a2e', '#16213e', '#0f3460', '#533483', '#E94560',
                '#06d6a0', '#118ab2', '#ffd166', '#ef476f', '#ff9a00',
                '#000000', '#ffffff', '#2d3047', '#ff6b6b', '#4ecdc4'
            ];
            
            // Gradient Options
            const gradientOptions = [
                ['#1a1a2e', '#16213e', '#0f3460'],
                ['#ff6b6b', '#ffd166', '#06d6a0'],
                ['#3a1c71', '#d76d77', '#ff9563'],
                ['#000428', '#004e92', '#000428'],
                ['#0f0c29', '#302b63', '#24243e'],
                ['#23074d', '#cc5333', '#23074d']
            ];
            
            // Elements
            const elementTypes = [
                { id: 'play', name: 'Play Button', icon: 'fas fa-play', defaultColor: '#ff0000' },
                { id: 'arrow', name: 'Arrow', icon: 'fas fa-arrow-right', defaultColor: '#06d6a0' },
                { id: 'star', name: 'Star', icon: 'fas fa-star', defaultColor: '#ffd166' },
                { id: 'circle', name: 'Circle', icon: 'fas fa-circle', defaultColor: '#118ab2' },
                { id: 'rectangle', name: 'Rectangle', icon: 'fas fa-square', defaultColor: '#ef476f' },
                { id: 'badge', name: 'Badge', icon: 'fas fa-certificate', defaultColor: '#ff6b6b' }
            ];
            
            // Initialize
            function init() {
                // Create templates
                createTemplates();
                
                // Create color options
                createColorOptions();
                
                // Create gradient options
                createGradientOptions();
                
                // Create elements
                createElements();
                
                // Set up event listeners
                setupEventListeners();
                
                // Draw initial thumbnail
                drawThumbnail();
                
                // Apply default template
                applyTemplate('modern');
            }
            
            // Create templates
            function createTemplates() {
                templateGrid.innerHTML = '';
                
                templates.forEach(template => {
                    const templateItem = document.createElement('div');
                    templateItem.className = `template-item ${template.id === currentTemplate ? 'active' : ''}`;
                    templateItem.dataset.template = template.id;
                    
                    // Create gradient preview
                    const gradientPreview = document.createElement('div');
                    gradientPreview.className = 'template-preview';
                    gradientPreview.style.background = `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`;
                    gradientPreview.innerHTML = `<i class="${template.icon}"></i>`;
                    
                    const templateName = document.createElement('div');
                    templateName.className = 'template-name';
                    templateName.textContent = template.name;
                    
                    templateItem.appendChild(gradientPreview);
                    templateItem.appendChild(templateName);
                    
                    templateItem.addEventListener('click', function() {
                        applyTemplate(this.dataset.template);
                        
                        // Update active template
                        document.querySelectorAll('.template-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        this.classList.add('active');
                    });
                    
                    templateGrid.appendChild(templateItem);
                });
            }
            
            // Create color options
            function createColorOptions() {
                colorGrid.innerHTML = '';
                
                colorOptions.forEach(color => {
                    const colorOption = document.createElement('div');
                    colorOption.className = `color-option ${color === currentBackground.value ? 'active' : ''}`;
                    colorOption.style.backgroundColor = color;
                    colorOption.dataset.color = color;
                    
                    colorOption.addEventListener('click', function() {
                        currentBackground = { type: 'color', value: this.dataset.color };
                        
                        // Update active color
                        document.querySelectorAll('.color-option').forEach(opt => {
                            opt.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        drawThumbnail();
                    });
                    
                    colorGrid.appendChild(colorOption);
                });
            }
            
            // Create gradient options
            function createGradientOptions() {
                gradientGrid.innerHTML = '';
                
                gradientOptions.forEach((gradient, index) => {
                    const gradientOption = document.createElement('div');
                    gradientOption.className = 'color-option';
                    gradientOption.style.background = `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;
                    gradientOption.dataset.gradient = JSON.stringify(gradient);
                    
                    gradientOption.addEventListener('click', function() {
                        currentBackground = { 
                            type: 'gradient', 
                            value: JSON.parse(this.dataset.gradient) 
                        };
                        
                        drawThumbnail();
                    });
                    
                    gradientGrid.appendChild(gradientOption);
                });
            }
            
            // Create elements
            function createElements() {
                elementsGrid.innerHTML = '';
                
                elementTypes.forEach(element => {
                    const elementBtn = document.createElement('button');
                    elementBtn.className = 'element-btn';
                    elementBtn.dataset.element = element.id;
                    
                    elementBtn.innerHTML = `
                        <i class="${element.icon}"></i>
                        <span>${element.name}</span>
                    `;
                    
                    elementBtn.addEventListener('click', function() {
                        addElement(element.id);
                    });
                    
                    elementsGrid.appendChild(elementBtn);
                });
            }
            
            // Set up event listeners
            function setupEventListeners() {
                // Text input changes
                titleText.addEventListener('input', drawThumbnail);
                subtitleText.addEventListener('input', drawThumbnail);
                
                // Size sliders
                titleSize.addEventListener('input', function() {
                    titleSizeValue.textContent = `${this.value}px`;
                    drawThumbnail();
                });
                
                subtitleSize.addEventListener('input', function() {
                    subtitleSizeValue.textContent = `${this.value}px`;
                    drawThumbnail();
                });
                
                // Font selection
                fontSelect.addEventListener('change', drawThumbnail);
                
                // Style buttons
                document.getElementById('boldBtn').addEventListener('click', function() {
                    textStyles.bold = !textStyles.bold;
                    this.classList.toggle('active');
                    drawThumbnail();
                });
                
                document.getElementById('italicBtn').addEventListener('click', function() {
                    textStyles.italic = !textStyles.italic;
                    this.classList.toggle('active');
                    drawThumbnail();
                });
                
                document.getElementById('shadowBtn').addEventListener('click', function() {
                    textStyles.shadow = !textStyles.shadow;
                    this.classList.toggle('active');
                    drawThumbnail();
                });
                
                document.getElementById('uppercaseBtn').addEventListener('click', function() {
                    textStyles.uppercase = !textStyles.uppercase;
                    this.classList.toggle('active');
                    drawThumbnail();
                });
                
                // Option tabs
                optionTabs.forEach(tab => {
                    tab.addEventListener('click', function() {
                        const tabName = this.dataset.tab;
                        
                        // Update active tab
                        optionTabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Show corresponding content
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.style.display = 'none';
                        });
                        document.getElementById(`${tabName}Tab`).style.display = 'block';
                        
                        // If switching to image tab, trigger background change
                        if (tabName === 'image' && backgroundImageData) {
                            currentBackground = { type: 'image', value: backgroundImageData };
                            drawThumbnail();
                        }
                    });
                });
                
                // Image upload
                imageUpload.addEventListener('click', () => backgroundImage.click());
                backgroundImage.addEventListener('change', handleImageUpload);
                
                // Size buttons
                sizeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const size = this.dataset.size.split('x');
                        const width = parseInt(size[0]);
                        const height = parseInt(size[1]);
                        
                        // Update canvas size
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Update scale for elements
                        const oldWidth = canvas.width;
                        const oldHeight = canvas.height;
                        canvasScale = Math.min(width / 1280, height / 720);
                        
                        // Scale existing elements
                        elements.forEach(element => {
                            element.x = (element.x / oldWidth) * width;
                            element.y = (element.y / oldHeight) * height;
                            element.width *= canvasScale;
                            element.height *= canvasScale;
                        });
                        
                        // Update active size button
                        sizeButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        
                        drawThumbnail();
                    });
                });
                
                // Quality options
                qualityOptions.forEach(option => {
                    option.addEventListener('click', function() {
                        exportQuality = parseFloat(this.dataset.quality);
                        
                        // Update active quality option
                        qualityOptions.forEach(opt => opt.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                // Action buttons
                exportBtn.addEventListener('click', exportThumbnail);
                resetBtn.addEventListener('click', resetDesign);
                saveTemplateBtn.addEventListener('click', saveTemplate);
                
                // Canvas interaction
                canvas.addEventListener('mousedown', startCanvasInteraction);
                canvas.addEventListener('mousemove', handleCanvasInteraction);
                canvas.addEventListener('mouseup', stopCanvasInteraction);
                canvas.addEventListener('mouseleave', stopCanvasInteraction);
                
                // Touch events for mobile
                canvas.addEventListener('touchstart', startCanvasInteractionTouch);
                canvas.addEventListener('touchmove', handleCanvasInteractionTouch);
                canvas.addEventListener('touchend', stopCanvasInteraction);
            }
            
            // Apply template
            function applyTemplate(templateId) {
                currentTemplate = templateId;
                const template = templates.find(t => t.id === templateId);
                
                if (template) {
                    // Apply template colors
                    currentBackground = { type: 'gradient', value: template.colors };
                    
                    // Update text
                    if (templateId === 'gaming') {
                        titleText.value = "EPIC GAMEPLAY MOMENT!";
                        subtitleText.value = "NEW WORLD RECORD!";
                    } else if (templateId === 'tech') {
                        titleText.value = "BREAKTHROUGH TECH REVIEW";
                        subtitleText.value = "You Won't Believe This!";
                    } else if (templateId === 'vlog') {
                        titleText.value = "MY CRAZY ADVENTURE DAY";
                        subtitleText.value = "Watch till the end!";
                    } else if (templateId === 'education') {
                        titleText.value = "LEARN THIS SKILL FAST";
                        subtitleText.value = "Complete Beginner's Guide";
                    } else {
                        titleText.value = "AMAZING VIDEO TITLE";
                        subtitleText.value = "Watch this epic tutorial!";
                    }
                    
                    // Clear existing elements and add template-specific ones
                    elements = [];
                    
                    if (templateId === 'modern') {
                        addElement('play', canvas.width * 0.8, canvas.height * 0.5, 80, 80);
                        addElement('arrow', canvas.width * 0.2, canvas.height * 0.7, 60, 60);
                    } else if (templateId === 'gaming') {
                        addElement('star', canvas.width * 0.8, canvas.height * 0.3, 70, 70);
                        addElement('badge', canvas.width * 0.9, canvas.height * 0.8, 50, 50);
                    } else if (templateId === 'tech') {
                        addElement('circle', canvas.width * 0.7, canvas.height * 0.7, 100, 100);
                    }
                    
                    drawThumbnail();
                }
            }
            
            // Handle image upload
            function handleImageUpload(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                if (!file.type.match('image.*')) {
                    showToast('Please upload an image file', 'error');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size should be less than 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        backgroundImageData = img;
                        currentBackground = { type: 'image', value: backgroundImageData };
                        drawThumbnail();
                        showToast('Background image uploaded successfully!');
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
            
            // Add element to canvas
            function addElement(type, x = null, y = null, width = null, height = null) {
                const elementType = elementTypes.find(e => e.id === type);
                if (!elementType) return;
                
                const element = {
                    id: Date.now() + Math.random(),
                    type: type,
                    x: x || Math.random() * (canvas.width - 100) + 50,
                    y: y || Math.random() * (canvas.height - 100) + 50,
                    width: width || 60,
                    height: height || 60,
                    color: elementType.defaultColor,
                    rotation: 0
                };
                
                elements.push(element);
                drawThumbnail();
            }
            
            // Draw thumbnail
            function drawThumbnail() {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw background
                drawBackground();
                
                // Draw template-specific design
                drawTemplateDesign();
                
                // Draw elements
                elements.forEach(element => {
                    drawElement(element);
                });
                
                // Draw text
                drawText();
                
                // Draw selection highlight if element is selected
                if (selectedElement) {
                    drawSelectionHighlight(selectedElement);
                }
            }
            
            // Draw background
            function drawBackground() {
                if (currentBackground.type === 'color') {
                    ctx.fillStyle = currentBackground.value;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (currentBackground.type === 'gradient') {
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                    gradient.addColorStop(0, currentBackground.value[0]);
                    gradient.addColorStop(1, currentBackground.value[1]);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (currentBackground.type === 'image' && currentBackground.value) {
                    // Draw image background (cover)
                    const img = currentBackground.value;
                    const imgRatio = img.width / img.height;
                    const canvasRatio = canvas.width / canvas.height;
                    
                    let drawWidth, drawHeight, offsetX, offsetY;
                    
                    if (imgRatio > canvasRatio) {
                        drawHeight = canvas.height;
                        drawWidth = drawHeight * imgRatio;
                        offsetX = (canvas.width - drawWidth) / 2;
                        offsetY = 0;
                    } else {
                        drawWidth = canvas.width;
                        drawHeight = drawWidth / imgRatio;
                        offsetX = 0;
                        offsetY = (canvas.height - drawHeight) / 2;
                    }
                    
                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    
                    // Add overlay for better text readability
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
            
            // Draw template-specific design
            function drawTemplateDesign() {
                if (currentTemplate === 'modern') {
                    // Modern template: diagonal lines
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.lineWidth = 2;
                    
                    for (let i = -canvas.height; i < canvas.width; i += 30) {
                        ctx.beginPath();
                        ctx.moveTo(i, 0);
                        ctx.lineTo(i + canvas.height, canvas.height);
                        ctx.stroke();
                    }
                } else if (currentTemplate === 'gaming') {
                    // Gaming template: grid pattern
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.lineWidth = 1;
                    
                    // Vertical lines
                    for (let x = 0; x < canvas.width; x += 50) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, canvas.height);
                        ctx.stroke();
                    }
                    
                    // Horizontal lines
                    for (let y = 0; y < canvas.height; y += 50) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }
                } else if (currentTemplate === 'tech') {
                    // Tech template: circuit pattern
                    ctx.strokeStyle = 'rgba(6, 214, 160, 0.2)';
                    ctx.lineWidth = 1;
                    
                    for (let i = 0; i < 10; i++) {
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * canvas.height;
                        const radius = 20 + Math.random() * 50;
                        
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            
            // Draw element
            function drawElement(element) {
                ctx.save();
                ctx.translate(element.x, element.y);
                ctx.rotate(element.rotation);
                
                ctx.fillStyle = element.color;
                
                switch (element.type) {
                    case 'play':
                        // Play button triangle
                        ctx.beginPath();
                        ctx.moveTo(-element.width/2, -element.height/2);
                        ctx.lineTo(element.width/2, 0);
                        ctx.lineTo(-element.width/2, element.height/2);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Outer circle
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.arc(0, 0, element.width/2 + 5, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                        
                    case 'arrow':
                        // Arrow shape
                        ctx.beginPath();
                        ctx.moveTo(-element.width/2, 0);
                        ctx.lineTo(element.width/2, 0);
                        ctx.lineTo(element.width/4, -element.height/2);
                        ctx.moveTo(element.width/2, 0);
                        ctx.lineTo(element.width/4, element.height/2);
                        ctx.lineWidth = 8;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.strokeStyle = element.color;
                        ctx.stroke();
                        break;
                        
                    case 'star':
                        // Star shape
                        ctx.beginPath();
                        const spikes = 5;
                        const outerRadius = element.width/2;
                        const innerRadius = outerRadius * 0.4;
                        
                        for (let i = 0; i < spikes * 2; i++) {
                            const radius = i % 2 === 0 ? outerRadius : innerRadius;
                            const angle = (Math.PI * i) / spikes;
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);
                            
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        break;
                        
                    case 'circle':
                        // Circle
                        ctx.beginPath();
                        ctx.arc(0, 0, element.width/2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Inner circle
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(0, 0, element.width/4, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'rectangle':
                        // Rounded rectangle
                        const radius = 10;
                        ctx.beginPath();
                        ctx.roundRect(-element.width/2, -element.height/2, element.width, element.height, radius);
                        ctx.fill();
                        break;
                        
                    case 'badge':
                        // Badge shape
                        ctx.beginPath();
                        ctx.arc(0, 0, element.width/2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Badge text
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 20px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('NEW', 0, 0);
                        break;
                }
                
                ctx.restore();
            }
            
            // Draw text
            function drawText() {
                let title = titleText.value;
                let subtitle = subtitleText.value;
                
                // Apply uppercase if enabled
                if (textStyles.uppercase) {
                    title = title.toUpperCase();
                    subtitle = subtitle.toUpperCase();
                }
                
                // Set font styles
                let titleFont = `${textStyles.bold ? 'bold ' : ''}${textStyles.italic ? 'italic ' : ''}${titleSize.value}px ${fontSelect.value}`;
                let subtitleFont = `${subtitleSize.value}px ${fontSelect.value}`;
                
                // Draw title
                ctx.font = titleFont;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Title with shadow
                if (textStyles.shadow) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                }
                
                ctx.fillStyle = '#ffffff';
                ctx.fillText(title, canvas.width / 2, canvas.height * 0.3);
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // Draw subtitle
                ctx.font = subtitleFont;
                ctx.fillStyle = '#ffd166';
                ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.4);
                
                // Draw template-specific tagline
                if (currentTemplate === 'modern') {
                    ctx.font = '20px Montserrat';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.fillText('Click to watch now!', canvas.width / 2, canvas.height * 0.5);
                } else if (currentTemplate === 'gaming') {
                    ctx.font = 'bold 24px Impact';
                    ctx.fillStyle = '#ff006e';
                    ctx.fillText('GAMEPLAY FOOTAGE', canvas.width / 2, canvas.height * 0.8);
                }
            }
            
            // Draw selection highlight
            function drawSelectionHighlight(element) {
                ctx.save();
                ctx.translate(element.x, element.y);
                ctx.rotate(element.rotation);
                
                // Draw selection border
                ctx.strokeStyle = '#06d6a0';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                
                const padding = 10;
                ctx.strokeRect(
                    -element.width/2 - padding,
                    -element.height/2 - padding,
                    element.width + padding * 2,
                    element.height + padding * 2
                );
                
                // Draw resize handles
                ctx.fillStyle = '#06d6a0';
                ctx.setLineDash([]);
                
                // Top-left handle
                ctx.fillRect(-element.width/2 - 15, -element.height/2 - 15, 10, 10);
                // Top-right handle
                ctx.fillRect(element.width/2 + 5, -element.height/2 - 15, 10, 10);
                // Bottom-left handle
                ctx.fillRect(-element.width/2 - 15, element.height/2 + 5, 10, 10);
                // Bottom-right handle
                ctx.fillRect(element.width/2 + 5, element.height/2 + 5, 10, 10);
                
                // Rotate handle
                ctx.beginPath();
                ctx.arc(0, -element.height/2 - 30, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
            
            // Canvas interaction
            function startCanvasInteraction(e) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                
                // Check if clicking on an element
                for (let i = elements.length - 1; i >= 0; i--) {
                    const element = elements[i];
                    
                    // Transform point to element's coordinate space
                    const cos = Math.cos(element.rotation);
                    const sin = Math.sin(element.rotation);
                    const tx = x - element.x;
                    const ty = y - element.y;
                    
                    // Rotate point back to check hit
                    const rotatedX = tx * cos + ty * sin;
                    const rotatedY = -tx * sin + ty * cos;
                    
                    // Check if point is inside element bounds
                    if (Math.abs(rotatedX) < element.width/2 && Math.abs(rotatedY) < element.height/2) {
                        selectedElement = element;
                        
                        // Check if clicking on resize handle
                        const handleSize = 15;
                        if (rotatedX > element.width/2 - handleSize && rotatedY > element.height/2 - handleSize) {
                            isResizing = true;
                        } else {
                            isDragging = true;
                            dragOffsetX = x - element.x;
                            dragOffsetY = y - element.y;
                        }
                        
                        // Show element controls
                        showElementControls(x, y);
                        
                        drawThumbnail();
                        e.preventDefault();
                        return;
                    }
                }
                
                // If clicking on empty space, deselect
                selectedElement = null;
                elementControls.classList.remove('active');
                drawThumbnail();
            }
            
            function startCanvasInteractionTouch(e) {
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const rect = canvas.getBoundingClientRect();
                    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                    
                    // Similar logic as mouse version
                    for (let i = elements.length - 1; i >= 0; i--) {
                        const element = elements[i];
                        
                        const cos = Math.cos(element.rotation);
                        const sin = Math.sin(element.rotation);
                        const tx = x - element.x;
                        const ty = y - element.y;
                        
                        const rotatedX = tx * cos + ty * sin;
                        const rotatedY = -tx * sin + ty * cos;
                        
                        if (Math.abs(rotatedX) < element.width/2 && Math.abs(rotatedY) < element.height/2) {
                            selectedElement = element;
                            isDragging = true;
                            dragOffsetX = x - element.x;
                            dragOffsetY = y - element.y;
                            
                            showElementControls(x, y);
                            drawThumbnail();
                            e.preventDefault();
                            return;
                        }
                    }
                    
                    selectedElement = null;
                    elementControls.classList.remove('active');
                    drawThumbnail();
                }
            }
            
            function handleCanvasInteraction(e) {
                if (!selectedElement || (!isDragging && !isResizing)) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                
                if (isDragging) {
                    selectedElement.x = x - dragOffsetX;
                    selectedElement.y = y - dragOffsetY;
                    
                    // Update element controls position
                    showElementControls(selectedElement.x, selectedElement.y);
                } else if (isResizing) {
                    const deltaX = x - selectedElement.x;
                    const deltaY = y - selectedElement.y;
                    selectedElement.width = Math.max(20, Math.abs(deltaX) * 2);
                    selectedElement.height = Math.max(20, Math.abs(deltaY) * 2);
                }
                
                drawThumbnail();
            }
            
            function handleCanvasInteractionTouch(e) {
                if (!selectedElement || !isDragging || e.touches.length !== 1) return;
                
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                
                selectedElement.x = x - dragOffsetX;
                selectedElement.y = y - dragOffsetY;
                
                showElementControls(selectedElement.x, selectedElement.y);
                drawThumbnail();
            }
            
            function stopCanvasInteraction() {
                isDragging = false;
                isResizing = false;
            }
            
            // Show element controls
            function showElementControls(x, y) {
                elementControls.classList.add('active');
                
                // Position controls near the element
                const rect = canvas.getBoundingClientRect();
                const scaleX = rect.width / canvas.width;
                const scaleY = rect.height / canvas.height;
                
                elementControls.style.left = `${rect.left + x * scaleX + 20}px`;
                elementControls.style.top = `${rect.top + y * scaleY}px`;
                
                // Set up control button events
                document.getElementById('moveBtn').onclick = () => {
                    isDragging = true;
                    isResizing = false;
                };
                
                document.getElementById('resizeBtn').onclick = () => {
                    isResizing = true;
                    isDragging = false;
                };
                
                document.getElementById('deleteBtn').onclick = () => {
                    elements = elements.filter(el => el.id !== selectedElement.id);
                    selectedElement = null;
                    elementControls.classList.remove('active');
                    drawThumbnail();
                };
                
                document.getElementById('colorBtn').onclick = () => {
                    if (selectedElement) {
                        // Cycle through colors
                        const colors = ['#06d6a0', '#118ab2', '#ffd166', '#ef476f', '#ff6b6b', '#4ecdc4'];
                        const currentIndex = colors.indexOf(selectedElement.color);
                        const nextIndex = (currentIndex + 1) % colors.length;
                        selectedElement.color = colors[nextIndex];
                        drawThumbnail();
                    }
                };
            }
            
            // Export thumbnail
            function exportThumbnail() {
                loadingOverlay.style.display = 'flex';
                
                // Small delay to show loading
                setTimeout(() => {
                    // Create a temporary canvas for export
                    const exportCanvas = document.createElement('canvas');
                    const exportCtx = exportCanvas.getContext('2d');
                    
                    // Set export size (2x for high quality)
                    exportCanvas.width = canvas.width * 2;
                    exportCanvas.height = canvas.height * 2;
                    
                    // Scale and draw
                    exportCtx.scale(2, 2);
                    drawOnCanvas(exportCtx, exportCanvas.width/2, exportCanvas.height/2);
                    
                    // Create download link
                    const link = document.createElement('a');
                    
                    if (exportQuality >= 0.9) {
                        // PNG for high quality
                        link.download = `thumbnail-${Date.now()}.png`;
                        link.href = exportCanvas.toDataURL('image/png');
                    } else {
                        // JPG for lower quality
                        link.download = `thumbnail-${Date.now()}.jpg`;
                        link.href = exportCanvas.toDataURL('image/jpeg', exportQuality);
                    }
                    
                    link.click();
                    
                    loadingOverlay.style.display = 'none';
                    showToast('Thumbnail exported successfully!');
                }, 500);
            }
            
            // Draw on specific canvas context
            function drawOnCanvas(ctx, width, height) {
                // Save original canvas size
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;
                
                // Temporarily change canvas size
                canvas.width = width;
                canvas.height = height;
                
                // Draw everything
                drawBackground.call({ ctx });
                drawTemplateDesign.call({ ctx });
                elements.forEach(element => drawElement.call({ ctx }, element));
                drawText.call({ ctx });
                
                // Restore original size
                canvas.width = originalWidth;
                canvas.height = originalHeight;
            }
            
            // Reset design
            function resetDesign() {
                if (confirm('Are you sure you want to reset the design? All changes will be lost.')) {
                    // Reset to default template
                    applyTemplate('modern');
                    
                    // Reset text
                    titleText.value = "AMAZING VIDEO TITLE";
                    subtitleText.value = "Watch this epic tutorial!";
                    
                    // Reset styles
                    textStyles = { bold: false, italic: false, shadow: true, uppercase: false };
                    document.getElementById('boldBtn').classList.remove('active');
                    document.getElementById('italicBtn').classList.remove('active');
                    document.getElementById('shadowBtn').classList.add('active');
                    document.getElementById('uppercaseBtn').classList.remove('active');
                    
                    // Reset background
                    currentBackground = { type: 'color', value: '#1a1a2e' };
                    document.querySelectorAll('.color-option').forEach(opt => {
                        opt.classList.toggle('active', opt.dataset.color === '#1a1a2e');
                    });
                    
                    // Reset size
                    canvas.width = 1280;
                    canvas.height = 720;
                    sizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === '1280x720'));
                    
                    showToast('Design reset to default');
                }
            }
            
            // Save template
            function saveTemplate() {
                const templateData = {
                    background: currentBackground,
                    title: titleText.value,
                    subtitle: subtitleText.value,
                    elements: elements,
                    createdAt: new Date().toISOString()
                };
                
                const dataStr = JSON.stringify(templateData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `thumbnail-template-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showToast('Template saved successfully!');
            }
            
            // Show toast notification
            function showToast(message, type = 'success') {
                toastMessage.textContent = message;
                
                if (type === 'error') {
                    toast.style.background = '#ef476f';
                } else {
                    toast.style.background = '#06d6a0';
                }
                
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
            
            // Initialize the app
            init();
        });