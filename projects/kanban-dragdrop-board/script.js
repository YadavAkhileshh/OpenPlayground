const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const columns = document.querySelectorAll(".task-list");

let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

function saveTasks(){
    localStorage.setItem("kanbanTasks",JSON.stringify(tasks));
}

function updateCounts(){
    document.getElementById("todoCount").textContent =
        tasks.filter(t=>t.status==="todo").length;
    document.getElementById("progressCount").textContent =
        tasks.filter(t=>t.status==="progress").length;
    document.getElementById("doneCount").textContent =
        tasks.filter(t=>t.status==="done").length;
}

function createTaskElement(task){
    const div = document.createElement("div");
    div.classList.add("task");
    div.draggable = true;
    div.dataset.id = task.id;
    div.innerHTML = `
        <span>${task.text}</span>
        <button>X</button>
    `;

    div.querySelector("button").onclick = ()=>{
        tasks = tasks.filter(t=>t.id !== task.id);
        saveTasks();
        render();
    };

    div.addEventListener("dragstart",(e)=>{
        e.dataTransfer.setData("text/plain",task.id);
    });

    return div;
}

function render(){
    columns.forEach(col=>col.innerHTML="");

    tasks.forEach(task=>{
        const el = createTaskElement(task);
        document.getElementById(task.status).appendChild(el);
    });

    updateCounts();
}

addBtn.addEventListener("click",()=>{
    if(input.value.trim()==="") return;

    const newTask = {
        id: Date.now().toString(),
        text: input.value,
        status:"todo"
    };

    tasks.push(newTask);
    input.value="";
    saveTasks();
    render();
});

columns.forEach(column=>{
    column.addEventListener("dragover",(e)=>e.preventDefault());

    column.addEventListener("drop",(e)=>{
        const id = e.dataTransfer.getData("text/plain");
        const task = tasks.find(t=>t.id===id);
        task.status = column.id;
        saveTasks();
        render();
    });
});

render();
