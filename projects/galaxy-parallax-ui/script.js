const cards = document.querySelectorAll(".card");

document.addEventListener("mousemove",(e)=>{
    const x = (window.innerWidth/2 - e.pageX)/25;
    const y = (window.innerHeight/2 - e.pageY)/25;

    cards.forEach(card=>{
        card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
});
