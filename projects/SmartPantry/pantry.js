function renderPantry(filterText = "") {
  const list = document.getElementById("pantryList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("itemCount");

  list.innerHTML = "";

  // Filter pantry based on search input
  let filtered = pantry.filter(item => 
    item.name.toLowerCase().includes(filterText) ||
    item.category.toLowerCase().includes(filterText)
  );

  if (filtered.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
  }

  count.textContent = filtered.length;

  filtered.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} (${item.category}) - ₹${item.price}
      <span>
        <button onclick="editItem(${i})"><i class="fa-solid fa-pen"></i></button>
        <button class="danger" onclick="deleteItem(${i})"><i class="fa-solid fa-trash"></i></button>
      </span>
    `;
    list.appendChild(li);
  });
}

function deleteItem(i) {
  budget += pantry[i].price;
  pantry.splice(i, 1);
  updateBudgetUI();
  renderPantry();
}

function editItem(i) {
  editIndex = i;
  const item = pantry[i];

  itemName.value = item.name;
  itemCountInput.value = item.count;
  itemPrice.value = item.price;
  itemCategory.value = item.category;

  itemModal.style.display = "flex";
}
