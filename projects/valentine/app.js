const noBtn = document.getElementById("noBtn");
const card = document.querySelector(".card");

function randomMove() {
  const maxX = card.clientWidth - noBtn.offsetWidth;
  const maxY = card.clientHeight - noBtn.offsetHeight;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

setInterval(randomMove, 700);

function yesClick() {
  document.body.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      height:100vh;
      background:#ff9a9e;
      color:white;
      text-align:center;
      padding:20px;
    ">
      <h1>💖 Yayyy yourname! I knew it 😍💖</h1>
      <img
        src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"
        style="width:250px; margin-top:20px; border-radius:20px;"
      >
    </div>
  `;
}
