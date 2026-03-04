// Modal
const modal = document.getElementById("modal");
document.getElementById("openModal").onclick = () => {
  modal.style.display = "block";
};

document.querySelector(".close").onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`)
      .classList.add("active");
  });
});

// Accordion
const accordions = document.querySelectorAll(".accordion");

accordions.forEach(acc => {
  acc.addEventListener("click", () => {
    const panel = acc.nextElementSibling;
    panel.style.display =
      panel.style.display === "block" ? "none" : "block";
  });
});