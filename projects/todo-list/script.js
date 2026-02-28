/* =========================
   THEME (DARK MODE)
========================= */

const STORAGE_KEY = "kanbanTasks";
const STORAGE_WARNING_KEY = "storageWarningDismissed";
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const WARNING_THRESHOLD = 0.7; // 70% of storage
const CRITICAL_THRESHOLD = 0.9; // 90% of storage

let storageWarningDismissed = false;

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  loadTasks();
  updateProgress();
  updateLeaderboard();
  checkDueDates();
  checkStorageUsage();
  setupAutoBackup();
});

/* =========================
   THEME MANAGEMENT
========================= */

function initializeTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "🌙";
  } else {
    themeToggle.textContent = "🌞";
  }
}

function toggleTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "🌙" : "🌞";
}

/* =========================
   STORAGE MANAGEMENT
========================= */

function getStorageUsage() {
  let totalSize = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += (localStorage[key].length + key.length) * 2; // Approximate size in bytes
    }
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkStorageUsage() {
  const used = getStorageUsage();
  const usedPercentage = used / MAX_STORAGE_SIZE;
  const usedFormatted = formatBytes(used);
  const totalFormatted = formatBytes(MAX_STORAGE_SIZE);
  
  // Update storage display
  document.getElementById('storage-used').textContent = usedFormatted;
  document.getElementById('storage-total').textContent = totalFormatted;
  document.getElementById('modal-storage-used').textContent = usedFormatted;
  
  const modalBar = document.getElementById('modal-storage-bar');
  if (modalBar) {
    modalBar.style.width = Math.min(usedPercentage * 100, 100) + '%';
  }
  
  // Show warnings if needed
  if (!storageWarningDismissed) {
    if (usedPercentage >= CRITICAL_THRESHOLD) {
      showStorageWarning('critical', `Storage critically full (${usedFormatted} used). Please free up space immediately to prevent data loss.`);
    } else if (usedPercentage >= WARNING_THRESHOLD) {
      showStorageWarning('warning', `Storage nearly full (${usedFormatted} used). Consider exporting or cleaning up old tasks.`);
    } else {
      hideStorageWarning();
    }
  }
}

function showStorageWarning(type, message) {
  const warningBanner = document.getElementById('storage-warning');
  const warningMessage = document.getElementById('storage-warning-message');
  
  warningBanner.classList.remove('hidden', 'warning-critical');
  if (type === 'critical') {
    warningBanner.classList.add('warning-critical');
  }
  
  warningMessage.textContent = message;
}

function hideStorageWarning() {
  document.getElementById('storage-warning').classList.add('hidden');
}

function dismissStorageWarning() {
  storageWarningDismissed = true;
  hideStorageWarning();
}

/* =========================
   SAFE STORAGE OPERATIONS
========================= */

function safeSaveToStorage(key, data) {
  try {
    const serialized = JSON.stringify(data);
    
    // Check if the data will fit
    const dataSize = serialized.length * 2; // Approximate size in bytes
    const currentUsage = getStorageUsage();
    const newTotal = currentUsage + dataSize;
    
    if (newTotal > MAX_STORAGE_SIZE) {
      showToast('Storage quota would be exceeded. Please free up space first.', 'error');
      return false;
    }
    
    localStorage.setItem(key, serialized);
    checkStorageUsage();
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      handleQuotaExceeded();
    } else {
      console.error('Storage error:', e);
      showToast('An error occurred while saving. Please try again.', 'error');
    }
    return false;
  }
}

function safeLoadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading from storage:', e);
    showToast('Error loading tasks. Attempting recovery...', 'warning');
    return attemptRecovery();
  }
}

function handleQuotaExceeded() {
  showToast('Storage full! Tasks could not be saved.', 'error');
  
  // Show storage options modal
  showStorageOptions();
  
  // Attempt to backup current state
  backupTasks();
}

/* =========================
   DATA RECOVERY
========================= */

function attemptRecovery() {
  // Try to load from backup in localStorage
  const backup = localStorage.getItem(STORAGE_KEY + '_backup');
  if (backup) {
    try {
      showToast('Recovered from backup', 'success');
      return JSON.parse(backup);
    } catch (e) {
      console.error('Backup also corrupted');
    }
  }
  
  // If no backup, try sessionStorage as last resort
  const sessionBackup = sessionStorage.getItem(STORAGE_KEY);
  if (sessionBackup) {
    try {
      showToast('Recovered from session backup', 'success');
      return JSON.parse(sessionBackup);
    } catch (e) {
      console.error('Session backup also corrupted');
    }
  }
  
  return [];
}

function setupAutoBackup() {
  // Auto backup every 5 minutes
  setInterval(() => {
    const tasks = getAllTasks();
    if (tasks.length > 0) {
      // Save to backup storage
      try {
        localStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(tasks));
        // Also save to sessionStorage for extra redundancy
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('Auto-backup failed:', e);
      }
    }
  }, 300000); // 5 minutes
}

/* =========================
   DRAG & DROP
========================= */

function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}

function drop(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("text");
  const task = document.getElementById(id);
  const column = e.target.closest(".column");

  if (column && task) {
    column.querySelector(".task-list").appendChild(task);
    applyTaskColor(task, column.id);
    saveTasks();
    updateProgress();
    updateLeaderboard();
    checkDueDates();
  }
}

/* =========================
   TASK CRUD
========================= */

function getAllTasks() {
  const tasks = [];
  document.querySelectorAll(".task").forEach(task => {
    const comments = [];
    task.querySelectorAll(".comments p").forEach(c => comments.push(c.textContent));

    tasks.push({
      id: task.id,
      title: task.querySelector("strong").textContent,
      description: task.querySelector("p").textContent,
      dueDate: task.querySelector(".due-date").textContent,
      assignedTo: task.querySelector(".assigned-to")?.value || "",
      column: task.closest(".column")?.id || "",
      comments,
      createdAt: task.dataset.createdAt || new Date().toISOString()
    });
  });
  return tasks;
}

function addTask(columnId) {
  const title = prompt("Enter task title:");
  if (!title) return;

  const description = prompt("Enter task description:") || "";
  const dueDate = prompt("Set due date (YYYY-MM-DD):") || "N/A";

  const taskId = "task-" + Math.random().toString(36).slice(2, 9);
  const task = document.createElement("div");

  task.className = "task";
  task.id = taskId;
  task.draggable = true;
  task.ondragstart = drag;
  task.dataset.createdAt = new Date().toISOString();

  task.innerHTML = `
    <strong>${title}</strong>
    <p>${description}</p>
    <p>Due: <span class="due-date">${dueDate}</span></p>

    <label>Assigned to:
      <select class="assigned-to" onchange="updateLeaderboard(); saveTasks();">
        <option value="Worker 1">Worker 1</option>
        <option value="Worker 2">Worker 2</option>
        <option value="Worker 3">Worker 3</option>
      </select>
    </label>

    <button onclick="addComment('${taskId}')">💬</button>
    <button onclick="editTask(this)">✏️</button>
    <button onclick="deleteTask(this)">❌</button>

    <div class="comments" id="comments-${taskId}"></div>
  `;

  document
    .getElementById(columnId)
    .querySelector(".task-list")
    .appendChild(task);

  applyTaskColor(task, columnId);
  
  if (!saveTasks()) {
    // If save failed, remove the task
    task.remove();
    showToast('Could not add task: storage full', 'error');
  } else {
    showToast('Task added successfully', 'success');
  }
  
  updateProgress();
  updateLeaderboard();
  checkDueDates();
}

function editTask(btn) {
  const task = btn.parentElement;

  const titleEl = task.querySelector("strong");
  const descEl = task.querySelector("p");
  const dueEl = task.querySelector(".due-date");

  const newTitle = prompt("Edit title:", titleEl.textContent);
  const newDesc = prompt("Edit description:", descEl.textContent);
  const newDue = prompt("Edit due date:", dueEl.textContent);

  if (newTitle) titleEl.textContent = newTitle;
  if (newDesc) descEl.textContent = newDesc;
  if (newDue) dueEl.textContent = newDue;

  saveTasks();
}

function deleteTask(btn) {
  if (confirm("Delete this task?")) {
    btn.parentElement.remove();
    saveTasks();
    updateProgress();
    updateLeaderboard();
    showToast('Task deleted', 'info');
  }
}

function addComment(taskId) {
  const text = prompt("Enter comment:");
  if (!text) return;

  const p = document.createElement("p");
  p.textContent = text;
  document.getElementById(`comments-${taskId}`).appendChild(p);

  saveTasks();
  showToast('Comment added', 'success');
}

/* =========================
   SAVE & LOAD
========================= */

function saveTasks() {
  const tasks = getAllTasks();
  return safeSaveToStorage(STORAGE_KEY, tasks);
}

function loadTasks() {
  const tasks = safeLoadFromStorage(STORAGE_KEY);

  tasks.forEach(t => {
    const task = document.createElement("div");
    task.className = "task";
    task.id = t.id;
    task.draggable = true;
    task.ondragstart = drag;
    task.dataset.createdAt = t.createdAt || new Date().toISOString();

    task.innerHTML = `
      <strong>${t.title}</strong>
      <p>${t.description}</p>
      <p>Due: <span class="due-date">${t.dueDate}</span></p>

      <label>Assigned to:
        <select class="assigned-to" onchange="saveTasks(); updateLeaderboard();">
          <option value="Worker 1" ${t.assignedTo === "Worker 1" ? "selected" : ""}>Worker 1</option>
          <option value="Worker 2" ${t.assignedTo === "Worker 2" ? "selected" : ""}>Worker 2</option>
          <option value="Worker 3" ${t.assignedTo === "Worker 3" ? "selected" : ""}>Worker 3</option>
        </select>
      </label>

      <button onclick="addComment('${t.id}')">💬</button>
      <button onclick="editTask(this)">✏️</button>
      <button onclick="deleteTask(this)">❌</button>

      <div class="comments" id="comments-${t.id}"></div>
    `;

    const column = document.getElementById(t.column);
    if (column) {
      column.querySelector(".task-list").appendChild(task);
      applyTaskColor(task, t.column);
    }

    t.comments.forEach(c => {
      const p = document.createElement("p");
      p.textContent = c;
      document.getElementById(`comments-${t.id}`).appendChild(p);
    });
  });
  
  checkStorageUsage();
}

/* =========================
   TASK COLORING
========================= */

function applyTaskColor(task, columnId) {
  task.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  task.style.color = '#222';
}

/* =========================
   PROGRESS
========================= */

function updateProgress() {
  const total = document.querySelectorAll(".task").length;
  const done = document.querySelectorAll("#done .task").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const bar = document.getElementById("progress-bar");
  if (bar) {
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
  }
}

/* =========================
   LEADERBOARD
========================= */

function updateLeaderboard() {
  // This function can be implemented based on your needs
  console.log("Leaderboard updated");
}

/* =========================
   DUE DATES
========================= */

function checkDueDates() {
  const today = new Date().toISOString().split('T')[0];
  
  document.querySelectorAll(".task").forEach(task => {
    const dueDate = task.querySelector(".due-date").textContent;
    if (dueDate !== "N/A" && dueDate < today) {
      task.style.border = "2px solid red";
    } else {
      task.style.border = "none";
    }
  });
}

/* =========================
   EXPORT / IMPORT
========================= */

function exportTasks() {
  const tasks = getAllTasks();
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = `kanban_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  showToast('Tasks exported successfully', 'success');
}

function importTasks() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const tasks = JSON.parse(reader.result);
        
        // Clear existing tasks
        document.querySelectorAll(".task").forEach(task => task.remove());
        
        // Save imported tasks
        if (safeSaveToStorage(STORAGE_KEY, tasks)) {
          location.reload();
          showToast('Tasks imported successfully', 'success');
        } else {
          showToast('Failed to import tasks: storage full', 'error');
        }
      } catch (e) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  input.click();
}

/* =========================
   STORAGE OPTIONS
========================= */

function showStorageOptions() {
  document.getElementById('storage-modal').classList.remove('hidden');
  document.getElementById('storage-modal').classList.add('show');
  checkStorageUsage(); // Update the modal with latest info
}

function closeStorageModal() {
  document.getElementById('storage-modal').classList.add('hidden');
  document.getElementById('storage-modal').classList.remove('show');
}

function backupTasks() {
  exportTasks();
  showToast('Backup created successfully', 'success');
}

function restoreBackup() {
  importTasks();
}

function clearOldTasks() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const tasks = document.querySelectorAll("#done .task");
  let deletedCount = 0;
  
  tasks.forEach(task => {
    const createdAt = new Date(task.dataset.createdAt || 0);
    if (createdAt < thirtyDaysAgo) {
      task.remove();
      deletedCount++;
    }
  });
  
  if (deletedCount > 0) {
    saveTasks();
    showToast(`Cleared ${deletedCount} old completed tasks`, 'success');
  } else {
    showToast('No old tasks to clear', 'info');
  }
  
  closeStorageModal();
  checkStorageUsage();
}

function compressTasks() {
  // Remove empty comments and trim whitespace
  document.querySelectorAll(".task").forEach(task => {
    const comments = task.querySelectorAll(".comments p");
    comments.forEach(comment => {
      const text = comment.textContent.trim();
      if (text === "") {
        comment.remove();
      } else {
        comment.textContent = text;
      }
    });
  });
  
  saveTasks();
  showToast('Tasks compressed successfully', 'success');
  closeStorageModal();
}

/* =========================
   TOAST NOTIFICATIONS
========================= */

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* =========================
   INITIALIZATION
========================= */

// Make functions globally available
window.toggleTheme = toggleTheme;
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
window.addTask = addTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.addComment = addComment;
window.exportTasks = exportTasks;
window.importTasks = importTasks;
window.showStorageOptions = showStorageOptions;
window.closeStorageModal = closeStorageModal;
window.backupTasks = backupTasks;
window.restoreBackup = restoreBackup;
window.clearOldTasks = clearOldTasks;
window.compressTasks = compressTasks;
window.dismissStorageWarning = dismissStorageWarning;