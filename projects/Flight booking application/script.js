
// Flight data
const flightData = [
    {
        id: 1,
        airline: "SkyJet",
        airlineCode: "SJ",
        flightNumber: "SJ245",
        departure: { code: "JFK", city: "New York", time: "08:30" },
        arrival: { code: "LHR", city: "London", time: "20:45" },
        duration: "7h 15m",
        stops: "Non-stop",
        price: 645,
        class: "economy"
    },
    {
        id: 2,
        airline: "GlobalAir",
        airlineCode: "GA",
        flightNumber: "GA789",
        departure: { code: "JFK", city: "New York", time: "14:20" },
        arrival: { code: "LHR", city: "London", time: "02:10" },
        duration: "6h 50m",
        stops: "Non-stop",
        price: 720,
        class: "premium"
    },
    {
        id: 3,
        airline: "Oceanic",
        airlineCode: "OC",
        flightNumber: "OC512",
        departure: { code: "JFK", city: "New York", time: "11:45" },
        arrival: { code: "LHR", city: "London", time: "23:30" },
        duration: "7h 45m",
        stops: "Non-stop",
        price: 590,
        class: "economy"
    },
    {
        id: 4,
        airline: "SkyJet",
        airlineCode: "SJ",
        flightNumber: "SJ301",
        departure: { code: "LAX", city: "Los Angeles", time: "09:15" },
        arrival: { code: "CDG", city: "Paris", time: "06:30" },
        duration: "11h 15m",
        stops: "Non-stop",
        price: 820,
        class: "business"
    },
    {
        id: 5,
        airline: "GlobalAir",
        airlineCode: "GA",
        flightNumber: "GA422",
        departure: { code: "LAX", city: "Los Angeles", time: "13:40" },
        arrival: { code: "CDG", city: "Paris", time: "10:20" },
        duration: "10h 40m",
        stops: "1 stop (AMS)",
        price: 695,
        class: "premium"
    },
    {
        id: 6,
        airline: "Oceanic",
        airlineCode: "OC",
        flightNumber: "OC667",
        departure: { code: "LHR", city: "London", time: "16:25" },
        arrival: { code: "DXB", city: "Dubai", time: "03:15" },
        duration: "6h 50m",
        stops: "Non-stop",
        price: 550,
        class: "economy"
    },
    {
        id: 7,
        airline: "SkyJet",
        airlineCode: "SJ",
        flightNumber: "SJ189",
        departure: { code: "CDG", city: "Paris", time: "10:10" },
        arrival: { code: "HND", city: "Tokyo", time: "08:30" },
        duration: "12h 20m",
        stops: "Non-stop",
        price: 1150,
        class: "business"
    },
    {
        id: 8,
        airline: "GlobalAir",
        airlineCode: "GA",
        flightNumber: "GA934",
        departure: { code: "SYD", city: "Sydney", time: "18:45" },
        arrival: { code: "JFK", city: "New York", time: "16:30" },
        duration: "19h 45m",
        stops: "1 stop (LAX)",
        price: 1350,
        class: "first"
    }
];

// Current state
let selectedFlight = null;
let currentSort = "price";
let currentAirlineFilter = "all";
let bookingData = {
    flight: null,
    passengers: [],
    paymentMethod: null
};

// DOM elements
const searchBtn = document.getElementById("search-btn");
const flightResults = document.getElementById("flight-results");
const bookingForm = document.getElementById("booking-form");
const filterButtons = document.querySelectorAll(".filter-btn");
const confirmationModal = document.getElementById("confirmation-modal");
const confirmationDetails = document.getElementById("confirmation-details");
const referenceNumber = document.getElementById("reference-number");
const closeConfirmationBtn = document.getElementById("close-confirmation");
const closeModalBtn = document.querySelector(".close-modal");

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    // Display initial flight results
    displayFlights(flightData);
    
    // Set up event listeners
    searchBtn.addEventListener("click", handleSearch);
    
    // Set up filter button listeners
    filterButtons.forEach(button => {
        button.addEventListener("click", handleFilterClick);
    });
    
    // Set up modal close listeners
    closeConfirmationBtn.addEventListener("click", () => {
        confirmationModal.style.display = "none";
    });
    
    closeModalBtn.addEventListener("click", () => {
        confirmationModal.style.display = "none";
    });
    
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = "none";
        }
    });
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("departure").min = today;
    document.getElementById("return").min = today;
});

// Handle search button click
function handleSearch() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const departure = document.getElementById("departure").value;
    const returnDate = document.getElementById("return").value;
    const passengers = document.getElementById("passengers").value;
    const flightClass = document.getElementById("class").value;
    
    // Validate inputs
    if (!from || !to || !departure) {
        alert("Please fill in all required fields: From, To, and Departure Date.");
        return;
    }
    
    if (from === to) {
        alert("Departure and destination cities cannot be the same.");
        return;
    }
    
    // In a real app, this would be an API call
    // For this demo, we'll filter the existing flight data
    let filteredFlights = flightData.filter(flight => {
        // Simple filtering logic for demo purposes
        // In reality, you'd have more complex logic based on airport codes, dates, etc.
        const matchesRoute = flight.departure.code === from && flight.arrival.code === to;
        const matchesClass = flight.class === flightClass || flightClass === "premium";
        
        return matchesRoute && matchesClass;
    });
    
    // If no flights found, show a message
    if (filteredFlights.length === 0) {
        flightResults.innerHTML = `
            <div class="no-flights">
                <i class="fas fa-plane-slash"></i>
                <h3>No flights found</h3>
                <p>We couldn't find any flights matching your criteria. Try adjusting your search.</p>
            </div>
        `;
        
        // Reset booking form
        bookingForm.innerHTML = `
            <div class="booking-placeholder">
                <i class="fas fa-plane"></i>
                <p>Select a flight to proceed with booking</p>
            </div>
        `;
        
        selectedFlight = null;
        bookingData.flight = null;
        return;
    }
    
    // Display filtered flights
    displayFlights(filteredFlights);
    
    // Show a message about the search
    const fromCity = document.getElementById("from").options[document.getElementById("from").selectedIndex].text;
    const toCity = document.getElementById("to").options[document.getElementById("to").selectedIndex].text;
    
    const searchInfo = document.createElement("div");
    searchInfo.className = "search-info";
    searchInfo.innerHTML = `
        <p>Showing ${filteredFlights.length} flights from ${fromCity} to ${toCity} on ${formatDate(departure)}</p>
    `;
    
    flightResults.insertBefore(searchInfo, flightResults.firstChild);
}

// Display flights in the results section
function displayFlights(flights) {
    // Sort flights based on current sort
    const sortedFlights = sortFlights([...flights], currentSort);
    
    // Filter by airline if needed
    let filteredFlights = sortedFlights;
    if (currentAirlineFilter !== "all") {
        filteredFlights = sortedFlights.filter(flight => flight.airline === currentAirlineFilter);
    }
    
    // Clear current results
    flightResults.innerHTML = "";
    
    // Create flight cards
    filteredFlights.forEach(flight => {
        const flightCard = createFlightCard(flight);
        flightResults.appendChild(flightCard);
    });
}

// Create a flight card element
function createFlightCard(flight) {
    const card = document.createElement("div");
    card.className = "flight-card";
    card.dataset.id = flight.id;
    
    // Calculate total price based on number of passengers
    const passengers = parseInt(document.getElementById("passengers").value) || 1;
    const totalPrice = flight.price * passengers;
    
    card.innerHTML = `
        <div class="flight-info">
            <div class="airline-logo">
                <i class="fas fa-plane"></i>
            </div>
            <div>
                <h3>${flight.airline}</h3>
                <p>${flight.flightNumber} • ${flight.class.charAt(0).toUpperCase() + flight.class.slice(1)} Class</p>
            </div>
        </div>
        
        <div class="flight-details">
            <div class="route">
                <div>
                    <div class="time">${flight.departure.time}</div>
                    <div class="code">${flight.departure.code}</div>
                    <div class="city">${flight.departure.city}</div>
                </div>
                <div>
                    <i class="fas fa-long-arrow-alt-right"></i>
                </div>
                <div>
                    <div class="time">${flight.arrival.time}</div>
                    <div class="code">${flight.arrival.code}</div>
                    <div class="city">${flight.arrival.city}</div>
                </div>
            </div>
            
            <div class="flight-duration">
                <div class="duration">${flight.duration}</div>
                <div class="flight-stops">${flight.stops}</div>
            </div>
        </div>
        
        <div class="flight-price">
            <div class="price">$${totalPrice}</div>
            <div class="per-person">$${flight.price} per person</div>
            <button class="select-btn" data-id="${flight.id}">Select Flight</button>
        </div>
    `;
    
    // Add event listener to the select button
    const selectBtn = card.querySelector(".select-btn");
    selectBtn.addEventListener("click", () => {
        selectFlight(flight);
    });
    
    return card;
}

// Handle flight selection
function selectFlight(flight) {
    selectedFlight = flight;
    bookingData.flight = flight;
    
    // Update UI to show selected flight
    const flightCards = document.querySelectorAll(".flight-card");
    flightCards.forEach(card => {
        card.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.05)";
        card.style.border = "none";
    });
    
    const selectedCard = document.querySelector(`.flight-card[data-id="${flight.id}"]`);
    if (selectedCard) {
        selectedCard.style.boxShadow = "0 0 0 3px #1e88e5, 0 8px 20px rgba(0, 0, 0, 0.1)";
    }
    
    // Show booking form
    showBookingForm(flight);
}

// Show booking form with flight details
function showBookingForm(flight) {
    const passengers = parseInt(document.getElementById("passengers").value) || 1;
    const totalPrice = flight.price * passengers;
    
    // Create passenger fields
    let passengerFields = "";
    for (let i = 1; i <= passengers; i++) {
        passengerFields += `
            <div class="passenger-field">
                <label for="passenger${i}-name">Passenger ${i} Full Name</label>
                <input type="text" id="passenger${i}-name" placeholder="Enter full name" required>
            </div>
            <div class="passenger-field">
                <label for="passenger${i}-email">Passenger ${i} Email</label>
                <input type="email" id="passenger${i}-email" placeholder="Enter email address" required>
            </div>
            <div class="passenger-field">
                <label for="passenger${i}-passport">Passport Number</label>
                <input type="text" id="passenger${i}-passport" placeholder="Enter passport number" required>
            </div>
        `;
    }
    
    bookingForm.innerHTML = `
        <div class="booking-details">
            <div class="booking-header">
                <div class="booking-summary">
                    <h3>${flight.departure.city} (${flight.departure.code}) to ${flight.arrival.city} (${flight.arrival.code})</h3>
                    <div class="booking-price">$${totalPrice}</div>
                </div>
                <div>
                    <p><strong>${flight.airline}</strong> - ${flight.flightNumber}</p>
                    <p>${flight.departure.time} → ${flight.arrival.time} (${flight.duration})</p>
                </div>
            </div>
            
            <div class="passenger-form">
                <h3 class="form-title">Passenger Details</h3>
                <div class="passenger-fields">
                    ${passengerFields}
                </div>
            </div>
            
            <div class="payment-section">
                <h3 class="form-title">Payment Method</h3>
                <div class="payment-methods">
                    <div class="payment-method" data-method="credit">
                        <i class="far fa-credit-card"></i>
                        <span>Credit Card</span>
                    </div>
                    <div class="payment-method" data-method="paypal">
                        <i class="fab fa-paypal"></i>
                        <span>PayPal</span>
                    </div>
                    <div class="payment-method" data-method="applepay">
                        <i class="fab fa-apple"></i>
                        <span>Apple Pay</span>
                    </div>
                </div>
            </div>
            
            <button class="book-btn" id="confirm-booking">Confirm Booking</button>
        </div>
    `;
    
    // Add event listeners to payment methods
    const paymentMethods = bookingForm.querySelectorAll(".payment-method");
    paymentMethods.forEach(method => {
        method.addEventListener("click", () => {
            // Remove selected class from all methods
            paymentMethods.forEach(m => m.classList.remove("selected"));
            // Add selected class to clicked method
            method.classList.add("selected");
            bookingData.paymentMethod = method.dataset.method;
        });
    });
    
    // Add event listener to confirm booking button
    const confirmBtn = bookingForm.querySelector("#confirm-booking");
    confirmBtn.addEventListener("click", handleBooking);
}

// Handle booking confirmation
function handleBooking() {
    // Validate passenger details
    const passengers = parseInt(document.getElementById("passengers").value) || 1;
    let allValid = true;
    bookingData.passengers = [];
    
    for (let i = 1; i <= passengers; i++) {
        const name = document.getElementById(`passenger${i}-name`).value;
        const email = document.getElementById(`passenger${i}-email`).value;
        const passport = document.getElementById(`passenger${i}-passport`).value;
        
        if (!name || !email || !passport) {
            allValid = false;
            break;
        }
        
        bookingData.passengers.push({ name, email, passport });
    }
    
    if (!allValid) {
        alert("Please fill in all passenger details.");
        return;
    }
    
    if (!bookingData.paymentMethod) {
        alert("Please select a payment method.");
        return;
    }
    
    // Generate a random booking reference
    const refNum = Math.floor(100000 + Math.random() * 900000);
    referenceNumber.textContent = refNum;
    
    // Show confirmation modal
    const flight = bookingData.flight;
    const totalPrice = flight.price * passengers;
    
    confirmationDetails.innerHTML = `
        <p>You have successfully booked <strong>${passengers} ticket(s)</strong> on ${flight.airline} flight ${flight.flightNumber}.</p>
        <p><strong>Route:</strong> ${flight.departure.city} (${flight.departure.code}) to ${flight.arrival.city} (${flight.arrival.code})</p>
        <p><strong>Departure:</strong> ${flight.departure.time}, <strong>Arrival:</strong> ${flight.arrival.time}</p>
        <p><strong>Total Amount:</strong> $${totalPrice}</p>
    `;
    
    confirmationModal.style.display = "flex";
    
    // Reset form after successful booking
    setTimeout(() => {
        bookingForm.innerHTML = `
            <div class="booking-placeholder">
                <i class="fas fa-plane"></i>
                <p>Select a flight to proceed with booking</p>
            </div>
        `;
        
        selectedFlight = null;
        bookingData = {
            flight: null,
            passengers: [],
            paymentMethod: null
        };
        
        // Reset flight cards selection
        const flightCards = document.querySelectorAll(".flight-card");
        flightCards.forEach(card => {
            card.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.05)";
        });
    }, 100);
}

// Handle filter button clicks
function handleFilterClick(event) {
    const button = event.target;
    const sortType = button.dataset.sort;
    const airline = button.dataset.airline;
    
    // Handle sort buttons
    if (sortType) {
        // Update active state
        document.querySelectorAll(".filter-btn[data-sort]").forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        
        // Update sort and re-display flights
        currentSort = sortType;
        displayFlights(flightData);
    }
    
    // Handle airline filter buttons
    if (airline) {
        // Update active state
        document.querySelectorAll(".filter-btn[data-airline]").forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        
        // Update filter and re-display flights
        currentAirlineFilter = airline;
        displayFlights(flightData);
    }
}

// Sort flights based on criteria
function sortFlights(flights, criteria) {
    switch (criteria) {
        case "price":
            return flights.sort((a, b) => a.price - b.price);
        case "duration":
            // Convert duration string to minutes for sorting
            return flights.sort((a, b) => {
                const aMinutes = convertDurationToMinutes(a.duration);
                const bMinutes = convertDurationToMinutes(b.duration);
                return aMinutes - bMinutes;
            });
        case "departure":
            return flights.sort((a, b) => {
                const aTime = convertTimeToMinutes(a.departure.time);
                const bTime = convertTimeToMinutes(b.departure.time);
                return aTime - bTime;
            });
        default:
            return flights;
    }
}

// Helper function to convert duration string to minutes
function convertDurationToMinutes(duration) {
    const parts = duration.match(/(\d+)h\s*(\d*)m?/);
    if (!parts) return 0;
    
    const hours = parseInt(parts[1]) || 0;
    const minutes = parseInt(parts[2]) || 0;
    
    return hours * 60 + minutes;
}

// Helper function to convert time string to minutes
function convertTimeToMinutes(time) {
    const parts = time.split(':');
    if (parts.length !== 2) return 0;
    
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    return hours * 60 + minutes;
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);

}



function openTab(id, el){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll("nav li").forEach(l=>l.classList.remove("active"));
  el.classList.add("active");
}

/* DARK MODE */
themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark")?"dark":"light");
};
if(localStorage.getItem("theme")==="dark"){
  document.body.classList.add("dark");
}

/* DATA */
const flights=[
  {id:1,from:"Mumbai",to:"Delhi",time:"08:30 AM",price:4200},
  {id:2,from:"Mumbai",to:"Bangalore",time:"10:15 AM",price:5200},
  {id:3,from:"Delhi",to:"Kolkata",time:"01:00 PM",price:4800},
  {id:4,from:"Pune",to:"Goa",time:"03:45 PM",price:3500},
  {id:5,from:"Hyderabad",to:"Chennai",time:"06:30 PM",price:4000}
];

let bookings=JSON.parse(localStorage.getItem("bookings"))||[];
const flightList=document.getElementById("flightList");
const bookingList=document.getElementById("bookings");

searchForm.onsubmit=e=>{
  e.preventDefault();
  renderFlights();
};

function renderFlights(){
  flightList.innerHTML="";
  flights.forEach(f=>{
    flightList.innerHTML+=`
      <div class="flight">
        <div><b>${f.from} → ${f.to}</b><br><small>${f.time}</small></div>
        <div>
          <div class="price">₹${f.price}</div>
          <button class="book" onclick="bookFlight(${f.id})">Book</button>
        </div>
      </div>`;
  });
}

function bookFlight(id){
  const f=flights.find(x=>x.id===id);
  bookings.push({
    ticketId:"FL-"+Math.floor(100000+Math.random()*900000),
    ...f,
    date:date.value,
    class:travelClass.value
  });
  localStorage.setItem("bookings",JSON.stringify(bookings));
  renderBookings();
  modal.style.display="flex";
}

function renderBookings(){
  bookingList.innerHTML=bookings.length?"":"<p>No bookings yet</p>";
  bookings.forEach((b,i)=>{
    bookingList.innerHTML+=`
      <div class="booking">
        <b>${b.from} → ${b.to}</b><br>
        Ticket ID: <b>${b.ticketId}</b><br>
        ${b.date} • ${b.time}<br>
        Class: ${b.class} • ₹${b.price}
        <div class="actions">
          <button class="pdf" onclick="downloadTicket(${i})">
            <i class="fa-solid fa-file-pdf"></i> PDF
          </button>
          <button class="delete" onclick="deleteBooking(${i})">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>`;
  });
}

function deleteBooking(i){
  bookings.splice(i,1);
  localStorage.setItem("bookings",JSON.stringify(bookings));
  renderBookings();
}

function downloadTicket(i){
  const b=bookings[i];
  ticketInfo.innerHTML=`
    <b>Ticket ID:</b> ${b.ticketId}<br><br>
    <b>Route:</b> ${b.from} → ${b.to}<br>
    <b>Date:</b> ${b.date}<br>
    <b>Time:</b> ${b.time}<br>
    <b>Class:</b> ${b.class}<br>
    <b>Price:</b> ₹${b.price}`;
  ticket.style.display="block";
}

function closeModal(){
  modal.style.display="none";
}

renderBookings();

