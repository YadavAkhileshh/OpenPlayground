// Meme Generator JavaScript
class MemeGenerator {
    constructor() {
        this.canvas = document.getElementById('memeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentImage = null;
        this.currentFilter = 'none';
        this.textElements = [];
        this.isDragging = false;
        this.dragElement = null;
        this.dragOffset = { x: 0, y: 0 };

        this.templates = {
            drake: 'https://i.imgflip.com/30b1gx.jpg',
            distracted: 'https://i.imgflip.com/1ur9b0.jpg',
            buttons: 'https://i.imgflip.com/1g8my4.jpg',
            brain: 'https://i.imgflip.com/1jwhww.jpg'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.createDefaultTextElements();
        this.drawCanvas();
    }

    setupEventListeners() {
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        imageInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Text controls
        document.getElementById('topText').addEventListener('input', this.updateText.bind(this));
        document.getElementById('bottomText').addEventListener('input', this.updateText.bind(this));
        document.getElementById('fontFamily').addEventListener('change', this.updateTextStyle.bind(this));
        document.getElementById('textColor').addEventListener('change', this.updateTextStyle.bind(this));
        document.getElementById('fontSize').addEventListener('input', this.updateTextStyle.bind(this));

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.loadTemplate(e.currentTarget.dataset.template);
            });
        });

        // Text element interactions
        document.getElementById('topTextElement').addEventListener('input', this.handleTextEdit.bind(this));
        document.getElementById('bottomTextElement').addEventListener('input', this.handleTextEdit.bind(this));

        // Drag functionality
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', this.downloadMeme.bind(this));
        document.getElementById('resetBtn').addEventListener('click', this.resetMeme.bind(this));
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    createDefaultTextElements() {
        this.textElements = [
            {
                id: 'topTextElement',
                text: 'TOP TEXT',
                x: this.canvas.width / 2,
                y: 50,
                fontSize: 40,
                fontFamily: 'Impact',
                color: '#ffffff'
            },
            {
                id: 'bottomTextElement',
                text: 'BOTTOM TEXT',
                x: this.canvas.width / 2,
                y: this.canvas.height - 50,
                fontSize: 40,
                fontFamily: 'Impact',
                color: '#ffffff'
            }
        ];
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.setImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    loadTemplate(templateName) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.setImage(img);
        };
        img.src = this.templates[templateName];
    }

    setImage(img) {
        this.currentImage = img;
        this.resizeCanvasToImage();
        this.drawCanvas();
        this.showNotification('Image loaded successfully!', 'success');
    }

    resizeCanvasToImage() {
        const maxWidth = 500;
        const maxHeight = 500;

        let { width, height } = this.currentImage;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        this.canvas.width = width;
        this.canvas.height = height;

        // Update text element positions
        this.textElements[0].x = width / 2;
        this.textElements[1].x = width / 2;
        this.textElements[1].y = height - 50;
    }

    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentImage) {
            // Apply filter
            this.applyFilter();

            // Draw image
            this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);

            // Reset filter
            this.ctx.filter = 'none';

            // Draw text
            this.drawText();
        } else {
            // Draw placeholder
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#666';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Upload an image or choose a template', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    applyFilter() {
        switch (this.currentFilter) {
            case 'grayscale':
                this.ctx.filter = 'grayscale(100%)';
                break;
            case 'sepia':
                this.ctx.filter = 'sepia(100%)';
                break;
            case 'blur':
                this.ctx.filter = 'blur(2px)';
                break;
            case 'brightness':
                this.ctx.filter = 'brightness(1.2)';
                break;
            case 'contrast':
                this.ctx.filter = 'contrast(1.2)';
                break;
            default:
                this.ctx.filter = 'none';
        }
    }

    drawText() {
        this.textElements.forEach(element => {
            this.ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            this.ctx.fillStyle = element.color;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Draw text stroke
            this.ctx.strokeText(element.text, element.x, element.y);
            // Draw text fill
            this.ctx.fillText(element.text, element.x, element.y);
        });
    }

    updateText(e) {
        const inputId = e.target.id;
        const textElement = inputId === 'topText' ? this.textElements[0] : this.textElements[1];
        textElement.text = e.target.value.toUpperCase();
        this.updateTextElement(inputId, textElement.text);
        this.drawCanvas();
    }

    updateTextElement(elementId, text) {
        const element = document.getElementById(elementId);
        element.textContent = text;
    }

    updateTextStyle() {
        const fontFamily = document.getElementById('fontFamily').value;
        const textColor = document.getElementById('textColor').value;
        const fontSize = document.getElementById('fontSize').value;

        this.textElements.forEach(element => {
            element.fontFamily = fontFamily;
            element.color = textColor;
            element.fontSize = parseInt(fontSize);
        });

        this.drawCanvas();
    }

    handleTextEdit(e) {
        const elementId = e.target.id;
        const textElement = this.textElements.find(el => el.id === elementId);
        if (textElement) {
            textElement.text = e.target.textContent.toUpperCase();
            this.drawCanvas();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.drawCanvas();
    }

    handleMouseDown(e) {
        const textElements = document.querySelectorAll('.text-element');
        textElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                this.isDragging = true;
                this.dragElement = element;
                const canvasRect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / canvasRect.width;
                const scaleY = this.canvas.height / canvasRect.height;

                this.dragOffset.x = (e.clientX - canvasRect.left) * scaleX - this.getTextElementById(element.id).x;
                this.dragOffset.y = (e.clientY - canvasRect.top) * scaleY - this.getTextElementById(element.id).y;
                element.style.cursor = 'grabbing';
            }
        });
    }

    handleMouseMove(e) {
        if (this.isDragging && this.dragElement) {
            const canvasRect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / canvasRect.width;
            const scaleY = this.canvas.height / canvasRect.height;

            const textElement = this.getTextElementById(this.dragElement.id);
            textElement.x = (e.clientX - canvasRect.left) * scaleX - this.dragOffset.x;
            textElement.y = (e.clientY - canvasRect.top) * scaleY - this.dragOffset.y;

            // Update DOM element position
            const percentX = (textElement.x / this.canvas.width) * 100;
            const percentY = (textElement.y / this.canvas.height) * 100;
            this.dragElement.style.left = `${percentX}%`;
            this.dragElement.style.top = `${percentY}%`;
            this.dragElement.style.transform = 'translate(-50%, -50%)';

            this.drawCanvas();
        }
    }

    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            if (this.dragElement) {
                this.dragElement.style.cursor = 'move';
                this.dragElement = null;
            }
        }
    }

    getTextElementById(id) {
        return this.textElements.find(el => el.id === id);
    }

    downloadMeme() {
        if (!this.currentImage) {
            this.showNotification('Please upload an image first!', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = this.canvas.toDataURL();
        link.click();

        this.showNotification('Meme downloaded successfully!', 'success');
    }

    resetMeme() {
        this.currentImage = null;
        this.currentFilter = 'none';
        this.createDefaultTextElements();

        // Reset form inputs
        document.getElementById('topText').value = '';
        document.getElementById('bottomText').value = '';
        document.getElementById('fontFamily').selectedIndex = 0;
        document.getElementById('textColor').value = '#ffffff';
        document.getElementById('fontSize').value = '40';

        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="none"]').classList.add('active');

        // Reset text elements
        document.getElementById('topTextElement').textContent = 'TOP TEXT';
        document.getElementById('bottomTextElement').textContent = 'BOTTOM TEXT';
        document.getElementById('topTextElement').style.left = '50%';
        document.getElementById('topTextElement').style.top = '10%';
        document.getElementById('bottomTextElement').style.left = '50%';
        document.getElementById('bottomTextElement').style.bottom = '10%';

        this.drawCanvas();
        this.showNotification('Meme reset successfully!', 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Sharing functions
function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this meme I created!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnReddit() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out this meme I created!');
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Link copied to clipboard!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new MemeGenerator();
});
