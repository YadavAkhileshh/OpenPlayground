let playlistSongs = [];
let currentMood = "happy";
let currentIndex = 0;

async function loadPlaylist(mood) {
  document.getElementById("playlist-title").innerText =
    mood.toUpperCase() + " Playlist 🎶";

  const songList = document.getElementById("song-list");
  songList.innerHTML = "<li>Loading songs...</li>";

  playlistSongs = await fetchSongsByMood(mood);

  songList.innerHTML = "";

  playlistSongs.forEach((song, index) => {
    const li = document.createElement("li");

    li.innerText = `${song.trackName} - ${song.artistName}`;

    li.onclick = () => {
      currentIndex = index;
      playSong(index);
    };

    songList.appendChild(li);
  });
}
