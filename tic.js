let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#reset");
let newBtn = document.querySelector("#new");
let msgcontainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let turnO = true;

const winpatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [3, 4, 5],
    [6, 7, 8],
    [2, 4, 6],
    [2, 5, 8],
    [1, 4, 7],
];

const resetgame = () => {
    turnO = true;
    enableboxes();
    msgcontainer.classList.add("hide");
};

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        //console.log("Box was clicked!");
        if (turnO === true) {
            box.innerText = "O";
            turnO = false;
        } else {
            box.innerText = "X";
            turnO = true;
        }
        box.style.pointerEvents = "none"; // Prevent further clicks
        checkWinner();
    });
});                   

const enableboxes = () => {
    for (let box of boxes) {
        box.style.pointerEvents = "auto"; // Fixed: Enable clicking
        box.innerText = "";
    }
};

const disableboxes = () => {
    for (let box of boxes) {
        box.style.pointerEvents = "none"; // Fixed: Disable clicking
    }
};

const showwinner = (winner) => {
    msg.innerText = `Congratulations, winner is ${winner}`; // Fixed string interpolation
    msgcontainer.classList.remove("hide"); // Fixed `classList`
    disableboxes();
};

const checkWinner = () => {
    for (let pattern of winpatterns) {
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if (pos1val !== "" && pos2val !== "" && pos3val !== "") {
            if (pos1val === pos2val && pos2val === pos3val) {
              //  console.log("Winner:", pos1val);
                showwinner(pos1val); // Fixed: Pass winner to function
            }
        }
    }
};

newBtn.addEventListener("click", resetgame); // Fixed event listener
resetbtn.addEventListener("click", resetgame); // Fixed event listener