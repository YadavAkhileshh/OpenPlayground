class ImageSlider {
    constructor() {
        this.images = document.querySelectorAll(".slider-images");
        this.dots = document.querySelectorAll(".dots");
        this.prevBtn = document.getElementById("prev");
        this.nextBtn = document.getElementById("next");
        this.imagesWrapper = document.querySelector('.images-wrapper');
        this.loadingIndicator = document.getElementById('loading');
        
        this.idx = Number(localStorage.getItem("sliderIndex")) || 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.initLazyLoading();
        
        this.loadImage(this.idx, true);
        
        this.setupEventListeners();
        
        this.setupKeyboardNavigation();
        
        this.setupTouchSupport();
    }

    initLazyLoading() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src && !img.src) {
                        this.loadImageWithCompression(img);
                    }
                    observer.unobserve(img);
                }
            });
        }, options);

        this.images.forEach(img => {
            observer.observe(img);
        });
    }

    loadImageWithCompression(img) {
        img.classList.add('loading');
        
        const src = img.dataset.src;
        const tempImg = new Image();
        
        setTimeout(() => {
            tempImg.onload = () => {
                img.src = src;
                img.classList.remove('loading');
                img.classList.add('loaded');
                const highQualityImg = new Image();
                highQualityImg.src = src;
                highQualityImg.onload = () => {
                };
            };
            tempImg.src = src;
        }, 300);
    }

    showImage(newIdx) {
        if (this.isLoading) return;
        
        this.images[this.idx].style.display = "none";
        this.dots[this.idx].classList.remove("active");

        this.idx = newIdx;

        this.loadImage(this.idx);
        
        this.images[this.idx].style.display = "block";
        this.dots[this.idx].classList.add("active");

        localStorage.setItem("sliderIndex", this.idx);
    }

    loadImage(index, isInitial = false) {
        const img = this.images[index];
        
        if (img.dataset.src && !img.src) {
            if (!isInitial) {
                this.showLoadingIndicator();
            }
            this.loadImageWithCompression(img);
            
            img.onload = () => {
                this.hideLoadingIndicator();
            };
        } else if (img.classList.contains('loading')) {
            this.showLoadingIndicator();
            
            img.onload = () => {
                this.hideLoadingIndicator();
            };
        }
    }

    showLoadingIndicator() {
        this.isLoading = true;
        this.loadingIndicator.style.display = 'block';
    }

    hideLoadingIndicator() {
        this.isLoading = false;
        this.loadingIndicator.style.display = 'none';
    }

    next() {
        this.showImage((this.idx + 1) % this.images.length);
    }

    prev() {
        this.showImage((this.idx - 1 + this.images.length) % this.images.length);
    }

    setupEventListeners() {
        this.prevBtn.onclick = () => this.prev();
        this.nextBtn.onclick = () => this.next();

        this.dots.forEach((dot, i) => {
            dot.addEventListener("click", () => this.showImage(i));
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.showImage(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.showImage(this.images.length - 1);
                    break;
            }
        });
    }

    setupTouchSupport() {
        this.imagesWrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.imagesWrapper.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        let mouseDownX = 0;
        let mouseUpX = 0;
        
        this.imagesWrapper.addEventListener('mousedown', (e) => {
            mouseDownX = e.clientX;
        });

        this.imagesWrapper.addEventListener('mouseup', (e) => {
            mouseUpX = e.clientX;
            const diff = mouseUpX - mouseDownX;
            
            if (Math.abs(diff) > 50) { 
                if (diff > 0) {
                    this.prev();
                    this.showSwipeFeedback('left');
                } else {
                    this.next();
                    this.showSwipeFeedback('right');
                }
            }
        });
    }

    handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance in pixels
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
                this.showSwipeFeedback('right');
            } else {
                this.prev();
                this.showSwipeFeedback('left');
            }
        }
    }

    showSwipeFeedback(direction) {
        const existingFeedback = document.querySelector('.swipe-feedback');
        if (existingFeedback) existingFeedback.remove();
        
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback ${direction}`;
        feedback.innerHTML = direction === 'left' ? '←' : '→';
        
        this.imagesWrapper.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
});