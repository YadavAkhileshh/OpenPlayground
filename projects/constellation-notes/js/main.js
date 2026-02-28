import Viewport from './engine/viewport.js';
import ConstellationManager from './core/manager.js';
import AuthSystem from './core/auth.js';

window.addEventListener('DOMContentLoaded', async () => {
    // 0. Auth Check
    const auth = new AuthSystem();
    if (!auth.requireAuth()) return;

    const container = document.getElementById('canvas-container');
    const canvas = document.getElementById('infinite-canvas');

    if (!container || !canvas) {
        console.error("Critical: Canvas elements not found");
        return;
    }

    // 1. Initialize Viewport
    const viewport = new Viewport(container, canvas);

    // 2. Initialize Manager
    const manager = new ConstellationManager(canvas, viewport);

    // 3. UI Hooks

    // Add Star Button
    const addBtn = document.getElementById('add-note');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const worldPos = viewport.toWorld(window.innerWidth / 2, window.innerHeight / 2);
            manager.addNote(worldPos.x, worldPos.y);
        });
    }

    // File Upload Trigger
    const fileBtn = document.getElementById('upload-file');
    const fileInput = document.getElementById('file-input');

    if (fileBtn && fileInput) {
        fileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const worldPos = viewport.toWorld(window.innerWidth / 2, window.innerHeight / 2);
                manager.addNote(worldPos.x, worldPos.y, `Data from: ${file.name}`, {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                fileInput.value = ''; // Reset for next upload
            }
        });
    }

    // Sync / Recenter View
    const resetBtn = document.getElementById('reset-view');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            manager.centerOnContent();
        });
    }

    // Clear All Button
    const clearBtn = document.getElementById('clear-all');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to wipe the entire nebula?')) {
                manager.notes.forEach(n => n.element.remove());
                manager.notes = [];
                manager.connections = [];
                manager.save();
            }
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            window.location.href = 'auth.html';
        });
    }

    // Search Logic
    const searchInput = document.getElementById('note-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) return;

            const found = manager.notes.find(n => n.data.text.toLowerCase().includes(query));
            if (found) {
                // Smooth transition to note
                viewport.offset.x = window.innerWidth / 2 - found.data.x * viewport.scale;
                viewport.offset.y = window.innerHeight / 2 - found.data.y * viewport.scale;
                viewport.applyTransform();
            }
        });
    }

    // 4. Generate Starfield
    generateStarfield();

    // 5. Hide Hint
    setTimeout(() => {
        const hint = document.getElementById('hint-overlay');
        if (hint) {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 1000);
        }
    }, 8000);
});

function generateStarfield() {
    const field = document.getElementById('starfield');
    if (!field) return;

    const count = 150;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        field.appendChild(star);
    }
}
