// uiManager.js
import { globalEvents } from '../core/eventBus.js';

export class UIManager {
    constructor() {
        this.initToggles();
        this.initButtons();
        this.initStats();
        this.initNotifications();
    }

    initToggles() {
        const toggleDebug = document.getElementById('toggle-debug-render');
        const toggleAABB = document.getElementById('toggle-aabb');
        const toggleContacts = document.getElementById('toggle-contacts');

        toggleDebug.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            toggleAABB.disabled = !isChecked;
            toggleContacts.disabled = !isChecked;
            globalEvents.emit('toggle_debug', isChecked);
            if (!isChecked) {
                toggleAABB.checked = false;
                toggleContacts.checked = false;
                globalEvents.emit('toggle_aabb', false);
                globalEvents.emit('toggle_contacts', false);
            }
        });

        toggleAABB.addEventListener('change', (e) => {
            globalEvents.emit('toggle_aabb', e.target.checked);
        });

        toggleContacts.addEventListener('change', (e) => {
            globalEvents.emit('toggle_contacts', e.target.checked);
        });

        globalEvents.on('toggle_slowmo_key', (active) => {
            const btn = document.getElementById('btn-slowmo');
            if (active) {
                btn.style.backgroundColor = 'rgba(245, 158, 11, 0.4)';
                btn.style.color = '#fff';
            } else {
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }
        });
    }

    initButtons() {
        document.getElementById('btn-slowmo').addEventListener('mousedown', () => globalEvents.emit('toggle_slowmo', true));
        document.getElementById('btn-slowmo').addEventListener('mouseup', () => globalEvents.emit('toggle_slowmo', false));
        document.getElementById('btn-slowmo').addEventListener('mouseleave', () => globalEvents.emit('toggle_slowmo', false));

        document.getElementById('btn-pause').addEventListener('click', () => globalEvents.emit('toggle_pause'));
        document.getElementById('btn-reset').addEventListener('click', () => globalEvents.emit('reset_scene'));

        document.getElementById('btn-spawn-box').addEventListener('click', () => globalEvents.emit('spawn_box'));
        document.getElementById('btn-spawn-poly').addEventListener('click', () => globalEvents.emit('spawn_poly'));
        document.getElementById('btn-spawn-blade').addEventListener('click', () => globalEvents.emit('spawn_blade'));
        document.getElementById('btn-spawn-cloth').addEventListener('click', () => globalEvents.emit('spawn_cloth'));
    }

    initStats() {
        const fpsEl = document.getElementById('stat-fps');
        const bodiesEl = document.getElementById('stat-bodies');
        const contactsEl = document.getElementById('stat-contacts');

        globalEvents.on('fps_update', fps => fpsEl.textContent = fps);
        globalEvents.on('stats_update', stats => {
            bodiesEl.textContent = stats.bodies;
            contactsEl.textContent = stats.contacts;
        });
    }

    initNotifications() {
        const container = document.getElementById('notifications');
        globalEvents.on('notify', (msg) => {
            const div = document.createElement('div');
            div.className = 'notice';
            div.textContent = msg;
            container.appendChild(div);

            setTimeout(() => {
                div.classList.add('fade-out');
                setTimeout(() => div.remove(), 500);
            }, 3000);
        });
    }
}
