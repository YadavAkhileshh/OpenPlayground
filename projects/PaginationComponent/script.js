// Sample Data Generator
function generateSampleData(count) {
    const data = [];
    const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const domains = ['example.com', 'test.com', 'demo.com', 'mail.com'];
    const statuses = [
        { type: 'active', color: '#065f46', bg: '#d1fae5' },
        { type: 'inactive', color: '#92400e', bg: '#fef3c7' },
        { type: 'pending', color: '#1e40af', bg: '#dbeafe' }
    ];
    
    for (let i = 1; i <= count; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        data.push({
            id: i,
            name: `${name} ${i}`,
            email: `${name.toLowerCase()}.${i}@${domain}`,
            status: status.type,
            statusColor: status.color,
            statusBg: status.bg
        });
    }
    
    return data;
}

// Pagination Component Class
class Pagination {
    constructor(config) {
        this.totalItems = config.totalItems || 100;
        this.itemsPerPage = config.itemsPerPage || 10;
        this.currentPage = config.currentPage || 1;
        this.visiblePages = config.visiblePages || 5;
        this.container = config.container;
        this.onPageChange = config.onPageChange || (() => {});
        
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.init();
    }
    
    init() {
        this.createDOM();
        this.setupEventListeners();
        this.render();
    }
    
    createDOM() {
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        this.container.innerHTML = `
            <div class="pagination">
                <div class="pagination-info" id="paginationInfo">
                    Showing <span id="startItem">${startItem}</span>-<span id="endItem">${endItem}</span> 
                    of <span id="totalItemCount">${this.totalItems}</span> items
                </div>
                
                <nav class="pagination-nav" aria-label="Page navigation">
                    <button class="page-btn first-btn" id="firstBtn" title="First page">
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="page-btn prev-btn" id="prevBtn" title="Previous page">
                        <i class="fas fa-angle-left"></i>
                    </button>
                    
                    <div class="page-numbers" id="pageNumbers">
                        ${this.generatePageButtons()}
                    </div>
                    
                    <button class="page-btn next-btn" id="nextBtn" title="Next page">
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button class="page-btn last-btn" id="lastBtn" title="Last page">
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </nav>
                
                <div class="page-jump">
                    <input type="number" id="jumpToPage" min="1" max="${this.totalPages}" value="${this.currentPage}" placeholder="Page">
                    <button id="jumpBtn" class="jump-btn">Go</button>
                </div>
            </div>
        `;
    }
    
    generatePageButtons() {
        let html = '';
        const showFirstLast = document.getElementById('showFirstLast')?.checked ?? true;
        const showEllipsis = document.getElementById('showEllipsis')?.checked ?? true;
        
        // Calculate range of pages to show
        let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + this.visiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < this.visiblePages) {
            startPage = Math.max(1, endPage - this.visiblePages + 1);
        }
        
        // Show first page and ellipsis
        if (showFirstLast && startPage > 1) {
            html += `<button class="page-number ${this.currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`;
            if (showEllipsis && startPage > 2) {
                html += `<span class="ellipsis">...</span>`;
            }
        }
        
        // Generate page buttons for visible range
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<button class="page-number ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        // Show last page and ellipsis
        if (showFirstLast && endPage < this.totalPages) {
            if (showEllipsis && endPage < this.totalPages - 1) {
                html += `<span class="ellipsis">...</span>`;
            }
            const activeClass = this.currentPage === this.totalPages ? 'active' : '';
            html += `<button class="page-number ${activeClass}" data-page="${this.totalPages}">${this.totalPages}</button>`;
        }
        
        return html;
    }
    
    setupEventListeners() {
        // Page number buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-number')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
            
            if (e.target.closest('.first-btn')) {
                this.goToPage(1);
            }
            
            if (e.target.closest('.prev-btn')) {
                this.goToPage(this.currentPage - 1);
            }
            
            if (e.target.closest('.next-btn')) {
                this.goToPage(this.currentPage + 1);
            }
            
            if (e.target.closest('.last-btn')) {
                this.goToPage(this.totalPages);
            }
            
            if (e.target.closest('#jumpBtn')) {
                const pageInput = this.container.querySelector('#jumpToPage');
                const page = parseInt(pageInput.value);
                if (page >= 1 && page <= this.totalPages) {
                    this.goToPage(page);
                }
            }
        });
        
        // Jump to page input - handle Enter key
        const jumpInput = this.container.querySelector('#jumpToPage');
        if (jumpInput) {
            jumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= this.totalPages) {
                        this.goToPage(page);
                    }
                }
            });
            
            // Validate input on change
            jumpInput.addEventListener('change', (e) => {
                let page = parseInt(e.target.value);
                if (isNaN(page)) page = 1;
                if (page < 1) page = 1;
                if (page > this.totalPages) page = this.totalPages;
                e.target.value = page;
            });
        }
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        
        this.currentPage = page;
        this.render();
        this.onPageChange(page);
    }
    
    render() {
        // Update page buttons
        const pageNumbersContainer = this.container.querySelector('#pageNumbers');
        if (pageNumbersContainer) {
            pageNumbersContainer.innerHTML = this.generatePageButtons();
        }
        
        // Update button states
        const firstBtn = this.container.querySelector('.first-btn');
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');
        const lastBtn = this.container.querySelector('.last-btn');
        const jumpInput = this.container.querySelector('#jumpToPage');
        
        if (firstBtn) firstBtn.disabled = this.currentPage === 1;
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages;
        if (lastBtn) lastBtn.disabled = this.currentPage === this.totalPages;
        if (jumpInput) {
            jumpInput.value = this.currentPage;
            jumpInput.max = this.totalPages;
        }
        
        // Update info text
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        const infoContainer = this.container.querySelector('#paginationInfo');
        if (infoContainer) {
            infoContainer.innerHTML = `Showing <span id="startItem">${startItem}</span>-<span id="endItem">${endItem}</span> of <span id="totalItemCount">${this.totalItems}</span> items`;
        }
    }
    
    updateConfig(newConfig) {
        let needsRender = false;
        
        if (newConfig.totalItems !== undefined) {
            this.totalItems = newConfig.totalItems;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.currentPage = Math.min(this.currentPage, this.totalPages);
            needsRender = true;
        }
        
        if (newConfig.itemsPerPage !== undefined) {
            this.itemsPerPage = newConfig.itemsPerPage;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.currentPage = Math.min(this.currentPage, this.totalPages);
            needsRender = true;
        }
        
        if (newConfig.currentPage !== undefined) {
            const newPage = Math.min(Math.max(1, newConfig.currentPage), this.totalPages);
            if (newPage !== this.currentPage) {
                this.currentPage = newPage;
                needsRender = true;
            }
        }
        
        if (newConfig.visiblePages !== undefined) {
            this.visiblePages = Math.min(Math.max(1, newConfig.visiblePages), 9);
            needsRender = true;
        }
        
        if (needsRender) {
            this.render();
        }
    }
}

// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const totalItemsInput = document.getElementById('totalItems');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const visiblePagesInput = document.getElementById('visiblePages');
    const tableBody = document.getElementById('tableBody');
    const paginationContainer = document.getElementById('paginationContainer');
    const currentRangeSpan = document.getElementById('currentRange');
    const pageInfoSpan = document.getElementById('pageInfo');
    const currentYearSpan = document.getElementById('currentYear');
    
    // State
    let sampleData = [];
    let pagination;
    
    // Initialize sample data
    function initSampleData(count) {
        sampleData = generateSampleData(count);
        renderTableData(1, pagination.itemsPerPage);
    }
    
    // Render table data
    function renderTableData(page, itemsPerPage) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, sampleData.length);
        const pageData = sampleData.slice(startIndex, endIndex);
        
        tableBody.innerHTML = '';
        
        pageData.forEach(item => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <div>${item.id}</div>
                <div>${item.name}</div>
                <div>${item.email}</div>
                <div><span class="status-badge" style="background: ${item.statusBg}; color: ${item.statusColor};">${item.status}</span></div>
            `;
            tableBody.appendChild(row);
        });
        
        // Update info displays
        currentRangeSpan.textContent = `Items ${startIndex + 1}-${endIndex} of ${sampleData.length}`;
        pageInfoSpan.textContent = `Page ${page} of ${Math.ceil(sampleData.length / itemsPerPage)}`;
        
        // Add animation
        const rows = tableBody.querySelectorAll('.table-row');
        rows.forEach((row, index) => {
            row.style.animationDelay = `${index * 0.05}s`;
        });
    }
    
    // Initialize pagination
    function initPagination() {
        const totalItems = parseInt(totalItemsInput.value);
        const itemsPerPage = parseInt(itemsPerPageSelect.value);
        const visiblePages = parseInt(visiblePagesInput.value);
        
        pagination = new Pagination({
            totalItems: totalItems,
            itemsPerPage: itemsPerPage,
            currentPage: 1,
            visiblePages: visiblePages,
            container: paginationContainer,
            onPageChange: (page) => {
                renderTableData(page, pagination.itemsPerPage);
            }
        });
        
        initSampleData(totalItems);
    }
    
    // Initialize everything
    initPagination();
    
    // Event Listeners for controls
    totalItemsInput.addEventListener('change', function() {
        const newTotal = parseInt(this.value);
        if (isNaN(newTotal) || newTotal < 1) {
            this.value = 1;
            return;
        }
        
        sampleData = generateSampleData(newTotal);
        pagination.updateConfig({ totalItems: newTotal });
        renderTableData(pagination.currentPage, pagination.itemsPerPage);
    });
    
    itemsPerPageSelect.addEventListener('change', function() {
        const newItemsPerPage = parseInt(this.value);
        pagination.updateConfig({ itemsPerPage: newItemsPerPage });
        renderTableData(pagination.currentPage, newItemsPerPage);
    });
    
    visiblePagesInput.addEventListener('change', function() {
        const newVisiblePages = parseInt(this.value);
        if (newVisiblePages < 1) {
            this.value = 1;
            return;
        }
        if (newVisiblePages > 9) {
            this.value = 9;
            return;
        }
        pagination.updateConfig({ visiblePages: newVisiblePages });
    });
    
    // Number input buttons
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const target = document.getElementById(targetId);
            const action = this.dataset.action;
            
            let value = parseInt(target.value);
            if (isNaN(value)) value = 1;
            
            const min = parseInt(target.min) || 1;
            const max = parseInt(target.max) || 1000;
            
            if (action === 'increase') {
                value = Math.min(value + 1, max);
            } else {
                value = Math.max(value - 1, min);
            }
            
            target.value = value;
            target.dispatchEvent(new Event('change'));
        });
    });
    
    // Checkbox controls
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            pagination.render();
        });
    });
    
    // Set current year
    currentYearSpan.textContent = new Date().getFullYear();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when not focused on inputs
        if (document.activeElement.tagName === 'INPUT') return;
        
        if (e.key === 'ArrowLeft') {
            pagination.goToPage(pagination.currentPage - 1);
        } else if (e.key === 'ArrowRight') {
            pagination.goToPage(pagination.currentPage + 1);
        }
    });
    
    // Code panel example
    const codePanel = document.querySelector('.code-panel pre code');
    if (codePanel) {
        codePanel.textContent = `// Initialize pagination
const pagination = new Pagination({
  totalItems: 125,
  itemsPerPage: 10,
  currentPage: 1,
  visiblePages: 5,
  container: document.getElementById('paginationContainer'),
  onPageChange: (page) => {
    console.log(\`Page changed to: \${page}\`);
    // Load your data here
    loadDataForPage(page);
  }
});

// Update configuration
pagination.updateConfig({
  totalItems: 200,
  itemsPerPage: 20
});

// Navigate programmatically
pagination.goToPage(5);`;
    }
});