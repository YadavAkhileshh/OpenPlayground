const imageInput = document.getElementById('imageInput');
const uploadedImage = document.getElementById('uploadedImage');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const caption = document.getElementById('caption');
const captionText = document.getElementById('captionText');
const copyBtn = document.getElementById('copyBtn');

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            generateBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

function generateCaption() {
    const captions = [
        "A mesmerizing glimpse into [scene], captured with artistic flair.",
        "This image radiates [emotion], telling a story of [theme].",
        "Behold the beauty of [subject], frozen in time.",
        "An AI-generated masterpiece that evokes [feeling] and wonder.",
        "Through the lens of creativity, this [object] comes alive.",
        "A poetic interpretation of [element], full of [quality]."
    ];
    const adjectives = ["vibrant", "serene", "dramatic", "whimsical", "majestic", "intimate"];
    const nouns = ["landscape", "portrait", "still life", "abstract art", "nature scene", "urban vista"];

    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    let finalCaption = randomCaption;
    finalCaption = finalCaption.replace('[scene]', randomNoun);
    finalCaption = finalCaption.replace('[emotion]', randomAdj);
    finalCaption = finalCaption.replace('[theme]', randomNoun);
    finalCaption = finalCaption.replace('[subject]', randomNoun);
    finalCaption = finalCaption.replace('[feeling]', randomAdj);
    finalCaption = finalCaption.replace('[object]', randomNoun);
    finalCaption = finalCaption.replace('[element]', randomNoun);
    finalCaption = finalCaption.replace('[quality]', randomAdj);

    captionText.textContent = finalCaption;
    caption.style.display = 'block';
    regenerateBtn.style.display = 'inline-block';
}

generateBtn.addEventListener('click', generateCaption);
regenerateBtn.addEventListener('click', generateCaption);

copyBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(captionText.textContent).then(() => {
        alert('Caption copied to clipboard!');
    });
});