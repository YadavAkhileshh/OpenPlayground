// ArtLens - main JS

const artUpload = document.getElementById('art-upload');
const artPreview = document.getElementById('art-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const feedbackOutput = document.getElementById('feedback-output');
const styleSuggestions = document.getElementById('style-suggestions');

let uploadedImage = null;

artUpload.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        artPreview.innerHTML = `<img src="${evt.target.result}" alt="Artwork Preview">`;
        uploadedImage = evt.target.result;
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
};

function getRandomFeedback() {
    const feedbacks = [
        "Great use of color and composition!",
        "Try experimenting with different textures.",
        "Consider focusing on lighting for more depth.",
        "Your style is unique! Explore more abstract elements.",
        "Balance between foreground and background can be improved."
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

function getStyleSuggestions() {
    const styles = [
        "Impressionism",
        "Cubism",
        "Surrealism",
        "Pop Art",
        "Minimalism",
        "Expressionism",
        "Realism"
    ];
    // Suggest 2-3 random styles
    const shuffled = styles.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

analyzeBtn.onclick = () => {
    if (!uploadedImage) return;
    feedbackOutput.textContent = getRandomFeedback();
    styleSuggestions.innerHTML = '';
    getStyleSuggestions().forEach(style => {
        const li = document.createElement('li');
        li.textContent = style;
        styleSuggestions.appendChild(li);
    });
};
