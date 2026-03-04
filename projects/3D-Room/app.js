/*
		Designed by: Jarlan Perez
		Original image: https://www.artstation.com/artwork/VdBllN

*/


const h = document.querySelector("#h");
const b = document.body;

let base = (e) => {
    var x = e.pageX / window.innerWidth - 0.5;
    var y = e.pageY / window.innerHeight - 0.5;
    h.style.transform = `
        perspective(90vw)
        rotateX(${ y * 10  + 75}deg)
        rotateZ(${ -x * 25  + 45}deg)
        translateZ(-9vw)
    `;
}

b.addEventListener("pointermove", base);
