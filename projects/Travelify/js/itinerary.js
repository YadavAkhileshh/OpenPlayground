let itinerary = JSON.parse(localStorage.getItem('itinerary')) || [];

function displayItinerary() {
  const list = document.getElementById('itineraryList');
  list.innerHTML = '';
  itinerary.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${item.day}: ${item.activity} <button onclick="deleteActivity(${index})">❌</button>`;
    list.appendChild(li);
  });
}

function addActivity() {
  const day = document.getElementById('day').value;
  const activity = document.getElementById('activity').value;
  if(day && activity) {
    itinerary.push({day, activity});
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    displayItinerary();
  } else alert('Fill all fields!');
}

function deleteActivity(index) {
  itinerary.splice(index,1);
  localStorage.setItem('itinerary', JSON.stringify(itinerary));
  displayItinerary();
}

displayItinerary();