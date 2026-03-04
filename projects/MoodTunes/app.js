// Mood Tunes Main JavaScript

const moodForm = document.getElementById('moodForm');
const resultDiv = document.getElementById('result');
const playerSection = document.getElementById('playerSection');
const playerDiv = document.getElementById('player');
const historyDiv = document.getElementById('history');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const playlists = {
  happy: [
    { title: 'Happy - Pharrell Williams', url: 'https://www.youtube.com/embed/ZbZSe6N_BXs' },
    { title: 'Can’t Stop The Feeling! - Justin Timberlake', url: 'https://www.youtube.com/embed/ru0K8uYEZWw' },
    { title: 'Best Day Of My Life - American Authors', url: 'https://www.youtube.com/embed/Y66j_BUCBMY' }
  ],
  sad: [
    { title: 'Someone Like You - Adele', url: 'https://www.youtube.com/embed/hLQl3WQQoQ0' },
    { title: 'Let Her Go - Passenger', url: 'https://www.youtube.com/embed/RBumgq5yVrA' },
    { title: 'Fix You - Coldplay', url: 'https://www.youtube.com/embed/k4V3Mo61fJM' }
  ],
  energetic: [
    { title: 'Stronger - Kanye West', url: 'https://www.youtube.com/embed/PsO6ZnUZI0g' },
    { title: 'Titanium - David Guetta ft. Sia', url: 'https://www.youtube.com/embed/9xwazD5SyVg' },
    { title: 'Eye of the Tiger - Survivor', url: 'https://www.youtube.com/embed/btPJPFnesV4' }
  ],
  relaxed: [
    { title: 'Weightless - Marconi Union', url: 'https://www.youtube.com/embed/UfcAVejslrU' },
    { title: 'Sunset Lover - Petit Biscuit', url: 'https://www.youtube.com/embed/4DLo6g7A6aQ' },
    { title: 'Bloom - ODESZA', url: 'https://www.youtube.com/embed/2nPAkL4q9lA' }
  ],
  romantic: [
    { title: 'All of Me - John Legend', url: 'https://www.youtube.com/embed/450p7goxZqg' },
    { title: 'Perfect - Ed Sheeran', url: 'https://www.youtube.com/embed/2Vv-BfVoq4g' },
    { title: 'Just The Way You Are - Bruno Mars', url: 'https://www.youtube.com/embed/LjhCEhWiKXk' }
  ],
  angry: [
    { title: 'In The End - Linkin Park', url: 'https://www.youtube.com/embed/eVTXPUF4Oz4' },
    { title: 'Stronger - Kelly Clarkson', url: 'https://www.youtube.com/embed/Xn676-fLq7I' },
    { title: 'Break Stuff - Limp Bizkit', url: 'https://www.youtube.com/embed/ZpUYjpKg9KY' }
  ],
  nostalgic: [
    { title: 'Summer of 69 - Bryan Adams', url: 'https://www.youtube.com/embed/eFjjO_lhf9c' },
    { title: 'Bohemian Rhapsody - Queen', url: 'https://www.youtube.com/embed/fJ9rUzIMcZQ' },
    { title: 'Take On Me - a-ha', url: 'https://www.youtube.com/embed/djV11Xbc914' }
  ]
};

let playlistHistory = JSON.parse(localStorage.getItem('moodTunesHistory') || '[]');

function saveHistory() {
  localStorage.setItem('moodTunesHistory', JSON.stringify(playlistHistory));
}

function renderHistory() {
  historyList.innerHTML = '';
  if (playlistHistory.length === 0) {
    historyList.innerHTML = '<li>No previous playlists found.</li>';
    return;
  }
  playlistHistory.slice(-10).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.mood}</strong> | <span style='color:#8e24aa'>${item.date}</span><ul>${item.songs.map(song => `<li>${song.title}</li>`).join('')}</ul>`;
    historyList.appendChild(li);
  });
}

function addToHistory(mood, songs) {
  playlistHistory.push({
    mood,
    songs,
    date: new Date().toLocaleString()
  });
  if (playlistHistory.length > 50) playlistHistory = playlistHistory.slice(-50);
  saveHistory();
  renderHistory();
}

moodForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const mood = document.getElementById('mood').value;
  if (!mood || !playlists[mood]) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:red">Please select a valid mood.</span>';
    playerSection.style.display = 'none';
    return;
  }
  const songs = playlists[mood];
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `<strong>Playlist for mood:</strong> ${mood.charAt(0).toUpperCase() + mood.slice(1)}<ul>${songs.map(song => `<li>${song.title}</li>`).join('')}</ul>`;
  playerSection.style.display = 'block';
  playerDiv.innerHTML = `<iframe width="100%" height="315" src="${songs[0].url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  addToHistory(mood, songs);
});

clearHistoryBtn.addEventListener('click', function() {
  playlistHistory = [];
  saveHistory();
  renderHistory();
});

// Initial render
renderHistory();
