/**
 * Shared logic for Day 117 Analytics Platform
 */
(function () {
    // 1. Auth Guard
    DB.requireAuth();

    const user = DB.getSession();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // 2. Sidebar Injection
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML = `
            <div class="brand">
                <i class="fa-solid fa-microchip"></i>
                <span>DATA<span class="pulse">FLOW</span></span>
            </div>
            <nav class="nav-menu">
                <a href="index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">
                    <i class="fa-solid fa-chart-line"></i> Dashboard
                </a>
                <a href="geo.html" class="nav-link ${currentPage === 'geo.html' ? 'active' : ''}">
                    <i class="fa-solid fa-earth-americas"></i> Geo-Traffic
                </a>
                <a href="infra.html" class="nav-link ${currentPage === 'infra.html' ? 'active' : ''}">
                    <i class="fa-solid fa-server"></i> Infra Status
                </a>
                <a href="security.html" class="nav-link ${currentPage === 'security.html' ? 'active' : ''}">
                    <i class="fa-solid fa-shield-halved"></i> Security
                </a>
                <a href="settings.html" class="nav-link ${currentPage === 'settings.html' ? 'active' : ''}">
                    <i class="fa-solid fa-gear"></i> Settings
                </a>
            </nav>
            <div class="nav-footer">
                <a href="#" class="nav-link" onclick="DB.logout()">
                    <i class="fa-solid fa-power-off"></i> Terminate Session
                </a>
            </div>
        `;
    }

    // 3. Header Customization
    const header = document.querySelector('.workspace-header');
    if (header) {
        // Ensure user info is dynamic
        const userPill = header.querySelector('.user-pill');
        if (userPill) {
            userPill.innerHTML = `
                <img src="${user.avatar}" alt="User">
                <span>${user.name}</span>
            `;
        }
    }
})();
