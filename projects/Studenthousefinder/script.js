const houses = [
  {
    name: "Green View PG",
    rent: 6000,
    distance: 1,
    type: "PG",
    facilities: "WiFi, Food, Laundry"
  },
  {
    name: "Student Nest",
    rent: 8500,
    distance: 3,
    type: "Flat",
    facilities: "WiFi, Kitchen"
  },
  {
    name: "Campus Stay",
    rent: 5000,
    distance: 2,
    type: "PG",
    facilities: "Food, Security"
  },
  {
    name: "Urban Rooms",
    rent: 10000,
    distance: 5,
    type: "Flat",
    facilities: "AC, WiFi, Parking"
  }
];

const list = document.getElementById("houseList");

function loadHouses(data) {
  list.innerHTML = "";
  data.forEach(house => {
    list.innerHTML += `
      <div class="house-card">
        <h3>${house.name}</h3>
        <p><b>Rent:</b> ₹${house.rent}/month</p>
        <p><b>Distance:</b> ${house.distance} km</p>
        <p><b>Type:</b> ${house.type}</p>
        <p><b>Facilities:</b> ${house.facilities}</p>
      </div>
    `;
  });
}

function filterHouses() {
  const maxRent = document.getElementById("maxRent").value;
  const distance = document.getElementById("distance").value;

  let filtered = houses;

  if (maxRent) {
    filtered = filtered.filter(h => h.rent <= maxRent);
  }

  if (distance) {
    filtered = filtered.filter(h => h.distance <= distance);
  }

  loadHouses(filtered);
}

loadHouses(houses);
