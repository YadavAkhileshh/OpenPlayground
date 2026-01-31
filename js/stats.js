    // Feature #1291: Advanced Project Analytics & Local Trending Engine
    // Added user activity section to stats page
    
    // Fetch data from projects.json
    fetch('./projects.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch projects.json: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        // Remove all types of BOMs (UTF-8, UTF-16, UTF-32)
        text = text.replace(/^\uFEFF/, ''); // UTF-8 BOM
        text = text.replace(/^\ufeff/, ''); // Alternative BOM
        text = text.replace(/^[\uFEFF\uFFFE\u0000\uFFFF]+/, ''); // Any BOM variants
        
        // Also strip any leading non-JSON characters until we find '[' or '{'
        const jsonStart = text.search(/[\[\{]/);
        if (jsonStart > 0) {
          console.warn('Stripped', jsonStart, 'invalid leading characters');
          text = text.substring(jsonStart);
        }
        
        // Try to parse JSON with better error handling
        let projects;
        try {
          projects = JSON.parse(text);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          console.error('Raw response (first 500 chars):', text.substring(0, 500));
          console.error('Char codes:', Array.from(text.substring(0, 10)).map(c => c.charCodeAt(0)));
          throw new Error(`Invalid JSON: ${e.message}`);
        }
        return projects;
      })
      .then(projects => {
        // Count unique projects and categories
        const seenTitles = new Set();
        const categoryCount = {};

        projects.forEach(project => {
          // Validate and trim title
          const title = project.title ? project.title.trim() : '';
          if (!title || !project.link) return;
          
          // Skip duplicates (case-insensitive)
          const titleKey = title.toLowerCase();
          if (seenTitles.has(titleKey)) return;
          seenTitles.add(titleKey);

          // Normalize category (handle plurals, lowercase, and spaces)
          let category = (project.category || 'other')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          
          // Normalize plural categories to singular
          const pluralMap = {
            'games': 'game',
            'puzzles': 'puzzle',
            'utilities': 'utility'
          };
          category = pluralMap[category] || category;
          
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        renderStats(categoryCount, seenTitles.size);
        renderChart(categoryCount);
        
        // Render user activity section if analytics engine is available
        renderUserActivity(projects);
        
        // Show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('statsSummary').style.display = 'grid';
        document.getElementById('statsGrid').style.display = 'grid';
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('loading').innerHTML = `
          <div style="color: var(--orange-500); font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <p>Failed to load project data. Please try refreshing the page.</p>
          <p style="font-size: 14px; color: var(--gray-500); margin-top: 8px;">Error: ${error.message}</p>
        `;
  });


function renderStats(categoryCount, totalUnique) {
  // Update main stats
  document.getElementById('totalProjects').textContent = totalUnique;
  document.getElementById('totalCategories').textContent = Object.keys(categoryCount).length;

  // Render category cards
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1]);

  const categoryIcons = {
    utility: 'ri-tools-line',
    game: 'ri-gamepad-line',
    puzzle: 'ri-puzzle-line',
    fun: 'ri-magic-line',
    communication: 'ri-chat-3-line',
    educational: 'ri-book-open-line',
    productivity: 'ri-task-line',
    creative: 'ri-palette-line',
    web: 'ri-global-line',
    mobile: 'ri-smartphone-line',
    desktop: 'ri-computer-line',
    ai: 'ri-cpu-line',
    data: 'ri-database-2-line',
    other: 'ri-folder-3-line'
  };

  sortedCategories.forEach(([cat, count], index) => {
    const icon = categoryIcons[cat] || 'ri-folder-3-line';
    const percentage = ((count / totalUnique) * 100).toFixed(1);

    grid.innerHTML += `
          <div class="stat-card">
            <h3><i class="${icon}"></i> ${capitalize(cat)}</h3>
            <span>${count}</span>
            <div class="percentage">
              <i class="ri-pie-chart-line"></i>
              ${percentage}% of total
            </div>
          </div>
        `;
  });
}

function renderChart(categoryCount) {
  const ctx = document.getElementById("categoryChart");

  // Orange gradient colors
  const orangeGradients = [
    'rgba(251, 146, 60, 0.9)',
    'rgba(249, 115, 22, 0.9)',
    'rgba(234, 88, 12, 0.9)',
    'rgba(194, 65, 12, 0.9)',
    'rgba(253, 186, 116, 0.9)',
    'rgba(245, 158, 11, 0.9)',
    'rgba(217, 119, 6, 0.9)'
  ];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(categoryCount).map(capitalize),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: orangeGradients.slice(0, Object.keys(categoryCount).length),
        borderRadius: 12,
        borderWidth: 0,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(249, 115, 22, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} projects (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(251, 146, 60, 0.1)',
            drawBorder: false
          },
          ticks: {
            stepSize: 1,
            color: 'var(--gray-600)',
            font: {
              weight: 500
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'var(--gray-700)',
            font: {
              weight: 600,
              size: 13
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

    /**
     * Render user activity section using analytics engine
     * Feature #1291: Shows personalized stats based on local telemetry
     */
    function renderUserActivity(projects) {
      // Check if analytics engine is available
      if (!window.analyticsEngine) {
        console.log('📊 Analytics engine not loaded, skipping user activity section');
        return;
      }

      const activityContainer = document.getElementById('userActivitySection');
      if (!activityContainer) {
        // Create the section if it doesn't exist
        createUserActivitySection(projects);
        return;
      }

      populateUserActivity(activityContainer, projects);
    }

    function createUserActivitySection(projects) {
      const statsSection = document.querySelector('.stats-container') || document.body;
      
      // Create user activity section HTML
      const section = document.createElement('section');
      section.id = 'userActivitySection';
      section.className = 'user-activity-section';
      section.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">
            <i class="ri-user-line"></i> Your Activity
          </h2>
          <p class="section-subtitle">Personal statistics based on your browsing</p>
        </div>
        <div class="activity-summary" id="activitySummary">
          <!-- Activity stats cards will be inserted here -->
        </div>
        <div class="activity-details">
          <div class="most-visited-section">
            <h3><i class="ri-fire-line"></i> Most Visited Projects</h3>
            <div class="most-visited-list" id="mostVisitedList">
              <!-- Most visited projects will be inserted here -->
            </div>
          </div>
          <div class="trending-section">
            <h3><i class="ri-line-chart-line"></i> Currently Trending</h3>
            <div class="trending-list" id="trendingList">
              <!-- Trending projects will be inserted here -->
            </div>
          </div>
        </div>
      `;

      // Insert after the main stats grid
      const statsGrid = document.getElementById('statsGrid');
      if (statsGrid && statsGrid.parentNode) {
        statsGrid.parentNode.insertBefore(section, statsGrid.nextSibling);
      } else {
        statsSection.appendChild(section);
      }

      // Add styles for the activity section
      addActivityStyles();

      // Populate with data
      populateUserActivity(section, projects);
    }

    function populateUserActivity(container, projects) {
      const analytics = window.analyticsEngine;
      if (!analytics) return;

      const summary = analytics.getUserActivitySummary();
      const trending = analytics.getTrendingProjects(5);

      // Render summary cards
      const summaryContainer = container.querySelector('#activitySummary');
      if (summaryContainer) {
        summaryContainer.innerHTML = `
          <div class="activity-stat-card">
            <div class="activity-icon"><i class="ri-cursor-line"></i></div>
            <div class="activity-value">${summary.totalClicks}</div>
            <div class="activity-label">Projects Explored</div>
          </div>
          <div class="activity-stat-card">
            <div class="activity-icon"><i class="ri-eye-line"></i></div>
            <div class="activity-value">${summary.totalViews}</div>
            <div class="activity-label">Project Views</div>
          </div>
          <div class="activity-stat-card">
            <div class="activity-icon"><i class="ri-time-line"></i></div>
            <div class="activity-value">${formatTime(summary.totalTimeSpent)}</div>
            <div class="activity-label">Time Exploring</div>
          </div>
          <div class="activity-stat-card">
            <div class="activity-icon"><i class="ri-folder-open-line"></i></div>
            <div class="activity-value">${summary.uniqueProjects}</div>
            <div class="activity-label">Unique Projects</div>
          </div>
        `;
      }

      // Render most visited projects
      const mostVisitedContainer = container.querySelector('#mostVisitedList');
      if (mostVisitedContainer && summary.mostVisited.length > 0) {
        mostVisitedContainer.innerHTML = summary.mostVisited.map((item, index) => {
          const project = projects.find(p => 
            (p.folder || p.name || p.title) === item.projectId || p.title === item.projectId
          );
          const title = project?.title || item.projectId;
          const link = project?.link || '#';
          
          return `
            <a href="${link}" class="visited-item">
              <span class="visited-rank">#${index + 1}</span>
              <span class="visited-title">${escapeHtml(title)}</span>
              <span class="visited-count">${item.clicks} visits</span>
            </a>
          `;
        }).join('');
      } else if (mostVisitedContainer) {
        mostVisitedContainer.innerHTML = `
          <div class="empty-activity">
            <i class="ri-compass-line"></i>
            <p>Start exploring projects to see your activity!</p>
          </div>
        `;
      }

      // Render trending projects
      const trendingContainer = container.querySelector('#trendingList');
      if (trendingContainer && trending.length > 0) {
        trendingContainer.innerHTML = trending.map((item, index) => {
          const project = projects.find(p => 
            (p.folder || p.name || p.title) === item.projectId || p.title === item.projectId
          );
          const title = project?.title || item.projectId;
          const link = project?.link || '#';
          
          return `
            <a href="${link}" class="trending-item">
              <span class="trending-badge">🔥</span>
              <span class="trending-title">${escapeHtml(title)}</span>
              <span class="trending-score">${item.score.toFixed(1)} pts</span>
            </a>
          `;
        }).join('');
      } else if (trendingContainer) {
        trendingContainer.innerHTML = `
          <div class="empty-activity">
            <i class="ri-fire-line"></i>
            <p>Trending projects will appear as you explore!</p>
          </div>
        `;
      }
    }

    function formatTime(seconds) {
      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function addActivityStyles() {
      if (document.getElementById('activity-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'activity-styles';
      styles.textContent = `
        .user-activity-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-light, #e2e8f0);
        }
        
        .user-activity-section .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary, #1e293b);
        }
        
        .user-activity-section .section-title i {
          color: var(--orange-500, #f97316);
        }
        
        .activity-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .activity-stat-card {
          background: var(--surface, white);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
          border: 1px solid var(--border-light, #e2e8f0);
          transition: all 0.3s ease;
        }
        
        .activity-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .activity-icon {
          font-size: 1.75rem;
          color: var(--orange-500, #f97316);
          margin-bottom: 0.5rem;
        }
        
        .activity-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }
        
        .activity-label {
          font-size: 0.85rem;
          color: var(--text-secondary, #64748b);
          margin-top: 0.25rem;
        }
        
        .activity-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .most-visited-section,
        .trending-section {
          background: var(--surface, white);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid var(--border-light, #e2e8f0);
        }
        
        .most-visited-section h3,
        .trending-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-primary, #1e293b);
        }
        
        .most-visited-section h3 i {
          color: var(--orange-500, #f97316);
        }
        
        .trending-section h3 i {
          color: #ef4444;
        }
        
        .visited-item,
        .trending-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-primary, #1e293b);
          transition: all 0.2s ease;
          margin-bottom: 0.5rem;
        }
        
        .visited-item:hover,
        .trending-item:hover {
          background: var(--bg-tertiary, #f1f5f9);
        }
        
        .visited-rank {
          font-weight: 700;
          color: var(--orange-500, #f97316);
          min-width: 28px;
        }
        
        .visited-title,
        .trending-title {
          flex: 1;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .visited-count,
        .trending-score {
          font-size: 0.8rem;
          color: var(--text-secondary, #64748b);
          background: var(--bg-tertiary, #f1f5f9);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .trending-badge {
          font-size: 1.25rem;
        }
        
        .empty-activity {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-secondary, #64748b);
        }
        
        .empty-activity i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }
        
        .empty-activity p {
          font-size: 0.9rem;
        }
        
        /* Dark mode adjustments */
        html[data-theme="dark"] .activity-stat-card,
        html[data-theme="dark"] .most-visited-section,
        html[data-theme="dark"] .trending-section {
          background: var(--surface-dark, #1e293b);
          border-color: var(--border-dark, #334155);
        }
        
        html[data-theme="dark"] .visited-count,
        html[data-theme="dark"] .trending-score {
          background: var(--bg-dark, #0f172a);
        }
      `;
      document.head.appendChild(styles);
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
