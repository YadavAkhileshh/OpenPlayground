const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let centerX = width / 2;
let centerY = height / 2;
let speedMultiplier = 1;
const EVENT_YEAR = 2025;

function nowInEventYear() {
  const n = new Date();
  const dim = new Date(EVENT_YEAR, n.getMonth() + 1, 0).getDate(); // days in that month in EVENT_YEAR
  const day = Math.min(n.getDate(), dim); // clamp (handles Feb 29 etc.)
  return new Date(EVENT_YEAR, n.getMonth(), day, n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds());
}

let simulatedTime = nowInEventYear();
let activeFilter = 'all';
let hoveredEvent = null;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
});

// Ring configurations - ORDERED BY PERIOD (fastest innermost)
const rings = [
  { name: 'Seconds', color: '#ef4444', divisions: 60, radius: 45, thickness: 4, labels: Array.from({length: 60}, (_, i) => i % 10 === 0 ? i.toString() : ''), labelInterval: 10, getValue: (d) => d.getSeconds() + d.getMilliseconds() / 1000, maxValue: 60 },
  { name: 'Minutes', color: '#f59e0b', divisions: 60, radius: 65, thickness: 5, labels: Array.from({length: 60}, (_, i) => i % 10 === 0 ? i.toString() : ''), labelInterval: 10, getValue: (d) => d.getMinutes() + d.getSeconds() / 60, maxValue: 60 },
  { name: 'Hours', color: '#06b6d4', divisions: 24, radius: 88, thickness: 6, labels: Array.from({length: 24}, (_, i) => i % 3 === 0 ? i.toString().padStart(2, '0') : ''), labelInterval: 3, getValue: (d) => d.getHours() + d.getMinutes() / 60, maxValue: 24 },
  { name: 'Day of Week', color: '#10b981', divisions: 7, radius: 115, thickness: 10, labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], labelInterval: 1, getValue: (d) => d.getDay() + d.getHours() / 24, maxValue: 7 },
  { name: 'Week', color: '#8b5cf6', divisions: 52, radius: 145, thickness: 7, labels: Array.from({length: 52}, (_, i) => (i+1) % 4 === 0 ? `${i+1}` : ''), labelInterval: 4, getValue: (d) => getWeekOfYear(d), maxValue: 52 },
  { name: 'Month', color: '#ec4899', divisions: 12, radius: 178, thickness: 12, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], labelInterval: 1, getValue: (d) => d.getMonth() + d.getDate() / getDaysInMonth(d), maxValue: 12 },
  { name: 'Quarter', color: '#3b82f6', divisions: 4, radius: 215, thickness: 10, labels: ['Q1', 'Q2', 'Q3', 'Q4'], labelInterval: 1, getValue: (d) => Math.floor(d.getMonth() / 3) + (d.getMonth() % 3 + d.getDate() / getDaysInMonth(d)) / 3, maxValue: 4 },
  { name: 'Season', color: '#14b8a6', divisions: 4, radius: 248, thickness: 12, labels: ['Winter', 'Spring', 'Summer', 'Autumn'], labelInterval: 1, getValue: (d) => getSeasonValue(d), maxValue: 4, seasonColors: ['#64748b', '#22c55e', '#eab308', '#f97316'] },
  { name: 'Year', color: '#f97316', divisions: 12, radius: 285, thickness: 8, labels: [], labelInterval: 12, getValue: (d) => { const start = new Date(d.getFullYear(), 0, 1); const end = new Date(d.getFullYear() + 1, 0, 1); return ((d - start) / (end - start)) * 12; }, maxValue: 12, showPercentage: true }
];

// Comprehensive 2025 events
const events2025 = [
  // POLITICAL
  { date: new Date(2025, 0, 20), name: "US Presidential Inauguration", desc: "Donald Trump sworn in for second term", icon: 'fa-landmark-dome', type: 'political' },
  { date: new Date(2025, 1, 23), name: "German Federal Election", desc: "Bundestag election following coalition collapse", icon: 'fa-vote-yea', type: 'political' },
  { date: new Date(2025, 4, 1), name: "UK Local Elections", desc: "Local government elections across England", icon: 'fa-vote-yea', type: 'political' },
  { date: new Date(2025, 5, 15), name: "G7 Summit", desc: "Annual summit hosted by Canada", icon: 'fa-globe', type: 'political' },
  { date: new Date(2025, 10, 1), name: "COP30 Climate Summit", desc: "UN Climate Change Conference in Brazil", icon: 'fa-leaf', type: 'political' },
  { date: new Date(2025, 10, 15), name: "G20 Summit", desc: "Leaders summit in South Africa", icon: 'fa-globe', type: 'political' },
  { date: new Date(2025, 10, 20), name: "APEC Summit", desc: "Asia-Pacific Economic Cooperation in South Korea", icon: 'fa-earth-asia', type: 'political' },

  // SPORTS - Tennis
  { date: new Date(2025, 0, 12), name: "Australian Open", desc: "First Grand Slam of the year, Melbourne", icon: 'fa-baseball', type: 'sports' },
  { date: new Date(2025, 4, 25), name: "French Open", desc: "Roland Garros clay court Grand Slam", icon: 'fa-baseball', type: 'sports' },
  { date: new Date(2025, 5, 30), name: "Wimbledon", desc: "The Championships, grass court Grand Slam", icon: 'fa-baseball', type: 'sports' },
  { date: new Date(2025, 7, 25), name: "US Open", desc: "Final Grand Slam, Flushing Meadows", icon: 'fa-baseball', type: 'sports' },

  // SPORTS - Football/Soccer
  { date: new Date(2025, 5, 15), name: "FIFA Club World Cup", desc: "Expanded 32-team tournament in USA", icon: 'fa-futbol', type: 'sports' },
  { date: new Date(2025, 6, 2), name: "UEFA Women's Euro", desc: "European Championship in Switzerland", icon: 'fa-futbol', type: 'sports' },

  // SPORTS - American Football
  { date: new Date(2025, 1, 9), name: "Super Bowl LIX", desc: "NFL Championship in New Orleans", icon: 'fa-football', type: 'sports' },
  { date: new Date(2025, 0, 20), name: "CFP National Championship", desc: "College Football Playoff Final", icon: 'fa-football', type: 'sports' },

  // SPORTS - Golf
  { date: new Date(2025, 3, 10), name: "The Masters", desc: "First golf major at Augusta National", icon: 'fa-golf-ball-tee', type: 'sports' },
  { date: new Date(2025, 4, 15), name: "PGA Championship", desc: "Second golf major of the year", icon: 'fa-golf-ball-tee', type: 'sports' },
  { date: new Date(2025, 5, 12), name: "US Open Golf", desc: "Third golf major", icon: 'fa-golf-ball-tee', type: 'sports' },
  { date: new Date(2025, 6, 17), name: "The Open Championship", desc: "British Open at Royal Portrush", icon: 'fa-golf-ball-tee', type: 'sports' },
  { date: new Date(2025, 8, 26), name: "Ryder Cup", desc: "USA vs Europe at Bethpage Black, NY", icon: 'fa-golf-ball-tee', type: 'sports' },

  // SPORTS - Motorsport
  { date: new Date(2025, 2, 16), name: "F1 Season Opener", desc: "Australian Grand Prix, Melbourne", icon: 'fa-flag-checkered', type: 'sports' },
  { date: new Date(2025, 4, 25), name: "Monaco Grand Prix", desc: "Most prestigious F1 race", icon: 'fa-flag-checkered', type: 'sports' },
  { date: new Date(2025, 4, 25), name: "Indianapolis 500", desc: "Greatest Spectacle in Racing", icon: 'fa-flag-checkered', type: 'sports' },
  { date: new Date(2025, 5, 14), name: "24 Hours of Le Mans", desc: "World's oldest sports car endurance race", icon: 'fa-flag-checkered', type: 'sports' },
  { date: new Date(2025, 0, 3), name: "Dakar Rally", desc: "World's toughest rally raid in Saudi Arabia", icon: 'fa-flag-checkered', type: 'sports' },

  // SPORTS - Athletics
  { date: new Date(2025, 2, 21), name: "World Indoor Athletics", desc: "World Championships in Nanjing, China", icon: 'fa-person-running', type: 'sports' },
  { date: new Date(2025, 8, 13), name: "World Athletics Championships", desc: "Outdoor Championships in Tokyo", icon: 'fa-person-running', type: 'sports' },

  // SPORTS - Cycling
  { date: new Date(2025, 6, 5), name: "Tour de France", desc: "World's most famous cycling race", icon: 'fa-bicycle', type: 'sports' },
  { date: new Date(2025, 4, 9), name: "Giro d'Italia", desc: "Italian Grand Tour cycling race", icon: 'fa-bicycle', type: 'sports' },
  { date: new Date(2025, 7, 23), name: "Vuelta a España", desc: "Spanish Grand Tour cycling race", icon: 'fa-bicycle', type: 'sports' },

  // SPORTS - Rugby & Cricket
  { date: new Date(2025, 0, 31), name: "Six Nations Rugby", desc: "Annual European rugby championship", icon: 'fa-football', type: 'sports' },
  { date: new Date(2025, 7, 22), name: "Women's Rugby World Cup", desc: "Tournament in England", icon: 'fa-football', type: 'sports' },
  { date: new Date(2025, 5, 26), name: "ICC World Test Final", desc: "Cricket championship at Lord's", icon: 'fa-baseball', type: 'sports' },
  { date: new Date(2025, 8, 1), name: "Women's Cricket World Cup", desc: "Tournament in India", icon: 'fa-baseball', type: 'sports' },

  // SPORTS - Other
  { date: new Date(2025, 0, 14), name: "World Handball Championship", desc: "Men's tournament in Croatia/Denmark/Norway", icon: 'fa-volleyball', type: 'sports' },
  { date: new Date(2025, 1, 16), name: "NBA All-Star Game", desc: "Annual basketball showcase", icon: 'fa-basketball', type: 'sports' },
  { date: new Date(2025, 6, 11), name: "World Aquatics Championships", desc: "Swimming & diving in Singapore", icon: 'fa-person-swimming', type: 'sports' },

  // ENTERTAINMENT - Awards
  { date: new Date(2025, 0, 5), name: "Golden Globes", desc: "82nd Golden Globe Awards", icon: 'fa-trophy', type: 'entertainment' },
  { date: new Date(2025, 0, 19), name: "SAG Awards", desc: "Screen Actors Guild Awards", icon: 'fa-trophy', type: 'entertainment' },
  { date: new Date(2025, 1, 2), name: "Grammy Awards", desc: "67th Annual Grammy Awards", icon: 'fa-music', type: 'entertainment' },
  { date: new Date(2025, 1, 16), name: "BAFTA Film Awards", desc: "British Academy Film Awards", icon: 'fa-trophy', type: 'entertainment' },
  { date: new Date(2025, 2, 2), name: "Academy Awards", desc: "97th Oscars ceremony", icon: 'fa-star', type: 'entertainment' },
  { date: new Date(2025, 8, 21), name: "Emmy Awards", desc: "77th Primetime Emmy Awards", icon: 'fa-tv', type: 'entertainment' },

  // ENTERTAINMENT - Festivals
  { date: new Date(2025, 1, 6), name: "Berlin Film Festival", desc: "75th Berlinale international film festival", icon: 'fa-film', type: 'entertainment' },
  { date: new Date(2025, 3, 11), name: "Coachella Weekend 1", desc: "Major music festival in California", icon: 'fa-music', type: 'entertainment' },
  { date: new Date(2025, 4, 10), name: "Eurovision", desc: "Song Contest in Basel, Switzerland", icon: 'fa-microphone', type: 'entertainment' },
  { date: new Date(2025, 4, 13), name: "Cannes Film Festival", desc: "78th Festival de Cannes", icon: 'fa-film', type: 'entertainment' },
  { date: new Date(2025, 5, 25), name: "Glastonbury Festival", desc: "Iconic UK music festival", icon: 'fa-music', type: 'entertainment' },
  { date: new Date(2025, 7, 27), name: "Venice Film Festival", desc: "82nd Venice International Film Festival", icon: 'fa-film', type: 'entertainment' },
  { date: new Date(2025, 8, 4), name: "Toronto Film Festival", desc: "TIFF 2025", icon: 'fa-film', type: 'entertainment' },

  // ENTERTAINMENT - Tech
  { date: new Date(2025, 0, 7), name: "CES 2025", desc: "Consumer Electronics Show, Las Vegas", icon: 'fa-microchip', type: 'entertainment' },
  { date: new Date(2025, 1, 24), name: "MWC Barcelona", desc: "Mobile World Congress", icon: 'fa-mobile', type: 'entertainment' },
  { date: new Date(2025, 5, 9), name: "Apple WWDC", desc: "Worldwide Developers Conference", icon: 'fa-apple', type: 'entertainment' },

  // CULTURAL & HOLIDAYS
  { date: new Date(2025, 0, 1), name: "New Year's Day", desc: "Start of 2025", icon: 'fa-champagne-glasses', type: 'cultural' },
  { date: new Date(2025, 0, 29), name: "Chinese New Year", desc: "Year of the Snake begins", icon: 'fa-dragon', type: 'cultural' },
  { date: new Date(2025, 1, 14), name: "Valentine's Day", desc: "Day of love and romance", icon: 'fa-heart', type: 'cultural' },
  { date: new Date(2025, 1, 28), name: "Losar", desc: "Tibetan New Year", icon: 'fa-moon', type: 'cultural' },
  { date: new Date(2025, 2, 1), name: "Mardi Gras", desc: "Fat Tuesday celebrations", icon: 'fa-mask', type: 'cultural' },
  { date: new Date(2025, 2, 14), name: "Holi", desc: "Hindu festival of colors", icon: 'fa-palette', type: 'cultural' },
  { date: new Date(2025, 2, 17), name: "St. Patrick's Day", desc: "Irish cultural celebration", icon: 'fa-clover', type: 'cultural' },
  { date: new Date(2025, 2, 29), name: "Ramadan Begins", desc: "Islamic holy month of fasting", icon: 'fa-moon', type: 'cultural' },
  { date: new Date(2025, 3, 18), name: "Good Friday", desc: "Christian observance", icon: 'fa-cross', type: 'cultural' },
  { date: new Date(2025, 3, 20), name: "Easter Sunday", desc: "Christian celebration of resurrection", icon: 'fa-egg', type: 'cultural' },
  { date: new Date(2025, 3, 22), name: "Earth Day", desc: "Environmental awareness day", icon: 'fa-earth-americas', type: 'cultural' },
  { date: new Date(2025, 3, 27), name: "Eid al-Fitr", desc: "End of Ramadan celebration", icon: 'fa-moon', type: 'cultural' },
  { date: new Date(2025, 4, 1), name: "International Workers' Day", desc: "Labor Day in many countries", icon: 'fa-briefcase', type: 'cultural' },
  { date: new Date(2025, 4, 11), name: "Mother's Day (US)", desc: "Celebrating mothers", icon: 'fa-heart', type: 'cultural' },
  { date: new Date(2025, 4, 26), name: "Memorial Day (US)", desc: "Honoring fallen military", icon: 'fa-flag-usa', type: 'cultural' },
  { date: new Date(2025, 5, 15), name: "Father's Day (US)", desc: "Celebrating fathers", icon: 'fa-user', type: 'cultural' },
  { date: new Date(2025, 6, 4), name: "US Independence Day", desc: "Fourth of July celebrations", icon: 'fa-flag-usa', type: 'cultural' },
  { date: new Date(2025, 6, 5), name: "Eid al-Adha", desc: "Islamic Festival of Sacrifice", icon: 'fa-moon', type: 'cultural' },
  { date: new Date(2025, 8, 1), name: "Labor Day (US)", desc: "End of summer holiday", icon: 'fa-briefcase', type: 'cultural' },
  { date: new Date(2025, 8, 22), name: "Rosh Hashanah", desc: "Jewish New Year", icon: 'fa-star-of-david', type: 'cultural' },
  { date: new Date(2025, 9, 1), name: "Yom Kippur", desc: "Jewish Day of Atonement", icon: 'fa-star-of-david', type: 'cultural' },
  { date: new Date(2025, 9, 13), name: "Diwali", desc: "Hindu festival of lights", icon: 'fa-fire', type: 'cultural' },
  { date: new Date(2025, 9, 31), name: "Halloween", desc: "Spooky celebrations", icon: 'fa-ghost', type: 'cultural' },
  { date: new Date(2025, 10, 11), name: "Veterans Day", desc: "Honoring military veterans", icon: 'fa-medal', type: 'cultural' },
  { date: new Date(2025, 10, 27), name: "Thanksgiving (US)", desc: "American harvest celebration", icon: 'fa-utensils', type: 'cultural' },
  { date: new Date(2025, 11, 14), name: "Hanukkah Begins", desc: "Jewish Festival of Lights", icon: 'fa-menorah', type: 'cultural' },
  { date: new Date(2025, 11, 25), name: "Christmas Day", desc: "Christian celebration", icon: 'fa-gift', type: 'cultural' },
  { date: new Date(2025, 11, 26), name: "Kwanzaa Begins", desc: "African American celebration", icon: 'fa-candle-holder', type: 'cultural' },
  { date: new Date(2025, 11, 31), name: "New Year's Eve", desc: "End of 2025", icon: 'fa-champagne-glasses', type: 'cultural' },

  // ASTRONOMICAL
  { date: new Date(2025, 2, 14), name: "Total Lunar Eclipse", desc: "Visible from Americas, Europe, Africa", icon: 'fa-moon', type: 'astronomical' },
  { date: new Date(2025, 2, 20), name: "Spring Equinox", desc: "Day and night equal length", icon: 'fa-sun', type: 'astronomical' },
  { date: new Date(2025, 2, 29), name: "Partial Solar Eclipse", desc: "Visible from Europe, N. Africa, Russia", icon: 'fa-sun', type: 'astronomical' },
  { date: new Date(2025, 5, 21), name: "Summer Solstice", desc: "Longest day in Northern Hemisphere", icon: 'fa-sun', type: 'astronomical' },
  { date: new Date(2025, 8, 7), name: "Total Lunar Eclipse", desc: "Visible from Europe, Africa, Asia", icon: 'fa-moon', type: 'astronomical' },
  { date: new Date(2025, 8, 21), name: "Partial Solar Eclipse", desc: "Visible from Pacific, Antarctica", icon: 'fa-sun', type: 'astronomical' },
  { date: new Date(2025, 8, 22), name: "Autumn Equinox", desc: "Day and night equal length", icon: 'fa-leaf', type: 'astronomical' },
  { date: new Date(2025, 11, 21), name: "Winter Solstice", desc: "Shortest day in Northern Hemisphere", icon: 'fa-snowflake', type: 'astronomical' }
];

events2025.sort((a, b) => a.date - b.date);

// Helper functions
function getWeekOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek) + (date.getDay() + date.getHours() / 24) / 7;
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getSeasonValue(date) {
  const month = date.getMonth();
  const day = date.getDate();
  // Winter: Dec 21 - Mar 19, Spring: Mar 20 - Jun 20, Summer: Jun 21 - Sep 21, Autumn: Sep 22 - Dec 20
  if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
    if (month === 11) return (day - 21) / 31 * 0.25;
    if (month === 0) return 0.25 + day / 31 * 0.25;
    if (month === 1) return 0.5 + day / 28 * 0.25;
    return 0.75 + day / 20 * 0.25;
  } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
    if (month === 2) return 1 + (day - 20) / 12 * 0.25;
    if (month === 3) return 1.25 + day / 30 * 0.25;
    if (month === 4) return 1.5 + day / 31 * 0.25;
    return 1.75 + day / 21 * 0.25;
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
    if (month === 5) return 2 + (day - 21) / 10 * 0.25;
    if (month === 6) return 2.25 + day / 31 * 0.25;
    if (month === 7) return 2.5 + day / 31 * 0.25;
    return 2.75 + day / 22 * 0.25;
  } else {
    if (month === 8) return 3 + (day - 22) / 9 * 0.25;
    if (month === 9) return 3.25 + day / 31 * 0.25;
    if (month === 10) return 3.5 + day / 30 * 0.25;
    return 3.75 + day / 21 * 0.25;
  }
}

function drawRing(ring, value) {
  const { radius, thickness, divisions, color, labels, labelInterval, seasonColors, showPercentage } = ring;
  const baseRadius = Math.min(width, height) * 0.42 * (radius / 285);

  // Draw ring segments - ONLY color up to current value
  for (let i = 0; i < divisions; i++) {
    const startAngle = (i / divisions) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((i + 1) / divisions) * Math.PI * 2 - Math.PI / 2;

    let segmentColor = color;
    if (seasonColors) segmentColor = seasonColors[i];

    // Determine if this segment should be colored (before current position)
    const segmentMidpoint = i + 0.5;
    const isBeforeCurrent = segmentMidpoint < value;
    const isCurrent = value >= i && value < i + 1;

    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, startAngle, endAngle);

    // Only color segments that are BEFORE the current position
    if (isBeforeCurrent) {
      ctx.strokeStyle = segmentColor;
    } else if (isCurrent) {
      // Partial coloring for current segment
      const partialEnd = startAngle + ((value - i) / 1) * (endAngle - startAngle);
      ctx.strokeStyle = `${segmentColor}33`; // dim background
      ctx.lineWidth = thickness;
      ctx.stroke();

      // Draw the colored portion
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, startAngle, partialEnd);
      ctx.strokeStyle = segmentColor;
    } else {
      ctx.strokeStyle = `${segmentColor}22`; // very dim for future
    }

    ctx.lineWidth = isCurrent ? thickness * 1.1 : thickness;
    ctx.lineCap = 'butt';
    ctx.stroke();
  }

  // Draw labels
  if (labels.some(l => l)) {
    ctx.font = `400 ${Math.max(6, thickness * 0.45)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < divisions; i++) {
      if (i % labelInterval === 0 && labels[i]) {
        const angle = ((i + 0.5) / divisions) * Math.PI * 2 - Math.PI / 2;
        const labelRadius = baseRadius + thickness / 2 + 10;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;

        ctx.save();
        ctx.translate(x, y);
        let textAngle = angle + Math.PI / 2;
        if (angle > 0 && angle < Math.PI) textAngle += Math.PI;
        ctx.rotate(textAngle);

        ctx.fillStyle = value >= i && value < i + 1 ? '#fff' : 'rgba(255,255,255,0.25)';
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();
      }
    }
  }

  // Current position indicator
  const indicatorAngle = (value / ring.maxValue) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.arc(
    centerX + Math.cos(indicatorAngle) * baseRadius,
    centerY + Math.sin(indicatorAngle) * baseRadius,
    thickness / 2 + 1, 0, Math.PI * 2
  );
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Year progress percentage
  if (showPercentage) {
    const percentage = Math.round((value / ring.maxValue) * 100);
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(`${percentage}%`, centerX, centerY + baseRadius + thickness + 16);
  }
}

function drawCenter() {
  const hubRadius = Math.min(width, height) * 0.024;

  ctx.beginPath();
  ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '500 11px Inter, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(simulatedTime.getFullYear(), centerX, centerY);
}

const eventPositions = [];

function drawEventMarkers() {
  eventPositions.length = 0;
  const monthRing = rings.find(r => r.name === 'Month');
  const baseRadius = Math.min(width, height) * 0.42 * (monthRing.radius / 285);

  const typeColors = {
    political: '#ef4444',
    sports: '#22c55e',
    entertainment: '#f59e0b',
    cultural: '#ec4899',
    astronomical: '#3b82f6'
  };

  const filteredEvents = activeFilter === 'all'
    ? events2025
    : events2025.filter(e => e.type === activeFilter);

  filteredEvents.forEach(event => {
    if (event.date.getFullYear() !== simulatedTime.getFullYear()) return;

    const month = event.date.getMonth();
    const day = event.date.getDate();
    const daysInMonth = new Date(event.date.getFullYear(), month + 1, 0).getDate();
    const value = month + day / daysInMonth;

    const angle = (value / 12) * Math.PI * 2 - Math.PI / 2;
    const markerRadius = baseRadius + monthRing.thickness / 2 + 22;

    const x = centerX + Math.cos(angle) * markerRadius;
    const y = centerY + Math.sin(angle) * markerRadius;

    // Store position for hover detection
    eventPositions.push({ x, y, event, radius: 4 });

    const isPast = event.date < simulatedTime;
    const color = typeColors[event.type] || '#888';

    // Draw marker
    ctx.beginPath();
    ctx.arc(x, y, isPast ? 2 : 3, 0, Math.PI * 2);
    ctx.fillStyle = isPast ? `${color}66` : color;
    ctx.fill();

    // Line to ring
    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * (baseRadius + monthRing.thickness / 2 + 2),
      centerY + Math.sin(angle) * (baseRadius + monthRing.thickness / 2 + 2)
    );
    ctx.lineTo(x, y);
    ctx.strokeStyle = `${color}${isPast ? '33' : '44'}`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function updateEventsList() {
  const eventsList = document.getElementById('events-list');
  const now = simulatedTime;

  const filteredEvents = activeFilter === 'all'
    ? events2025
    : events2025.filter(e => e.type === activeFilter);

  const upcoming = filteredEvents.filter(e => e.date >= now);

  const typeColors = {
    political: 'event-type-political',
    sports: 'event-type-sports',
    entertainment: 'event-type-entertainment',
    cultural: 'event-type-cultural',
    astronomical: 'event-type-astronomical'
  };

  let html = '';
  upcoming.slice(0, 15).forEach(event => {
    const daysUntil = Math.ceil((event.date - now) / (1000 * 60 * 60 * 24));
    const dateStr = event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    html += `
      <div class="event-item">
        <div class="event-date"><i class="fa-solid ${event.icon} event-icon ${typeColors[event.type]}"></i>${dateStr}</div>
        <div class="event-name">${event.name}</div>
        <div class="event-days">${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}</div>
      </div>
    `;
  });

  if (upcoming.length === 0) {
    html = '<div class="event-item"><div class="event-name" style="color:#555">No upcoming events in this category</div></div>';
  }

  eventsList.innerHTML = html;
}

function updateTimeDisplay() {
  document.getElementById('current-time').textContent = simulatedTime.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('current-date').textContent = simulatedTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Subtle grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
  for (let x = 50; x < width; x += 50) {
    for (let y = 50; y < height; y += 50) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw rings (outer to inner)
  for (let i = rings.length - 1; i >= 0; i--) {
    drawRing(rings[i], rings[i].getValue(simulatedTime));
  }

  drawEventMarkers();
  drawCenter();

if (speedMultiplier === 1) {
  // real clock pace, but anchored to EVENT_YEAR so 2025 events actually exist
  simulatedTime = nowInEventYear();
} else {
  // simulated fast-forward
  simulatedTime = new Date(simulatedTime.getTime() + 16 * speedMultiplier);
}

  updateTimeDisplay();
  requestAnimationFrame(draw);
}

// Event handlers
updateEventsList();
setInterval(updateEventsList, 60000);

document.querySelectorAll('.control-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    speedMultiplier = parseInt(btn.dataset.speed);
    if (speedMultiplier === 1) simulatedTime = new Date();
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    updateEventsList();
  });
});

// Mouse interaction for tooltips
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check event markers first
  let foundEvent = null;
  for (const pos of eventPositions) {
    const dx = x - pos.x;
    const dy = y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      foundEvent = pos.event;
      break;
    }
  }

  if (foundEvent) {
    const daysUntil = Math.ceil((foundEvent.date - simulatedTime) / (1000 * 60 * 60 * 24));
    const dateStr = foundEvent.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const typeColors = { political: '#ef4444', sports: '#22c55e', entertainment: '#f59e0b', cultural: '#ec4899', astronomical: '#3b82f6' };

    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY + 12) + 'px';
    tooltip.innerHTML = `
      <h3 style="color:${typeColors[foundEvent.type]}">${foundEvent.name}</h3>
      <div class="event-tooltip-date">${dateStr}</div>
      <div class="detail">${foundEvent.desc}</div>
      <div class="detail" style="margin-top:4px;color:#666">${daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : daysUntil === 0 ? 'Today' : `In ${daysUntil} days`}</div>
    `;
    canvas.style.cursor = 'pointer';
    return;
  }

  // Check rings
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let hoveredRing = null;
  for (const ring of rings) {
    const baseRadius = Math.min(width, height) * 0.42 * (ring.radius / 285);
    if (Math.abs(distance - baseRadius) < ring.thickness) {
      hoveredRing = ring;
      break;
    }
  }

  if (hoveredRing) {
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
    const segmentIndex = Math.floor((normalizedAngle / (Math.PI * 2)) * hoveredRing.divisions);
    const label = hoveredRing.fullLabels ? hoveredRing.fullLabels[segmentIndex] : hoveredRing.labels[segmentIndex];

    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY + 12) + 'px';
    tooltip.innerHTML = `
      <h3>${hoveredRing.name}</h3>
      <div class="detail">${label || `Segment ${segmentIndex + 1}`}</div>
      <div class="detail" style="color:${hoveredRing.color}">${segmentIndex + 1} of ${hoveredRing.divisions}</div>
    `;
    canvas.style.cursor = 'default';
  } else {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
  canvas.style.cursor = 'default';
});

draw();