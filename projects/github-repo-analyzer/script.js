// GitHub Repo Analyzer
class GitHubAnalyzer {
    constructor() {
        // GitHub API endpoints
        this.GITHUB_API = 'https://api.github.com/repos';
        
        // DOM Elements
        this.repoUrlInput = document.getElementById('repoUrl');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        // Result elements
        this.repoNameEl = document.getElementById('repoName');
        this.repoDescEl = document.getElementById('repoDescription');
        this.starsEl = document.getElementById('stars');
        this.forksEl = document.getElementById('forks');
        this.watchersEl = document.getElementById('watchers');
        this.recentCommitsEl = document.getElementById('recentCommits');
        this.languagesEl = document.getElementById('languages');
        this.repoSizeEl = document.getElementById('repoSize');
        this.createdAtEl = document.getElementById('createdAt');
        this.updatedAtEl = document.getElementById('updatedAt');
        this.licenseEl = document.getElementById('license');
        this.repoSummaryEl = document.getElementById('repoSummary');
        this.errorTitleEl = document.getElementById('errorTitle');
        this.errorMessageEl = document.getElementById('errorMessage');
        
        // Health bars
        this.activityBar = document.getElementById('activityBar');
        this.popularityBar = document.getElementById('popularityBar');
        this.maintenanceBar = document.getElementById('maintenanceBar');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.analyzeBtn.addEventListener('click', () => this.analyzeRepository());
        this.repoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzeRepository();
        });
        
        // Load from URL parameter if present
        this.loadFromURL();
    }
    
    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');
        if (repoParam) {
            this.repoUrlInput.value = repoParam;
            setTimeout(() => this.analyzeRepository(), 800);
        }
    }
    
    async analyzeRepository() {
        const repoUrl = this.repoUrlInput.value.trim();
        
        if (!repoUrl) {
            this.showError('Input Required', 'Please enter a GitHub repository URL');
            return;
        }
        
        // Extract owner and repo from URL
        let owner, repo;
        
        if (repoUrl.includes('github.com/')) {
            const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                this.showError('Invalid URL', 'Please enter a valid GitHub repository URL');
                return;
            }
            [, owner, repo] = match;
        } else {
            // Assume format is "owner/repo"
            const parts = repoUrl.split('/');
            if (parts.length !== 2) {
                this.showError('Invalid Format', 'Please use format: username/repository');
                return;
            }
            [owner, repo] = parts;
        }
        
        // Clean up repo name (remove .git if present)
        repo = repo.replace(/\.git$/, '');
        
        // Show loading state
        this.setLoading(true);
        this.hideResults();
        this.hideError();
        
        try {
            // Fetch repository data with timeout
            const repoData = await Promise.race([
                this.fetchData(`${this.GITHUB_API}/${owner}/${repo}`),
                this.timeout(10000)
            ]);
            
            // Fetch additional data in parallel
            const [languages, commits, contributors] = await Promise.all([
                this.fetchData(`${this.GITHUB_API}/${owner}/${repo}/languages`).catch(() => ({})),
                this.fetchData(`${this.GITHUB_API}/${owner}/${repo}/commits?per_page=5`).catch(() => []),
                this.fetchData(`${this.GITHUB_API}/${owner}/${repo}/contributors?per_page=1`).catch(() => [])
            ]);
            
            // Update UI with fetched data
            this.updateUI(repoData, languages, commits, contributors);
            
            // Show results
            this.showResults();
            
            // Update URL with repo parameter
            this.updateURL(owner, repo);
            
        } catch (error) {
            console.error('Error analyzing repository:', error);
            this.showError(
                'Analysis Failed',
                error.message || 'Could not fetch repository data. Please check the URL and try again.'
            );
        } finally {
            this.setLoading(false);
        }
    }
    
    timeout(ms) {
        return new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
        );
    }
    
    async fetchData(url) {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Repo-Analyzer'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Repository not found');
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else if (response.status === 401) {
                throw new Error('Access denied. Repository might be private.');
            } else {
                throw new Error(`GitHub API error: ${response.status}`);
            }
        }
        
        return response.json();
    }
    
    updateUI(repoData, languages, commits, contributors) {
        // Basic repository info
        this.repoNameEl.textContent = repoData.full_name || repoData.name;
        this.repoDescEl.textContent = repoData.description || 'No description provided';
        
        // Statistics
        this.starsEl.textContent = this.formatNumber(repoData.stargazers_count);
        this.forksEl.textContent = this.formatNumber(repoData.forks_count);
        this.watchersEl.textContent = this.formatNumber(repoData.watchers_count);
        
        // Repository details
        this.repoSizeEl.textContent = this.formatSize(repoData.size);
        this.createdAtEl.textContent = new Date(repoData.created_at).toLocaleDateString();
        this.updatedAtEl.textContent = new Date(repoData.updated_at).toLocaleDateString();
        this.licenseEl.textContent = repoData.license?.name || 'Not specified';
        
        // Recent commits
        this.updateRecentCommits(commits);
        
        // Languages
        this.updateLanguages(languages);
        
        // Health indicators
        this.updateHealthIndicators(repoData, commits, contributors);
        
        // Repository summary
        this.updateSummary(repoData, languages, commits, contributors);
    }
    
    updateRecentCommits(commits) {
        this.recentCommitsEl.innerHTML = '';
        
        if (!Array.isArray(commits) || commits.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No recent commits found';
            this.recentCommitsEl.appendChild(li);
            return;
        }
        
        commits.slice(0, 5).forEach(commit => {
            const li = document.createElement('li');
            const message = commit.commit.message.split('\n')[0];
            const shortHash = commit.sha.substring(0, 7);
            li.innerHTML = `
                <span class="commit-hash">${shortHash}</span>
                <span class="commit-message">${this.truncateText(message, 40)}</span>
            `;
            this.recentCommitsEl.appendChild(li);
        });
    }
    
    updateLanguages(languages) {
        this.languagesEl.innerHTML = '';
        
        if (!languages || Object.keys(languages).length === 0) {
            const div = document.createElement('div');
            div.className = 'language-tag';
            div.textContent = 'No language data';
            this.languagesEl.appendChild(div);
            return;
        }
        
        // Calculate total bytes
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
        
        // Get top 4 languages
        const topLanguages = Object.entries(languages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4);
        
        topLanguages.forEach(([lang, bytes]) => {
            const percentage = Math.round((bytes / totalBytes) * 100);
            const div = document.createElement('div');
            div.className = 'language-tag';
            div.textContent = `${lang} ${percentage}%`;
            this.languagesEl.appendChild(div);
        });
    }
    
    updateHealthIndicators(repoData, commits, contributors) {
        // Calculate activity based on last update
        const daysSinceUpdate = Math.floor((new Date() - new Date(repoData.updated_at)) / (1000 * 60 * 60 * 24));
        const activityScore = Math.max(0, 100 - (daysSinceUpdate * 2));
        this.activityBar.style.width = `${Math.min(activityScore, 100)}%`;
        
        // Calculate popularity based on stars
        const popularityScore = Math.min(Math.log10(repoData.stargazers_count + 1) * 20, 100);
        this.popularityBar.style.width = `${popularityScore}%`;
        
        // Calculate maintenance based on contributors and issues
        const hasContributors = Array.isArray(contributors) && contributors.length > 0;
        const maintenanceScore = hasContributors ? 70 : 30;
        this.maintenanceBar.style.width = `${Math.max(Math.min(maintenanceScore, 100), 0)}%`;
    }
    
    updateSummary(repoData, languages, commits, contributors) {
        const langCount = Object.keys(languages || {}).length;
        const commitCount = Array.isArray(commits) ? 'recent' : 'no';
        const contributorCount = Array.isArray(contributors) ? contributors.length : 0;
        
        const isPopular = repoData.stargazers_count > 1000;
        const isActive = new Date(repoData.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const hasMultipleContributors = contributorCount > 1;
        
        let summary = `This ${isPopular ? 'popular' : ''} repository has ${this.formatNumber(repoData.stargazers_count)} stars and ${this.formatNumber(repoData.forks_count)} forks. `;
        
        if (langCount > 0) {
            const mainLang = Object.keys(languages)[0];
            summary += `Primarily written in ${mainLang} ${langCount > 1 ? `along with ${langCount - 1} other language${langCount > 2 ? 's' : ''}` : ''}. `;
        }
        
        summary += `It has ${commitCount} activity and ${isActive ? 'was recently updated' : 'hasn\'t been updated recently'}. `;
        
        if (hasMultipleContributors) {
            summary += `The project is maintained by ${contributorCount} contributor${contributorCount > 1 ? 's' : ''}.`;
        }
        
        this.repoSummaryEl.textContent = summary;
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toLocaleString();
    }
    
    formatSize(kb) {
        if (kb >= 1024) {
            return (kb / 1024).toFixed(1) + ' MB';
        }
        return kb + ' KB';
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    updateURL(owner, repo) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('repo', `${owner}/${repo}`);
        window.history.pushState({}, '', newUrl);
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.analyzeBtn.classList.add('loading');
            this.analyzeBtn.disabled = true;
        } else {
            this.analyzeBtn.classList.remove('loading');
            this.analyzeBtn.disabled = false;
        }
    }
    
    showResults() {
        this.resultsSection.style.display = 'block';
    }
    
    hideResults() {
        this.resultsSection.style.display = 'none';
    }
    
    showError(title, message) {
        this.errorTitleEl.textContent = title;
        this.errorMessageEl.textContent = message;
        this.errorSection.style.display = 'block';
    }
    
    hideError() {
        this.errorSection.style.display = 'none';
    }
}

// Initialize the analyzer when page loads
window.addEventListener('load', () => {
    new GitHubAnalyzer();
});