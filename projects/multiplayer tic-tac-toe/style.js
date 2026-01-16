const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

let room = "";
let mySymbol = "";
let game = null;

function joinRoom(){
    room = document.getElementById("roomCode").value.trim();
    if(!room) return;

    let data = localStorage.getItem(room);

    if(!data){
        // First player
        game = {
            players: 1,
            board: Array(9).fill(""),
            turn: "X"
        };
        mySymbol = "X";
        localStorage.setItem(room, JSON.stringify(game));
    } else {
        game = JSON.parse(data);
        if(game.players >= 2){
            alert("Room full!");
            return;
        }
        game.players = 2;
        mySymbol = "O";
        localStorage.setItem(room, JSON.stringify(game));
    }

    updateUI();
    statusText.textContent = `You are Player ${mySymbol}`;
}

cells.forEach(cell=>{
    cell.addEventListener("click",()=>{
        if(!room || !game) return;

        const i = cell.dataset.i;
        if(game.board[i] || game.turn !== mySymbol) return;

        game.board[i] = mySymbol;
        game.turn = mySymbol === "X" ? "O" : "X";

        localStorage.setItem(room, JSON.stringify(game));
        updateUI();
    });
});

window.addEventListener("storage",(e)=>{
    if(e.key === room){
        game = JSON.parse(e.newValue);
        updateUI();
    }
});

function updateUI(){
    cells.forEach((cell,i)=>{
        cell.textContent = game.board[i];
    });

    statusText.textContent =
        game.turn === mySymbol ? "Your Turn" : "Opponent's Turn";
}
