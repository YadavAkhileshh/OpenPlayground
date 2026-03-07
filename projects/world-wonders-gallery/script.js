function showPage(page){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(page).classList.add("active")

}