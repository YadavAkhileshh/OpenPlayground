const trips = JSON.parse(localStorage.getItem('trips')) || [];
const favoriteTrips = trips.slice(0,3); // Demo: first 3 as favorites
const pastTrips = trips.slice(3); // Rest as past trips

function displayList(listId, data) {
  const ul = document.getElementById(listId);
  ul.innerHTML = '';
  data.forEach(trip => {
    const li = document.createElement('li');
    li.innerText = `${trip.name} - ${trip.dest} - ${trip.date}`;
    ul.appendChild(li);
  });
}

displayList('favoriteTrips', favoriteTrips);
displayList('pastTrips', pastTrips);