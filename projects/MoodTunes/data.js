async function fetchSongsByMood(mood) {
  const url = `https://itunes.apple.com/search?term=${mood}&media=music&limit=8`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results;
}
