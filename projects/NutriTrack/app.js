const navs=document.querySelectorAll(".nav");
const pages=document.querySelectorAll(".page");
const pageTitle=document.getElementById("pageTitle");

navs.forEach(nav=>{
    nav.addEventListener("click",()=>{
        navs.forEach(n=>n.classList.remove("active"));
        nav.classList.add("active");

        pages.forEach(p=>p.classList.remove("active-page"));
        document.getElementById(nav.dataset.page).classList.add("active-page");

        pageTitle.innerText=nav.innerText;
    });
});

// Toggle Dark Mode
const toggleBtn = document.getElementById("darkModeToggle");

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("darkMode", "enabled");
        toggleBtn.innerHTML = "☀️";
    } else {
        localStorage.setItem("darkMode", "disabled");
        toggleBtn.innerHTML = "🌙";
    }
});

// Restore Dark Mode on Reload
window.addEventListener("load", () => {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark");
        toggleBtn.innerHTML = "☀️";
    }
});