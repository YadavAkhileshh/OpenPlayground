const categoryButtons =
  document.querySelectorAll(".categories button");

searchInput.addEventListener("input", displayEmojis);

categoryButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    categoryButtons.forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    selectedCategory = btn.dataset.category;

    displayEmojis();
  });
});

displayEmojis();
