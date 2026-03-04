// Practice JavaScript File
// Try adding your own functions and committing them!

console.log('🎉 Git Practice Project Loaded!');

// Sample function to practice with
function greetUser(name) {
    return `Hello, ${name}! Welcome to Git practice.`;
}

// TODO: Add your own function here
function calculateSum(a, b) {
    return a + b;
}

// TODO: Add more functions as you learn
function getCurrentDate() {
    return new Date().toLocaleDateString();
}

// Event listeners (if needed)
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded and ready!');
    console.log(greetUser('Git Learner'));
    console.log('Current date:', getCurrentDate());
});

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        greetUser,
        calculateSum,
        getCurrentDate
    };
}
