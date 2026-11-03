const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

function addTodo() {
    const text = input.value.trim();
    if (text === '') return;

    const li = document.createElement('li');
    li.className = 'todo-item';
    
    li.innerHTML = `
        <input type="checkbox" class="todo-checkbox">
        <span class="todo-text">${text}</span>
        <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
    `;

    li.querySelector('.todo-checkbox').addEventListener('change', () => {
        li.classList.toggle('completed');
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
        li.remove();
    });

    list.appendChild(li);
    input.value = '';
}

addBtn.addEventListener('click', addTodo);

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});