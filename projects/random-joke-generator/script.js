class JokeGenerator {
  constructor() {
    this.jokes = [];
    this.currentJoke = null;
    this.currentRating = 0;
    this.userRatings = JSON.parse(localStorage.getItem('jokeRatings')) || {};
    this.favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];
    
    // DOM Elements
    this.jokeEl = document.getElementById('joke');
    this.categoryEl = document.getElementById('jokeCategory');
    this.jokeBtn = document.getElementById('jokeBtn');
    this.categoryFilter = document.getElementById('categoryFilter');
    this.stars = document.querySelectorAll('.stars i');
    this.averageRatingEl = document.getElementById('averageRating');
    this.favoriteBtn = document.getElementById('favoriteBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.favoritesList = document.getElementById('favoritesList');
    
    this.init();
  }
  
  async init() {
    await this.loadJokes();
    this.setupEventListeners();
    this.displayRandomJoke();
    this.loadFavorites();
  }
  
  async loadJokes() {
    try {
      const response = await fetch('jokes.json');
      const data = await response.json();
      this.jokes = data.jokes;
    } catch (error) {
      console.error('Error loading jokes:', error);
      // Fallback to default jokes
      this.jokes = [
        { text: "Why do programmers prefer dark mode? Because light attracts bugs.", category: "programming", rating: 4.2 },
        { text: "I told my computer I needed a break. It froze.", category: "programming", rating: 3.8 },
        { text: "Debugging: Being the detective in a crime movie where you are also the murderer.", category: "programming", rating: 4.5 },
        { text: "I'm reading a book on anti-gravity. It's impossible to put down!", category: "puns", rating: 3.9 },
        { text: "Why don't eggs tell jokes? They'd crack each other up.", category: "dad jokes", rating: 3.7 }
      ];
    }
  }
  
  setupEventListeners() {
    // New Joke Button
    this.jokeBtn.addEventListener('click', () => this.displayRandomJoke());
    
    // Category Filter
    this.categoryFilter.addEventListener('change', () => this.displayRandomJoke());
    
    // Rating Stars
    this.stars.forEach(star => {
      star.addEventListener('click', (e) => this.rateJoke(e.target.dataset.rating));
      star.addEventListener('mouseover', (e) => this.hoverRating(e.target.dataset.rating));
      star.addEventListener('mouseout', () => this.resetStarDisplay());
    });
    
    // Favorite Button
    this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    
    // Share Button
    this.shareBtn.addEventListener('click', () => this.shareJoke());
  }
  
  getFilteredJokes() {
    const selectedCategory = this.categoryFilter.value;
    if (selectedCategory === 'all') {
      return this.jokes;
    }
    return this.jokes.filter(joke => joke.category === selectedCategory);
  }
  
  displayRandomJoke() {
    const filteredJokes = this.getFilteredJokes();
    
    if (filteredJokes.length === 0) {
      this.jokeEl.textContent = "No jokes found for this category. Try another category!";
      this.categoryEl.textContent = "";
      this.currentJoke = null;
      this.updateRatingDisplay(null);
      this.updateFavoriteButton();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredJokes.length);
    this.currentJoke = filteredJokes[randomIndex];
    
    this.jokeEl.textContent = this.currentJoke.text;
    this.categoryEl.textContent = this.currentJoke.category;
    
    this.updateRatingDisplay(this.currentJoke);
    this.updateFavoriteButton();
  }
  
  rateJoke(rating) {
    if (!this.currentJoke) return;
    
    this.currentRating = parseInt(rating);
    const jokeId = this.currentJoke.text;
    this.userRatings[jokeId] = this.currentRating;
    
    // Update average rating
    const existingRatings = this.currentJoke.userRatings || [];
    existingRatings.push(this.currentRating);
    this.currentJoke.userRatings = existingRatings;
    
    // Calculate new average
    const totalRatings = existingRatings.length;
    const sumRatings = existingRatings.reduce((a, b) => a + b, 0);
    const averageRating = (this.currentJoke.rating + (sumRatings / totalRatings)) / 2;
    
    // Save to localStorage
    localStorage.setItem('jokeRatings', JSON.stringify(this.userRatings));
    
    // Update display
    this.updateStarDisplay(this.currentRating);
    this.averageRatingEl.textContent = `Average: ${averageRating.toFixed(1)}/5 (${totalRatings} ratings)`;
    
    // Show success message
    Toastify({
      text: `Rated ${this.currentRating} stars!`,
      duration: 2000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #38bdf8, #6366f1)",
    }).showToast();
  }
  
  hoverRating(rating) {
    this.updateStarDisplay(parseInt(rating));
  }
  
  resetStarDisplay() {
    if (this.currentRating > 0) {
      this.updateStarDisplay(this.currentRating);
    } else {
      this.updateStarDisplay(0);
    }
  }
  
  updateStarDisplay(rating) {
    this.stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= rating) {
        star.classList.add('active');
        star.classList.remove('ri-star-line');
        star.classList.add('ri-star-fill');
      } else {
        star.classList.remove('active');
        star.classList.remove('ri-star-fill');
        star.classList.add('ri-star-line');
      }
    });
  }
  
  updateRatingDisplay(joke) {
    if (!joke) {
      this.updateStarDisplay(0);
      this.averageRatingEl.textContent = "Not rated yet";
      return;
    }
    
    const jokeId = joke.text;
    const userRating = this.userRatings[jokeId] || 0;
    this.currentRating = userRating;
    
    const totalRatings = joke.userRatings ? joke.userRatings.length + 1 : 1;
    const averageRating = joke.userRatings ? 
      (joke.rating + (joke.userRatings.reduce((a, b) => a + b, 0) / joke.userRatings.length)) / 2 : 
      joke.rating;
    
    this.updateStarDisplay(userRating);
    this.averageRatingEl.textContent = `Average: ${averageRating.toFixed(1)}/5 (${totalRatings} ratings)`;
  }
  
  toggleFavorite() {
    if (!this.currentJoke) return;
    
    const jokeText = this.currentJoke.text;
    const index = this.favorites.findIndex(fav => fav.text === jokeText);
    
    if (index === -1) {
      // Add to favorites
      this.favorites.push({
        text: this.currentJoke.text,
        category: this.currentJoke.category,
        addedAt: new Date().toISOString()
      });
      this.favoriteBtn.innerHTML = '<i class="ri-heart-fill"></i>';
      this.favoriteBtn.classList.add('active');
      
      Toastify({
        text: "Added to favorites!",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #dc2626, #ef4444)",
      }).showToast();
    } else {
      // Remove from favorites
      this.favorites.splice(index, 1);
      this.favoriteBtn.innerHTML = '<i class="ri-heart-line"></i>';
      this.favoriteBtn.classList.remove('active');
      
      Toastify({
        text: "Removed from favorites",
        duration: 2000,
        gravity: "top",
        position: "right",
      }).showToast();
    }
    
    // Save to localStorage and update display
    localStorage.setItem('favoriteJokes', JSON.stringify(this.favorites));
    this.loadFavorites();
  }
  
  updateFavoriteButton() {
    if (!this.currentJoke) {
      this.favoriteBtn.innerHTML = '<i class="ri-heart-line"></i>';
      this.favoriteBtn.classList.remove('active');
      return;
    }
    
    const isFavorite = this.favorites.some(fav => fav.text === this.currentJoke.text);
    if (isFavorite) {
      this.favoriteBtn.innerHTML = '<i class="ri-heart-fill"></i>';
      this.favoriteBtn.classList.add('active');
    } else {
      this.favoriteBtn.innerHTML = '<i class="ri-heart-line"></i>';
      this.favoriteBtn.classList.remove('active');
    }
  }
  
  shareJoke() {
    if (!this.currentJoke) return;
    
    const shareText = `${this.currentJoke.text} #JokeGenerator`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?joke=${encodeURIComponent(this.currentJoke.text)}`;
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = `${shareText}\n\n${shareUrl}`;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the text
    try {
      document.execCommand('copy');
      Toastify({
        text: "Joke link copied to clipboard!",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #10b981, #059669)",
      }).showToast();
    } catch (err) {
      console.error('Failed to copy:', err);
      Toastify({
        text: "Failed to copy. Please try again.",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #dc2626, #ef4444)",
      }).showToast();
    }
    
    // Clean up
    document.body.removeChild(tempInput);
  }
  
  loadFavorites() {
    this.favoritesList.innerHTML = '';
    
    if (this.favorites.length === 0) {
      this.favoritesList.innerHTML = '<div class="empty-favorites">No favorite jokes yet</div>';
      return;
    }
    
    this.favorites.forEach((favorite, index) => {
      const favoriteItem = document.createElement('div');
      favoriteItem.className = 'favorite-item';
      
      favoriteItem.innerHTML = `
        <div class="favorite-text">${favorite.text}</div>
        <button class="remove-favorite" data-index="${index}">
          <i class="ri-close-line"></i>
        </button>
      `;
      
      this.favoritesList.appendChild(favoriteItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.removeFavorite(index);
      });
    });
  }
  
  removeFavorite(index) {
    this.favorites.splice(index, 1);
    localStorage.setItem('favoriteJokes', JSON.stringify(this.favorites));
    this.loadFavorites();
    
    // Update favorite button if current joke was removed
    if (this.currentJoke && this.favorites.every(fav => fav.text !== this.currentJoke.text)) {
      this.updateFavoriteButton();
    }
    
    Toastify({
      text: "Removed from favorites",
      duration: 2000,
      gravity: "top",
      position: "right",
    }).showToast();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JokeGenerator();
});