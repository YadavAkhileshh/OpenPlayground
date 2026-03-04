let trips = JSON.parse(localStorage.getItem('trips')) || [];

function displayTrips() {
  const tripList = document.getElementById('tripList');
  tripList.innerHTML = '';
  trips.forEach((trip, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${trip.name} - ${trip.dest} - ${trip.date} <button onclick="deleteTrip(${index})">❌</button>`;
    tripList.appendChild(li);
  });
}

function addTrip() {
  const name = document.getElementById('tripName').value;
  const dest = document.getElementById('tripDest').value;
  const date = document.getElementById('tripDate').value;
  if(name && dest && date) {
    trips.push({name, dest, date});
    localStorage.setItem('trips', JSON.stringify(trips));
    displayTrips();
  } else alert('Fill all fields!');
}

function deleteTrip(index) {
  trips.splice(index,1);
  localStorage.setItem('trips', JSON.stringify(trips));
  displayTrips();
}

displayTrips();