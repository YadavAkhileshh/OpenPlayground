async function simulateGrowth() {
  const niche = document.getElementById("niche").value;
  const videos = Number(document.getElementById("videos").value);
  const quality = Number(document.getElementById("quality").value);

  const response = await fetch("data.json");
  const data = await response.json();

  const baseViews = data[niche].baseViews;

  const views = Math.floor(baseViews * videos * (quality / 5));
  const subscribers = Math.floor(views * 0.04);
  const watchTime = Math.floor(views * 0.08);

  document.getElementById("subs").innerText = subscribers;
  document.getElementById("views").innerText = views;
  document.getElementById("watch").innerText = watchTime;
}
