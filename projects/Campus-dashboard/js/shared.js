/**
 * Shared Header/Sidebar Injection & Auth Check
 */

(function initShared() {
    // 1. Auth Guard
    if (!DB.getUser()) {
        const path = window.location.pathname;
        if (!path.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
    }

    const user = DB.getUser();

    // 2. Sidebar Injection
    const sidebar = document.getElementById('sidebarContainer');
    if (sidebar) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        sidebar.innerHTML = `
            <div class="logo">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Smart<span class="highlight">Campus</span></span>
            </div>
            
            <nav class="nav-menu">
                <a href="index.html" class="nav-item ${currentPage === 'index.html' ? 'active' : ''}">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Dashboard</span>
                </a>
                <a href="subjects.html" class="nav-item ${currentPage === 'subjects.html' ? 'active' : ''}">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <span>My Subjects</span>
                </a>
                <a href="attendance.html" class="nav-item ${currentPage === 'attendance.html' ? 'active' : ''}">
                    <i class="fa-solid fa-users"></i>
                    <span>Attendance</span>
                </a>
                <a href="energy.html" class="nav-item ${currentPage === 'energy.html' ? 'active' : ''}">
                    <i class="fa-solid fa-bolt"></i>
                    <span>Energy</span>
                </a>
                <a href="library.html" class="nav-item ${currentPage === 'library.html' ? 'active' : ''}">
                    <i class="fa-solid fa-book"></i>
                    <span>Library</span>
                </a>
                <a href="events.html" class="nav-item ${currentPage === 'events.html' ? 'active' : ''}">
                    <i class="fa-solid fa-calendar-check"></i>
                    <span>Events</span>
                </a>
            </nav>
            
            <div class="nav-footer">
                <a href="settings.html" class="nav-item ${currentPage === 'settings.html' ? 'active' : ''}">
                    <i class="fa-solid fa-gear"></i>
                    <span>Settings</span>
                </a>
                <a href="#" onclick="DB.logout()" class="nav-item logout">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Logout</span>
                </a>
            </div>
        `;
    }

    // 3. Header Injection
    const header = document.getElementById('headerContainer');
    if (header) {
        header.innerHTML = `
            <div class="search-bar">
                <i class="fa-solid fa-search"></i>
                <input type="text" placeholder="Search data...">
            </div>
            
            <div class="header-actions">
                <button class="menu-toggle" style="display:none;" onclick="document.getElementById('sidebarContainer').classList.toggle('active')">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <div style="position: relative;">
                    <button class="icon-btn notification-btn" onclick="document.getElementById('notifDropdown').classList.toggle('show')">
                        <i class="fa-regular fa-bell"></i>
                        <span class="badge">3</span>
                    </button>
                    <!-- Notification Dropdown -->
                    <div id="notifDropdown" style="
                        display: none;
                        position: absolute;
                        top: 50px;
                        right: 0;
                        width: 300px;
                        background: #1e1b4b;
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                        z-index: 1000;
                    ">
                        <h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Notifications</h4>
                        <div style="font-size: 0.85rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.8rem;">
                            <p><strong>System</strong>: Maintenance scheduled for 2 AM.</p>
                            <p><strong>Library</strong>: Your book is due tomorrow.</p>
                            <p><strong>Energy</strong>: High usage alert in Block A.</p>
                        </div>
                    </div>
                    <style> .show { display: block !important; } </style>
                </div>

                <div class="user-profile" onclick="window.location.href='settings.html'">
                    <img src="${user.avatar}" alt="User">
                    <div class="user-info">
                        <span class="name">${user.name}</span>
                        <span class="role">${user.role}</span>
                    </div>
                </div>
            </div>
        `;

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notifDropdown');
            const btn = document.querySelector('.notification-btn');
            if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
})();
