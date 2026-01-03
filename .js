let userscore = 0;
let compscore = 0;

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");
const userscorepara = document.querySelector("#user-score");
const compscorepara = document.querySelector("#comp-score");

const gencompchoice = () => {
    const options = ["rock", "paper", "scissors"];
    const randIdx = Math.floor(Math.random() * 3);
    return options[randIdx];
};

const drawgame = () => {
    console.log("Game was draw.");
    msg.innerText = "Game was draw. Play Again";
    msg.style.backgroundColor = "lightyellow";
    msg.style.color = "black";
};

const showwinner = (userwin, userchoice, compchoice) => {
    if (userwin) {
        userscore++; // Increment user score
        msg.innerText = `You win! Your ${userchoice} beats ${compchoice}`;
        msg.style.backgroundColor = "green";
        msg.style.color = "white";
    } else {
        compscore++; // Increment computer score
        msg.innerText = `You lose. ${compchoice} beats your ${userchoice}`;
        msg.style.backgroundColor = "red";
        msg.style.color = "white";
    }

    // Update scores in the UI
    userscorepara.innerText = userscore;
    compscorepara.innerText = compscore;
};

const playgame = (userchoice) => {
    console.log("User choice = ", userchoice);
    const compchoice = gencompchoice();
    console.log("Comp choice = ", compchoice);

    if (userchoice === compchoice) {
        drawgame();
    } else {
        let userwin = true;
        if (userchoice === "rock") {
            userwin = compchoice === "paper" ? false : true;
        } else if (userchoice === "paper") {
            userwin = compchoice === "scissors" ? false : true;
        } else {
            userwin = compchoice === "rock" ? false : true;
        }
        showwinner(userwin, userchoice, compchoice); // Pass values
    }
};

choices.forEach((choice) => {
    choice.addEventListener("click", () => {
        const userchoice = choice.getAttribute("id");
        playgame(userchoice);
    });
});