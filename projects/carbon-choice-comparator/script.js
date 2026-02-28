const choices = {
    Transport: {
      "Car (5 km)": 1.2,
      "Bus (5 km)": 0.4,
      "Bicycle (5 km)": 0.0,
      "Walking (5 km)": 0.0
    },
    Food: {
      "Beef Meal": 5.0,
      "Chicken Meal": 1.8,
      "Vegetarian Meal": 0.9,
      "Vegan Meal": 0.4
    },
    Energy: {
      "AC (1 hour)": 1.5,
      "Fan (1 hour)": 0.1,
      "LED Bulb (5 hours)": 0.05,
      "Phone Charging": 0.01
    }
  };
  
  // DOM
  const selectA = document.getElementById("choiceA");
  const selectB = document.getElementById("choiceB");
  const barA = document.getElementById("barA");
  const barB = document.getElementById("barB");
  const labelA = document.getElementById("labelA");
  const labelB = document.getElementById("labelB");
  const contextA = document.getElementById("contextA");
  const contextB = document.getElementById("contextB");
  const resetBtn = document.getElementById("resetBtn");
  
  // Build dropdown options
  function populate(select) {
    for (const category in choices) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = category;
  
      for (const item in choices[category]) {
        const option = document.createElement("option");
        option.value = choices[category][item];
        option.textContent = item;
        optgroup.appendChild(option);
      }
  
      select.appendChild(optgroup);
    }
  }
  
  populate(selectA);
  populate(selectB);
  
  // Comparison logic
  function updateComparison() {
    const valueA = Number(selectA.value);
    const valueB = Number(selectB.value);
  
    const max = Math.max(valueA, valueB, 0.01);
  
    barA.style.width = `${(valueA / max) * 100}%`;
    barB.style.width = `${(valueB / max) * 100}%`;
  
    barA.style.background = valueA > valueB ? "#ef4444" : "#22c55e";
    barB.style.background = valueB > valueA ? "#ef4444" : "#22c55e";
  
    labelA.textContent = selectA.selectedOptions[0]?.text || "";
    labelB.textContent = selectB.selectedOptions[0]?.text || "";
  
    contextA.textContent = equivalence(valueA);
    contextB.textContent = equivalence(valueB);
  }
  
  // Contextual equivalence
  function equivalence(value) {
    const phoneCharges = Math.round(value / 0.01);
    return value === 0
      ? "≈ zero direct emissions"
      : `≈ charging a phone ${phoneCharges} times`;
  }
  
  selectA.addEventListener("change", updateComparison);
  selectB.addEventListener("change", updateComparison);
  
  resetBtn.addEventListener("click", () => {
    selectA.selectedIndex = 0;
    selectB.selectedIndex = 0;
    barA.style.width = "0%";
    barB.style.width = "0%";
    labelA.textContent = "";
    labelB.textContent = "";
    contextA.textContent = "";
    contextB.textContent = "";
  });
  