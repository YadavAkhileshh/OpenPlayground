let products = [];

// Fetch products from JSON
fetch('product.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    populateDropdowns();
  })
  .catch(err => console.error('Error loading products:', err));

const dropdowns = ["product1","product2","product3"];

function populateDropdowns() {
  dropdowns.forEach(id => {
    const select = document.getElementById(id);
    products.forEach(p => {
      const option = document.createElement("option");
      option.value = p.name;
      option.textContent = p.name;
      select.appendChild(option);
    });
  });
}

// Compare products
document.getElementById('compareBtn').addEventListener('click', () => {
  dropdowns.forEach((id, index) => {
    const selected = document.getElementById(id).value;
    const product = products.find(p => p.name === selected);

    document.getElementById("price"+(index+1)).textContent = product ? "$"+product.price : "-";
    document.getElementById("rating"+(index+1)).textContent = product ? product.rating+" ★" : "-";
    document.getElementById("features"+(index+1)).textContent = product ? product.features : "-";
  });

  // Highlight lowest price
  const prices = dropdowns.map((id, index) => {
    const priceCell = document.getElementById("price"+(index+1));
    return priceCell.textContent === "-" ? Infinity : parseFloat(priceCell.textContent.replace("$",""));
  });

  const minPrice = Math.min(...prices);
  dropdowns.forEach((id, index) => {
    const priceCell = document.getElementById("price"+(index+1));
    priceCell.classList.toggle("highlight", parseFloat(priceCell.textContent.replace("$","")) === minPrice);
  });
});
