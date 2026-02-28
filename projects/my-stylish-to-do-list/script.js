const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const completedList = document.getElementById('completedList');
const tasksSection = document.getElementById('tasksSection');
const completedTasksSection = document.getElementById('completedTasksSection');
const addTaskButton = document.getElementById('addTaskButton');
const clearButton = document.getElementById('clear');

//button events here---
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});
clearButton.addEventListener('click', clearCompletedTasks);


function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <span>${taskText}</span>
            <span class="task-date">${getCurrentDate()}</span>
        `;
        taskList.appendChild(li);
        taskInput.value = '';
        tasksSection.style.display = 'block';
        li.querySelector('.task-checkbox').addEventListener('change', moveToCompleted);
    }

    
    
}

function moveToCompleted(event) {
    const task = event.target.parentElement;
    taskList.removeChild(task);
    completedList.appendChild(task);
    completedTasksSection.style.display = 'block';
    if (taskList.children.length > 0) {
        tasksSection.style.display = 'block';
    } else {
        tasksSection.style.display = 'none';
    }
}

function clearCompletedTasks() {
    const completedTasks = document.querySelectorAll('.task-checkbox:checked');
    completedTasks.forEach(task => {
        const li = task.closest('li');
        li.remove();
    });
    if (completedList.children.length === 0) {
        completedTasksSection.style.display = 'none';
    }
}


function getCurrentDate() {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}
