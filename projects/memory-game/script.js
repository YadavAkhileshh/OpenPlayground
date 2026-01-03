let h3 = document.querySelector("h3");
let btns = document.querySelectorAll(".btn")

let btnList = ["red", "yellow", "blue", "green"];

let gameSeq = [];
let userSeq = [];

start = false;
let level = 0;

document.addEventListener("keydown", (event) => {
    if (event.code == "Space") {
        if (start == false)
            console.log("game started !")
        start = true;
        levelUp();
    }
})

function levelUp() {
    userSeq = [];
    level++;
    h3.innerText = `Level ${level}`

    let randIdx = Math.floor(Math.random() * btnList.length);
    let randColor = btnList[randIdx];
    let randButton = document.querySelector(`.${randColor}`);

    gameSeq.push(randColor);
    console.log(gameSeq);

    gameFlash(randButton);
}

function gameFlash(btns) {
    btns.classList.add("flash");
    setTimeout(() => {
        btns.classList.remove("flash");
    }, 100);
}
function userFlash(btns) {
    btns.classList.add("userFlash");
    setTimeout(() => {
        btns.classList.remove("userFlash");
    }, 100);
}

function btnPress() {
    let btn = this;
    userFlash(btn);

    let userColor = btn.getAttribute("id");
    userSeq.push(userColor);
    console.log(userSeq);

    checkAns(userSeq.length - 1);

}
for (let btn of btns) {
    btn.addEventListener("click", btnPress)
}


function checkAns(idx) {
    console.log("current level: ", level);
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    }
    else {
        h3.innerHTML = `Game Over! Your Score was <b>${level}</b> <br>Press space to start again`;
        document.querySelector("body").style.backgroundColor = "red";
        setTimeout(function () {
            document.querySelector("body").style.backgroundColor = "rgb(38, 38, 38)";
        }, 200)

        resetGame();
    }


}


function resetGame() {
    start = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
}

