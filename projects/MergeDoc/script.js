
        // Application state
        const state = {
            files: [],
            isProcessing: false,
            mergedPDF: null
        };

        // DOM Elements
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const fileListContainer = document.getElementById('fileListContainer');
        const fileCount = document.getElementById('fileCount');
        const mergeControls = document.getElementById('mergeControls');
        const mergeBtn = document.getElementById('mergeBtn');
        const reorderBtn = document.getElementById('reorderBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');
        const outputSection = document.getElementById('outputSection');
        const downloadBtn = document.getElementById('downloadBtn');
        const newMergeBtn = document.getElementById('newMergeBtn');
        const outputFileName = document.getElementById('outputFileName');
        const pageCount = document.getElementById('pageCount');
        const fileSize = document.getElementById('fileSize');

        // Initialize
        function init() {
            setupEventListeners();
        }

        // Setup event listeners
        function setupEventListeners() {
            // File input click
            dropZone.addEventListener('click', () => fileInput.click());
            
            // File input change
            fileInput.addEventListener('change', handleFileSelect);
            
            // Drag and drop events
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });
            
            // Highlight drop zone
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });
            
            // Handle drop
            dropZone.addEventListener('drop', handleDrop, false);
            
            // Merge button
            mergeBtn.addEventListener('click', mergePDFs);
            
            // Reorder button
            reorderBtn.addEventListener('click', toggleReorder);
            
            // Download button
            downloadBtn.addEventListener('click', downloadPDF);
            
            // New merge button
            newMergeBtn.addEventListener('click', resetApp);
        }

        // Prevent default drag behaviors
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop zone
        function highlight() {
            dropZone.classList.add('drag-over');
        }

        // Unhighlight drop zone
        function unhighlight() {
            dropZone.classList.remove('drag-over');
        }

        // Handle dropped files
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = Array.from(dt.files).filter(file => file.type === 'application/pdf');
            addFiles(files);
        }

        // Handle file selection
        function handleFileSelect(e) {
            const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
            addFiles(files);
            fileInput.value = '';
        }

        // Add files to state and UI
        function addFiles(newFiles) {
            if (newFiles.length === 0) {
                alert('Please select PDF files only.');
                return;
            }
            
            // Limit to 10 files
            if (state.files.length + newFiles.length > 10) {
                alert('You can only merge up to 10 PDF files at a time.');
                return;
            }
            
            newFiles.forEach(file => {
                if (file.size > 50 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
                    return;
                }
                
                // Add to state with unique ID
                state.files.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: formatFileSize(file.size),
                    order: state.files.length + 1
                });
            });
            
            updateUI();
        }

        // Remove a file
        function removeFile(id) {
            state.files = state.files.filter(file => file.id !== id);
            
            // Update order numbers
            state.files.forEach((file, index) => {
                file.order = index + 1;
            });
            
            updateUI();
        }

        // Move file up in order
        function moveFileUp(id) {
            const index = state.files.findIndex(file => file.id === id);
            if (index <= 0) return;
            
            // Swap with previous file
            [state.files[index], state.files[index - 1]] = [state.files[index - 1], state.files[index]];
            
            // Update order numbers
            state.files.forEach((file, i) => {
                file.order = i + 1;
            });
            
            updateUI();
        }

        // Move file down in order
        function moveFileDown(id) {
            const index = state.files.findIndex(file => file.id === id);
            if (index >= state.files.length - 1) return;
            
            // Swap with next file
            [state.files[index], state.files[index + 1]] = [state.files[index + 1], state.files[index]];
            
            // Update order numbers
            state.files.forEach((file, i) => {
                file.order = i + 1;
            });
            
            updateUI();
        }

        // Update UI based on state
        function updateUI() {
            // Clear file list
            fileList.innerHTML = '';
            
            // Add files to UI
            state.files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors';
                fileElement.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-file-pdf text-red-500"></i>
                        </div>
                        <div>
                            <h5 class="font-medium text-gray-800 truncate max-w-xs">${file.name}</h5>
                            <p class="text-sm text-gray-500">${file.size} • #${file.order}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="move-up-btn px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg" data-id="${file.id}">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="move-down-btn px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg" data-id="${file.id}">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="remove-btn px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg" data-id="${file.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                fileList.appendChild(fileElement);
            });
            
            // Update file count
            fileCount.textContent = state.files.length;
            
            // Show/hide containers
            if (state.files.length > 0) {
                fileListContainer.classList.remove('hidden');
                mergeControls.classList.remove('hidden');
            } else {
                fileListContainer.classList.add('hidden');
                mergeControls.classList.add('hidden');
                outputSection.classList.add('hidden');
            }
            
            // Add event listeners to new buttons
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFile(e.currentTarget.dataset.id);
                });
            });
            
            document.querySelectorAll('.move-up-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    moveFileUp(e.currentTarget.dataset.id);
                });
            });
            
            document.querySelectorAll('.move-down-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    moveFileDown(e.currentTarget.dataset.id);
                });
            });
            
            // Update merge button text
            mergeBtn.innerHTML = `<i class="fas fa-magic mr-2"></i>Merge ${state.files.length} PDF${state.files.length !== 1 ? 's' : ''}`;
        }

        // Toggle reorder mode
        function toggleReorder() {
            const moveButtons = document.querySelectorAll('.move-up-btn, .move-down-btn');
            const isHidden = moveButtons[0].classList.contains('hidden');
            
            moveButtons.forEach(btn => {
                if (isHidden) {
                    btn.classList.remove('hidden');
                } else {
                    btn.classList.add('hidden');
                }
            });
            
            reorderBtn.innerHTML = isHidden 
                ? '<i class="fas fa-random mr-2"></i>Re-order' 
                : '<i class="fas fa-check mr-2"></i>Done Re-ordering';
        }

        // Merge PDFs
        async function mergePDFs() {
            if (state.isProcessing) return;
            if (state.files.length === 0) return;
            
            state.isProcessing = true;
            
            // Show progress
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '0%';
            progressPercent.textContent = '0%';
            progressText.textContent = 'Initializing PDF library...';
            
            try {
                // Create new PDF document
                const { PDFDocument } = PDFLib;
                const mergedPdf = await PDFDocument.create();
                
                let totalPages = 0;
                
                // Process each file in order
                for (let i = 0; i < state.files.length; i++) {
                    const file = state.files[i];
                    
                    // Update progress
                    const progress = Math.round((i / state.files.length) * 100);
                    progressBar.style.width = `${progress}%`;
                    progressPercent.textContent = `${progress}%`;
                    progressText.textContent = `Processing: ${file.name} (${i + 1} of ${state.files.length})`;
                    
                    try {
                        // Read the file as array buffer
                        const arrayBuffer = await file.file.arrayBuffer();
                        
                        // Load the PDF
                        const pdf = await PDFDocument.load(arrayBuffer);
                        
                        // Get all pages
                        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        
                        // Add each page to the merged document
                        pages.forEach(page => {
                            mergedPdf.addPage(page);
                            totalPages++;
                        });
                        
                    } catch (error) {
                        console.error(`Error processing ${file.name}:`, error);
                        progressText.textContent = `Error with ${file.name}: ${error.message}`;
                        // Continue with next file
                    }
                    
                    // Small delay to show progress
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Finalize progress
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                progressText.textContent = 'Finalizing merged document...';
                
                // Save the merged PDF
                const mergedPdfBytes = await mergedPdf.save();
                
                // Store the result
                state.mergedPDF = mergedPdfBytes;
                
                // Create blob for download
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                state.mergedBlob = blob;
                
                // Update output section
                outputFileName.textContent = `merged-${Date.now()}.pdf`;
                pageCount.textContent = totalPages;
                fileSize.textContent = formatFileSize(blob.size);
                
                // Hide progress, show output
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    outputSection.classList.remove('hidden');
                    
                    // Scroll to output
                    outputSection.scrollIntoView({ behavior: 'smooth' });
                    
                    state.isProcessing = false;
                }, 500);
                
            } catch (error) {
                console.error('Error merging PDFs:', error);
                progressText.textContent = `Error: ${error.message}`;
                progressText.className = 'text-sm text-red-500 mt-2';
                state.isProcessing = false;
                
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                }, 3000);
            }
        }

        // Download the merged PDF
        function downloadPDF() {
            if (!state.mergedBlob) return;
            
            const url = URL.createObjectURL(state.mergedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputFileName.textContent;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Reset the application
        function resetApp() {
            state.files = [];
            state.mergedPDF = null;
            state.mergedBlob = null;
            state.isProcessing = false;
            
            fileList.innerHTML = '';
            fileListContainer.classList.add('hidden');
            mergeControls.classList.add('hidden');
            outputSection.classList.add('hidden');
            progressContainer.classList.add('hidden');
            
            // Reset progress bar
            progressBar.style.width = '0%';
            progressPercent.textContent = '0%';
            progressText.textContent = 'Preparing to merge files...';
            progressText.className = 'text-sm text-gray-500 mt-2';
        }

        // Format file size
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', init);
    