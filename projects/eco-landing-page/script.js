const features = document.querySelectorAll(".feature");

window.addEventListener("scroll",()=>{
    features.forEach(feature=>{
        const position = feature.getBoundingClientRect().top;
        const screen = window.innerHeight;

        if(position < screen - 100){
            feature.style.opacity = 1;
            feature.style.transform = "translateY(0)";
        }
    });
});
