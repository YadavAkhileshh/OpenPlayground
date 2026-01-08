// File Uploader - REAL WORKING VERSION
class FileUploader {
    constructor() {
        this.files = []; // Array to store uploaded files
        this.currentUploads = []; // Files currently being uploaded
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.maxTotalStorage = 10 * 1024 * 1024; // 10MB (simulated)
        this.isUploading = false;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupDragAndDrop();
        this.loadFromLocalStorage();
        this.updateUI();
        this.showToast('File Uploader Ready', 'success');
    }
    
    cacheElements() {
        // File input
        this.fileInput = document.getElementById('fileInput');
        
        // Buttons
        this.browseBtn = document.getElementById('browseBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.closePreview = document.getElementById('closePreview');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // Areas
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.filesGrid = document.getElementById('filesGrid');
        this.emptyState = document.getElementById('emptyState');
        this.previewModal = document.getElementById('previewModal');
        this.previewContainer = document.getElementById('previewContainer');
        this.fileInfo = document.getElementById('fileInfo');
        this.previewTitle = document.getElementById('previewTitle');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.currentFile = document.getElementById('currentFile');
        this.uploadStats = document.getElementById('uploadStats');
        
        // Storage elements
        this.storageFill = document.getElementById('storageFill');
        this.storageText = document.getElementById('storageText');
        this.totalFiles = document.getElementById('totalFiles');
        this.totalSize = document.getElementById('totalSize');
        this.lastUpload = document.getElementById('lastUpload');
        
        // Current file being previewed
        this.currentPreviewFile = null;
    }
    
    bindEvents() {
        // File selection
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Upload controls
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.cancelBtn.addEventListener('click', () => this.cancelUpload());
        
        // File management
        this.refreshBtn.addEventListener('click', () => this.refreshFiles());
        this.clearAllBtn.addEventListener('click', () => this.clearAllFiles());
        
        // Preview modal
        this.closePreview.addEventListener('click', () => this.hidePreview());
        this.downloadBtn.addEventListener('click', () => this.downloadFile());
        this.deleteBtn.addEventListener('click', () => this.deleteFile());
        
        // Close modal on outside click
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                this.hidePreview();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.previewModal.style.display === 'flex') {
                this.hidePreview();
            }
        });
    }
    
    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('dragover');
            }, false);
        });
        
        // Handle dropped files
        this.uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        }, false);
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.handleFiles(files);
        event.target.value = ''; // Reset input
    }
    
    handleFiles(files) {
        const validFiles = [];
        const errors = [];
        
        // Calculate current storage usage
        const currentStorage = this.files.reduce((sum, file) => sum + file.size, 0);
        
        files.forEach(file => {
            // Check file size
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name} exceeds 5MB limit`);
                return;
            }
            
            // Check total storage
            if (currentStorage + file.size > this.maxTotalStorage) {
                errors.push('Storage limit reached');
                return;
            }
            
            // Check for duplicate names (optional)
            const isDuplicate = this.files.some(f => f.name === file.name);
            if (isDuplicate) {
                const newName = this.generateUniqueName(file.name);
                file = new File([file], newName, { type: file.type });
            }
            
            validFiles.push(file);
        });
        
        // Show errors
        errors.forEach(error => {
            this.showToast(error, 'error');
        });
        
        // Upload valid files
        if (validFiles.length > 0) {
            this.uploadFiles(validFiles);
        }
    }
    
    generateUniqueName(filename) {
        const timestamp = Date.now();
        const extension = filename.split('.').pop();
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        return `${nameWithoutExt}_${timestamp}.${extension}`;
    }
    
    uploadFiles(files) {
        if (files.length === 0) return;
        
        this.isUploading = true;
        this.isPaused = false;
        this.uploadProgress.style.display = 'block';
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Add files to current uploads
        files.forEach(file => {
            this.currentUploads.push({
                file: file,
                progress: 0,
                uploaded: false,
                error: null
            });
        });
        
        // Start uploading each file
        this.uploadNextFile();
    }
    
    uploadNextFile() {
        if (this.isPaused || !this.isUploading) return;
        
        const upload = this.currentUploads.find(u => !u.uploaded && !u.error);
        
        if (!upload) {
            // All files uploaded
            this.finishUpload();
            return;
        }
        
        this.currentFile.textContent = `Uploading: ${upload.file.name}`;
        
        // Simulate upload with progress (in real app, this would be XMLHttpRequest or fetch)
        const totalSize = upload.file.size;
        let uploaded = 0;
        const chunkSize = 1024 * 1024; // 1MB chunks
        const totalTime = 2000 + (totalSize / (1024 * 1024)) * 500; // Simulate time
        
        const uploadInterval = setInterval(() => {
            if (this.isPaused || !this.isUploading) {
                clearInterval(uploadInterval);
                return;
            }
            
            // Simulate upload progress
            uploaded += chunkSize;
            if (uploaded > totalSize) uploaded = totalSize;
            
            const percent = Math.round((uploaded / totalSize) * 100);
            upload.progress = percent;
            
            // Update progress UI
            this.updateUploadProgress();
            
            // Simulate upload speed
            const speed = Math.random() * 2 + 1; // 1-3 MB/s
            this.uploadStats.textContent = `Speed: ${speed.toFixed(1)} MB/s`;
            
            if (uploaded >= totalSize) {
                clearInterval(uploadInterval);
                this.completeFileUpload(upload);
            }
        }, totalTime / 100); // Update 100 times
        
        upload.intervalId = uploadInterval;
    }
    
    completeFileUpload(upload) {
        upload.uploaded = true;
        
        // Create file object
        const fileObj = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: upload.file.name,
            size: upload.file.size,
            type: this.getFileType(upload.file),
            date: new Date().toISOString(),
            data: null // In real app, this would be the actual file data
        };
        
        // Read file as DataURL for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            fileObj.data = e.target.result;
            this.files.push(fileObj);
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Update UI
            this.updateUI();
            
            // Upload next file
            setTimeout(() => {
                this.uploadNextFile();
            }, 500);
            
            this.showToast(`${upload.file.name} uploaded successfully`, 'success');
        };
        
        reader.readAsDataURL(upload.file);
    }
    
    updateUploadProgress() {
        if (this.currentUploads.length === 0) return;
        
        const totalProgress = this.currentUploads.reduce((sum, u) => sum + u.progress, 0);
        const averageProgress = Math.round(totalProgress / this.currentUploads.length);
        
        this.progressFill.style.width = `${averageProgress}%`;
        this.progressPercent.textContent = `${averageProgress}%`;
        
        // Update storage bar
        this.updateStorageBar();
    }
    
    finishUpload() {
        this.isUploading = false;
        this.currentUploads = [];
        
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
            this.showToast('All files uploaded successfully!', 'success');
        }, 1000);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            this.showToast('Upload paused', 'warning');
        } else {
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.showToast('Upload resumed', 'info');
            this.uploadNextFile();
        }
    }
    
    cancelUpload() {
        if (confirm('Are you sure you want to cancel the upload?')) {
            this.isUploading = false;
            this.isPaused = false;
            this.currentUploads = [];
            this.uploadProgress.style.display = 'none';
            this.showToast('Upload cancelled', 'error');
        }
    }
    
    getFileType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.includes('pdf')) return 'pdf';
        if (file.type.includes('document') || file.type.includes('text')) return 'document';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.includes('zip') || file.type.includes('compressed')) return 'archive';
        return 'other';
    }
    
    getFileIcon(type) {
        const icons = {
            'image': 'fas fa-image',
            'pdf': 'fas fa-file-pdf',
            'document': 'fas fa-file-alt',
            'video': 'fas fa-video',
            'archive': 'fas fa-file-archive',
            'other': 'fas fa-file'
        };
        return icons[type] || 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    updateUI() {
        this.updateFileGrid();
        this.updateStorageBar();
        this.updateStats();
    }
    
    updateFileGrid() {
        this.filesGrid.innerHTML = '';
        
        if (this.files.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        // Show files in reverse order (newest first)
        this.files.slice().reverse().forEach((file, index) => {
            const fileElement = this.createFileElement(file);
            this.filesGrid.appendChild(fileElement);
        });
    }
    
    createFileElement(file) {
        const div = document.createElement('div');
        div.className = 'file-card';
        div.dataset.id = file.id;
        
        const fileSize = this.formatFileSize(file.size);
        const fileDate = this.formatDate(file.date);
        
        div.innerHTML = `
            <div class="file-header">
                <div class="file-icon ${file.type}">
                    <i class="${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    <div class="file-date">${fileDate}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn preview" onclick="uploader.previewFile('${file.id}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button class="file-action-btn download" onclick="uploader.downloadFileById('${file.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="file-action-btn delete" onclick="uploader.deleteFileById('${file.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return div;
    }
    
    updateStorageBar() {
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        const percent = Math.round((totalSize / this.maxTotalStorage) * 100);
        
        this.storageFill.style.width = `${percent}%`;
        this.storageText.textContent = `Storage: ${this.formatFileSize(totalSize)} / ${this.formatFileSize(this.maxTotalStorage)}`;
        
        // Change color if storage is almost full
        if (percent > 90) {
            this.storageFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e53)';
        } else if (percent > 70) {
            this.storageFill.style.background = 'linear-gradient(90deg, #ffd166, #ffb347)';
        } else {
            this.storageFill.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
        }
    }
    
    updateStats() {
        this.totalFiles.textContent = this.files.length;
        
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        this.totalSize.textContent = this.formatFileSize(totalSize);
        
        if (this.files.length > 0) {
            const lastFile = this.files[this.files.length - 1];
            this.lastUpload.textContent = this.formatDate(lastFile.date);
        } else {
            this.lastUpload.textContent = 'Never';
        }
    }
    
    previewFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;
        
        this.currentPreviewFile = file;
        this.previewTitle.textContent = file.name;
        
        // Clear previous content
        this.previewContainer.innerHTML = '';
        this.fileInfo.innerHTML = '';
        
        // Create preview based on file type
        if (file.type === 'image' && file.data) {
            const img = document.createElement('img');
            img.src = file.data;
            img.className = 'preview-image';
            img.alt = file.name;
            this.previewContainer.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'preview-placeholder';
            placeholder.innerHTML = `
                <i class="${this.getFileIcon(file.type)}"></i>
                <p>Preview not available for ${file.type} files</p>
            `;
            this.previewContainer.appendChild(placeholder);
        }
        
        // Create file info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'file-info-details';
        infoDiv.innerHTML = `
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${file.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${file.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Size:</span>
                <span class="info-value">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Uploaded:</span>
                <span class="info-value">${this.formatDate(file.date)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">ID:</span>
                <span class="info-value">${file.id.substring(0, 8)}...</span>
            </div>
        `;
        this.fileInfo.appendChild(infoDiv);
        
        // Show modal
        this.previewModal.style.display = 'flex';
    }
    
    hidePreview() {
        this.previewModal.style.display = 'none';
        this.currentPreviewFile = null;
    }
    
    downloadFile() {
        if (!this.currentPreviewFile) return;
        this.downloadFileById(this.currentPreviewFile.id);
        this.hidePreview();
    }
    
    downloadFileById(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file || !file.data) return;
        
        // Create download link
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`Downloading ${file.name}`, 'info');
    }
    
    deleteFile() {
        if (!this.currentPreviewFile) return;
        this.deleteFileById(this.currentPreviewFile.id);
        this.hidePreview();
    }
    
    deleteFileById(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        const index = this.files.findIndex(f => f.id === fileId);
        if (index === -1) return;
        
        const fileName = this.files[index].name;
        this.files.splice(index, 1);
        
        this.saveToLocalStorage();
        this.updateUI();
        
        this.showToast(`Deleted ${fileName}`, 'success');
    }
    
    refreshFiles() {
        this.updateUI();
        this.showToast('Files refreshed', 'info');
    }
    
    clearAllFiles() {
        if (this.files.length === 0) {
            this.showToast('No files to clear', 'warning');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete all ${this.files.length} files?`)) return;
        
        this.files = [];
        this.saveToLocalStorage();
        this.updateUI();
        
        this.showToast('All files deleted', 'success');
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-times-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlide 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'toastSlide 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
    
    saveToLocalStorage() {
        try {
            // Store only essential data (files are stored as DataURLs)
            const data = {
                files: this.files.map(file => ({
                    id: file.id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    date: file.date,
                    data: file.data
                })),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('fileUploaderData', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.showToast('Error saving files (localStorage full?)', 'error');
        }
    }
    
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('fileUploaderData');
            if (data) {
                const parsed = JSON.parse(data);
                this.files = parsed.files || [];
                
                // Validate loaded data
                this.files = this.files.filter(file => 
                    file && file.id && file.name && file.size && file.data
                );
                
                if (this.files.length > 0) {
                    this.showToast(`Loaded ${this.files.length} files from storage`, 'info');
                }
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            // Clear corrupted data
            localStorage.removeItem('fileUploaderData');
            this.files = [];
        }
    }
}

// Initialize the uploader when page loads
let uploader;
window.addEventListener('DOMContentLoaded', () => {
    uploader = new FileUploader();
    window.uploader = uploader; // Make it globally available for onclick handlers
    
    // Add some demo files on first load if empty
    if (uploader.files.length === 0) {
        // Uncomment to add demo files on first load
        // uploader.showToast('Try dragging files here or clicking "Select Files"!', 'info');
    }
});