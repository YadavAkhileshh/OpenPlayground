function showPage(page){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"))
document.getElementById(page).classList.add("active")

}

document.getElementById("searchInput").addEventListener("keyup",function(){

let value=this.value.toLowerCase()

document.querySelectorAll(".card").forEach(card=>{

let name=card.dataset.name
card.style.display=name.includes(value)?"block":"none"

})

})

function openModal(name){

document.getElementById("modalTitle").innerText=name

document.getElementById("modalText").innerText="More information about "+name+" and their contribution to India's freedom movement."

document.getElementById("modal").style.display="flex"

}

function closeModal(){
document.getElementById("modal").style.display="none"
}
