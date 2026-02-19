function shortenUrl() {
  const longUrl = document.getElementById("longUrl").value;
  const resultDiv = document.getElementById("result");
  const shortUrlInput = document.getElementById("shortUrl");

  if (longUrl.trim() === "") {
    alert("Please enter a valid URL");
    return;
  }

  const randomString = Math.random().toString(36).substring(2, 8);
  const shortUrl = `https://short.ly/${randomString}`;

  shortUrlInput.value = shortUrl;
  resultDiv.classList.remove("hidden");
}

function copyUrl() {
  const shortUrlInput = document.getElementById("shortUrl");
  shortUrlInput.select();
  document.execCommand("copy");
  alert("Short URL copied!");
}