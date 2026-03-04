export function typeEffect(elementId, text) {
    const element = document.getElementById(elementId);
    element.textContent = "";
    let i = 0;

    const interval = setInterval(() => {
        element.textContent += text[i];
        i++;
        if(i >= text.length) clearInterval(interval);
    }, 30);
}