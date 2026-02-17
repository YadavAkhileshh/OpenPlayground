const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

addBtn.addEventListener("click", addTask);

function addTask(){
    if(input.value.trim() === "") return;

    const li = document.createElement("li");
    li.textContent = input.value;

    li.addEventListener("click", () => {
        li.classList.toggle("completed");
    });

    list.appendChild(li);
    input.value = "";
}
