const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const openAddModal = document.getElementById('openAddModal');
const closeModal = document.getElementById('closeModal');
const addModal = document.getElementById('addModal');

openAddModal.addEventListener('click', () => {
    addModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    addModal.classList.add('hidden');
});
addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        addModal.classList.add('hidden');
    }
});


let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        const priority = todo.priority || 'low';
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${priority}`;
        li.innerHTML = `
                <div>
                    <span class="todo-text">${todo.text}</span>
                    ${todo.dueDate ? `<small>Due: ${todo.dueDate}</small>` : ''}
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" onclick="toggleComplete(${index})">
                        <i class="ri-check-line"></i>
                    </button>
                    <button class="edit-btn" onclick="editTask(${index})">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${index})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
        `;


        todoList.appendChild(li);

    });
    updateProgress();

}

function addTodo() {
    const text = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (text) {
        todos.push({
            text,
            completed: false,
            dueDate,
            priority
        });

        todoInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';

        saveTodos();
        renderTodos();
    }
    addModal.classList.add('hidden');

}
function editTask(index) {
    const todo = todos[index];
    const newText = prompt("Edit task title:", todo.text);
    const newDueDate = prompt("Edit due date (YYYY-MM-DD):", todo.dueDate || '');
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
    }
    if (newDueDate !== null) {
        todo.dueDate = newDueDate.trim() || null;
    }
    saveTodos();
    renderTodos();
}
function addComment(taskId) {
    let comment = prompt("Enter your comment:");
    if (comment) {
        let commentDiv = document.createElement("p");
        commentDiv.textContent = comment;
        document.getElementById("comments-" + taskId).appendChild(commentDiv);
        saveTodos();
    }
}






function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();

}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();

}


renderTodos();

function updateProgress() {
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    progressBar.style.width = percent + '%';
    progressText.textContent = `${completed} / ${total} tasks completed`;
}
