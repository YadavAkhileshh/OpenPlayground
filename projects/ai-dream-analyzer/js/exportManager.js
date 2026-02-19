export function exportAsImage() {
    html2canvas(document.querySelector(".result-card"))
        .then(canvas => {
            const link = document.createElement("a");
            link.download = "dream-interpretation.png";
            link.href = canvas.toDataURL();
            link.click();
        });
}