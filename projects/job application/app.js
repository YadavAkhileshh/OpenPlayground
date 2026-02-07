const form = document.getElementById('job-form');
const listEl = document.getElementById('list');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const exportBtn = document.getElementById('export');
const clearBtn = document.getElementById('clear');
const resetBtn = document.getElementById('reset-form');

let items = JSON.parse(localStorage.getItem('jobApps') || '[]');
let editingIndex = -1;

function save() {
  localStorage.setItem('jobApps', JSON.stringify(items));
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const status = filterSelect.value;
  listEl.innerHTML = '';
  items
    .filter(i => (status === 'all' ? true : i.status === status))
    .filter(i => !q || i.company.toLowerCase().includes(q) || i.role.toLowerCase().includes(q))
    .forEach((it, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `
            <div class="meta">
              <div class="title">${escapeHTML(it.company)} — <span class="role">${escapeHTML(it.role)}</span></div>
              <div class="date">${it.date || ''} · <span class="status ${escapeHTML(it.status)}">${it.status}</span></div>
            </div>
        <div class="notes">${escapeHTML(it.notes || '')}</div>
        <div class="item-actions">
          <button class="action-btn edit-btn">Edit</button>
          <button class="action-btn delete-btn">Delete</button>
        </div>
      `;

      li.querySelector('.edit-btn').addEventListener('click', () => startEdit(idx));
      li.querySelector('.delete-btn').addEventListener('click', () => removeItem(idx));
      listEl.appendChild(li);
    });
}

function escapeHTML(s){
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function startEdit(i){
  const it = items[i];
  document.getElementById('company').value = it.company;
  document.getElementById('role').value = it.role;
  document.getElementById('date').value = it.date || '';
  document.getElementById('status').value = it.status;
  document.getElementById('notes').value = it.notes || '';
  editingIndex = i;
}

function removeItem(i){
  if(!confirm('Delete this entry?')) return;
  items.splice(i,1);
  save();
  render();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const company = document.getElementById('company').value.trim();
  const role = document.getElementById('role').value.trim();
  const date = document.getElementById('date').value;
  const status = document.getElementById('status').value;
  const notes = document.getElementById('notes').value.trim();
  if(!company || !role) return;
  const entry = { company, role, date, status, notes };
  if(editingIndex > -1){
    items[editingIndex] = entry;
    editingIndex = -1;
  } else items.push(entry);
  form.reset();
  save();
  render();
});

resetBtn.addEventListener('click', () => { form.reset(); editingIndex = -1; });
searchInput.addEventListener('input', render);
filterSelect.addEventListener('change', render);

exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(items, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'job-applications.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', () => {
  if(!confirm('Clear all saved applications?')) return;
  items = [];
  save();
  render();
});

render();
