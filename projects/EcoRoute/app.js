// EcoRoute Main JavaScript

const routeForm = document.getElementById('routeForm');
const resultDiv = document.getElementById('result');
const historyDiv = document.getElementById('history');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

let routeHistory = JSON.parse(localStorage.getItem('ecoRouteHistory') || '[]');

function saveHistory() {
  localStorage.setItem('ecoRouteHistory', JSON.stringify(routeHistory));
}

function renderHistory() {
  historyList.innerHTML = '';
  if (routeHistory.length === 0) {
    historyList.innerHTML = '<li>No previous routes found.</li>';
    return;
  }
  routeHistory.slice(-10).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.start}</strong> → <strong>${item.end}</strong> | Mode: ${item.mode} | Carbon: ${item.carbon} kg CO₂ | <span style='color:#388e3c'>${item.date}</span>`;
    historyList.appendChild(li);
  });
}

function addToHistory(start, end, mode, carbon) {
  routeHistory.push({
    start,
    end,
    mode,
    carbon,
    date: new Date().toLocaleString()
  });
  if (routeHistory.length > 50) routeHistory = routeHistory.slice(-50);
  saveHistory();
  renderHistory();
}

routeForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const start = document.getElementById('start').value.trim();
  const end = document.getElementById('end').value.trim();
  const mode = document.getElementById('mode').value;

  if (!start || !end) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:red">Please enter both start and destination.</span>';
    return;
  }

  // Simulate route optimization and carbon calculation
  let route = `${start} → Bus Stop → Train Station → ${end}`;
  let carbon = mode === 'walk' ? 0 : mode === 'bike' ? 0.1 : mode === 'public' ? 0.5 : 1.2;
  let modeText = {
    public: "Public Transport",
    bike: "Bike",
    walk: "Walk",
    carpool: "Carpool"
  };

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <strong>Optimized Route:</strong> ${route}<br>
    <strong>Mode:</strong> ${modeText[mode]}<br>
    <strong>Estimated Carbon Footprint:</strong> ${carbon} kg CO₂
  `;
  addToHistory(start, end, modeText[mode], carbon);
});

clearHistoryBtn.addEventListener('click', function() {
  routeHistory = [];
  saveHistory();
  renderHistory();
});

// Initial render
renderHistory();
