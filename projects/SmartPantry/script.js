const budgetSpan = document.getElementById("budgetAmount");

function updateBudgetUI() {
  budgetSpan.textContent = budget;
}

document.getElementById("addItemBtn").onclick = () => {
  editIndex = null;
  itemModal.style.display = "flex";
};

document.getElementById("budgetBtn").onclick = () => {
  budgetModal.style.display = "flex";
};

document.getElementById("saveItemBtn").onclick = () => {
  const name = itemName.value.trim();
  const count = +itemCountInput.value;
  const price = +itemPrice.value;
  const category = itemCategory.value.trim();

  if (!name || !category || price <= 0) return;

  if (budget === 0 || price > budget) {
    alert("⚠ Budget exceeded. Cannot add item.");
    return;
  }

  const item = { name, count, price, category };

  if (editIndex !== null) {
    budget += pantry[editIndex].price;
    pantry[editIndex] = item;
  } else {
    pantry.push(item);
  }

  budget -= price;
  updateBudgetUI();
  renderPantry();
  closeItemModal();
};

document.getElementById("saveBudgetBtn").onclick = () => {
  budget = +budgetInput.value;
  updateBudgetUI();
  closeBudgetModal();
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
};

function closeItemModal() {
  itemModal.style.display = "none";
}

function closeBudgetModal() {
  budgetModal.style.display = "none";
}

function updateBudgetUI() {
  budgetSpan.textContent = budget;

  // Calculate spent
  const spent = pantry.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("spentAmount").textContent = spent;
}

const searchInput = document.getElementById("searchInput");

// Filter pantry by search text
searchInput.addEventListener("input", () => {
  renderPantry(searchInput.value.trim().toLowerCase());
});


updateBudgetUI();
renderPantry();
