// E-Signature Platform - Main JavaScript

// Global Variables
let currentDocument = null;
let signers = [];
let signatureFields = [];
let currentSignerIndex = 0;
let selectedField = null;
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let canvas = null;
let ctx = null;
let signatureCanvas = null;
let signatureCtx = null;
let currentSignature = null;
let userSignatures = [];

// Sample Data
const sampleDocuments = [
    {
        id: 1,
        title: "Employment Agreement",
        status: "completed",
        sentDate: "2023-11-15",
        expiryDate: "2023-11-22",
        signers: 3,
        completedSigners: 3,
        fields: 5
    },
    {
        id: 2,
        title: "NDA with TechCorp",
        status: "in-progress",
        sentDate: "2023-11-18",
        expiryDate: "2023-11-25",
        signers: 2,
        completedSigners: 1,
        fields: 4
    },
    {
        id: 3,
        title: "Service Contract",
        status: "pending",
        sentDate: "2023-11-20",
        expiryDate: "2023-11-27",
        signers: 2,
        completedSigners: 0,
        fields: 6
    }
];

// DOM Elements
const dom = {
    // Dashboard
    newDocumentBtn: document.getElementById('newDocumentBtn'),
    pendingCount: document.getElementById('pendingCount'),
    inProgressCount: document.getElementById('inProgressCount'),
    completedCount: document.getElementById('completedCount'),
    expiredCount: document.getElementById('expiredCount'),
    recentDocuments: document.getElementById('recentDocuments'),
    
    // Modals
    uploadModal: document.getElementById('uploadModal'),
    signersModal: document.getElementById('signersModal'),
    fieldsModal: document.getElementById('fieldsModal'),
    sendModal: document.getElementById('sendModal'),
    signatureModal: document.getElementById('signatureModal'),
    trackModal: document.getElementById('trackModal'),
    documentViewer: document.getElementById('documentViewer'),
    
    // Modal close buttons
    modalCloses: document.querySelectorAll('.modal-close'),
    viewerClose: document.querySelector('.viewer-close'),
    
    // Upload Modal
    documentInput: document.getElementById('documentInput'),
    documentDropArea: document.getElementById('documentDropArea'),
    selectedFileContainer: document.getElementById('selectedFileContainer'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFileBtn: document.getElementById('removeFileBtn'),
    cancelUploadBtn: document.getElementById('cancelUploadBtn'),
    nextStepBtn: document.getElementById('nextStepBtn'),
    uploadOptions: document.querySelectorAll('.upload-option'),
    
    // Signers Modal
    signersList: document.getElementById('signersList'),
    signerName: document.getElementById('signerName'),
    signerEmail: document.getElementById('signerEmail'),
    signerRole: document.getElementById('signerRole'),
    signerMessage: document.getElementById('signerMessage'),
    addSignerBtn: document.getElementById('addSignerBtn'),
    backToUploadBtn: document.getElementById('backToUploadBtn'),
    nextToFieldsBtn: document.getElementById('nextToFieldsBtn'),
    
    // Fields Modal
    previewCanvas: document.getElementById('previewCanvas'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageInfo: document.getElementById('pageInfo'),
    fieldsList: document.getElementById('fieldsList'),
    fieldSettings: document.getElementById('fieldSettings'),
    fieldRequired: document.getElementById('fieldRequired'),
    assignTo: document.getElementById('assignTo'),
    removeFieldBtn: document.getElementById('removeFieldBtn'),
    backToSignersBtn: document.getElementById('backToSignersBtn'),
    nextToSendBtn: document.getElementById('nextToSendBtn'),
    fieldTypes: document.querySelectorAll('.field-type'),
    
    // Send Modal
    documentTitle: document.getElementById('documentTitle'),
    senderMessage: document.getElementById('senderMessage'),
    expiryDate: document.getElementById('expiryDate'),
    reminderFrequency: document.getElementById('reminderFrequency'),
    emailNotifications: document.getElementById('emailNotifications'),
    smsNotifications: document.getElementById('smsNotifications'),
    allSignersComplete: document.getElementById('allSignersComplete'),
    summaryFileName: document.getElementById('summaryFileName'),
    summarySignersCount: document.getElementById('summarySignersCount'),
    summaryFieldsCount: document.getElementById('summaryFieldsCount'),
    summaryExpiry: document.getElementById('summaryExpiry'),
    backToFieldsBtn2: document.getElementById('backToFieldsBtn'),
    sendDocumentBtn: document.getElementById('sendDocumentBtn'),
    
    // Signature Modal
    signatureCanvas: document.getElementById('signatureCanvas'),
    clearCanvasBtn: document.getElementById('clearCanvasBtn'),
    undoCanvasBtn: document.getElementById('undoCanvasBtn'),
    penColor: document.getElementById('penColor'),
    penSize: document.getElementById('penSize'),
    signatureFont: document.getElementById('signatureFont'),
    fontColor: document.getElementById('fontColor'),
    signatureText: document.getElementById('signatureText'),
    typePreview: document.getElementById('typePreview'),
    signatureImageInput: document.getElementById('signatureImageInput'),
    signatureDropArea: document.getElementById('signatureDropArea'),
    signaturePreview: document.getElementById('signaturePreview'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    signatureTabs: document.querySelectorAll('.signature-tab'),
    cancelSignatureBtn: document.getElementById('cancelSignatureBtn'),
    saveSignatureBtn: document.getElementById('saveSignatureBtn'),
    
    // Track Modal
    trackDocumentTitle: document.getElementById('trackDocumentTitle'),
    trackSentDate: document.getElementById('trackSentDate'),
    trackExpiryDate: document.getElementById('trackExpiryDate'),
    signersStatusList: document.getElementById('signersStatusList'),
    downloadSignedBtn: document.getElementById('downloadSignedBtn'),
    sendReminderBtn: document.getElementById('sendReminderBtn'),
    voidDocumentBtn: document.getElementById('voidDocumentBtn'),
    
    // Viewer
    viewerBody: document.getElementById('viewerBody')
};

// Initialize the application
function init() {
    loadSampleData();
    setupEventListeners();
    setupCanvas();
    setupDragAndDrop();
    setupSignatureCanvas();
    updateDashboardStats();
    loadRecentDocuments();
    setupExpiryDate();
}

// Load sample data
function loadSampleData() {
    // Add sample signers
    signers = [
        {
            id: 1,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "signer",
            message: "Please sign section 2 and 3",
            status: "completed",
            signedAt: "2023-11-15 14:15"
        },
        {
            id: 2,
            name: "John Doe",
            email: "john.doe@example.com",
            role: "signer",
            message: "Your signature is required on page 1",
            status: "completed",
            signedAt: "2023-11-16 09:45"
        },
        {
            id: 3,
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            role: "reviewer",
            message: "Please review and approve",
            status: "pending"
        }
    ];
    
    // Add sample signature fields
    signatureFields = [
        { id: 1, type: "signature", x: 100, y: 200, width: 200, height: 80, required: true, assignedTo: 1, page: 1 },
        { id: 2, type: "date", x: 350, y: 200, width: 120, height: 40, required: true, assignedTo: 1, page: 1 },
        { id: 3, type: "signature", x: 100, y: 400, width: 200, height: 80, required: true, assignedTo: 2, page: 1 },
        { id: 4, type: "initial", x: 350, y: 450, width: 60, height: 40, required: false, assignedTo: 3, page: 1 },
        { id: 5, type: "text", x: 100, y: 500, width: 150, height: 40, required: true, assignedTo: 2, page: 1 }
    ];
    
    // Load user signatures
    userSignatures = JSON.parse(localStorage.getItem('userSignatures')) || [];
}

// Setup event listeners
function setupEventListeners() {
    // Dashboard
    dom.newDocumentBtn.addEventListener('click', () => showModal(dom.uploadModal));
    
    // Modal navigation
    dom.modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    dom.viewerClose.addEventListener('click', () => {
        dom.documentViewer.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Upload Modal
    dom.documentInput.addEventListener('change', handleDocumentUpload);
    dom.documentDropArea.addEventListener('click', () => dom.documentInput.click());
    dom.removeFileBtn.addEventListener('click', removeSelectedFile);
    dom.cancelUploadBtn.addEventListener('click', () => hideModal(dom.uploadModal));
    dom.nextStepBtn.addEventListener('click', () => {
        hideModal(dom.uploadModal);
        showModal(dom.signersModal);
        renderSignersList();
    });
    
    dom.uploadOptions.forEach(option => {
        option.addEventListener('click', function() {
            dom.uploadOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Signers Modal
    dom.addSignerBtn.addEventListener('click', addSigner);
    dom.backToUploadBtn.addEventListener('click', () => {
        hideModal(dom.signersModal);
        showModal(dom.uploadModal);
    });
    dom.nextToFieldsBtn.addEventListener('click', () => {
        if (signers.length === 0) {
            alert('Please add at least one signer.');
            return;
        }
        hideModal(dom.signersModal);
        showModal(dom.fieldsModal);
        updateAssignToSelect();
        renderFieldsList();
        // Load sample PDF preview
        loadSamplePDF();
    });
    
    // Fields Modal
    dom.prevPageBtn.addEventListener('click', prevPage);
    dom.nextPageBtn.addEventListener('click', nextPage);
    dom.backToSignersBtn.addEventListener('click', () => {
        hideModal(dom.fieldsModal);
        showModal(dom.signersModal);
    });
    dom.nextToSendBtn.addEventListener('click', () => {
        hideModal(dom.fieldsModal);
        showModal(dom.sendModal);
        updateSendSummary();
    });
    
    // Field drag and drop
    dom.fieldTypes.forEach(field => {
        field.addEventListener('dragstart', handleFieldDragStart);
    });
    
    // Click to select field
    dom.fieldsList.addEventListener('click', (e) => {
        const fieldItem = e.target.closest('.field-item');
        if (fieldItem) {
            selectField(fieldItem.dataset.fieldId);
        }
    });
    
    dom.removeFieldBtn.addEventListener('click', removeSelectedField);
    dom.fieldRequired.addEventListener('change', updateSelectedField);
    dom.assignTo.addEventListener('change', updateSelectedField);
    
    // Send Modal
    dom.backToFieldsBtn2.addEventListener('click', () => {
        hideModal(dom.sendModal);
        showModal(dom.fieldsModal);
    });
    dom.sendDocumentBtn.addEventListener('click', sendDocumentForSigning);
    
    // Signature Modal
    dom.clearCanvasBtn.addEventListener('click', clearSignatureCanvas);
    dom.undoCanvasBtn.addEventListener('click', undoSignatureStroke);
    dom.penColor.addEventListener('input', updatePenColor);
    dom.penSize.addEventListener('input', updatePenSize);
    dom.signatureFont.addEventListener('change', updateTypeSignature);
    dom.fontColor.addEventListener('input', updateTypeSignature);
    dom.signatureText.addEventListener('input', updateTypeSignature);
    dom.signatureImageInput.addEventListener('change', handleSignatureImageUpload);
    dom.signatureDropArea.addEventListener('click', () => dom.signatureImageInput.click());
    dom.cancelSignatureBtn.addEventListener('click', () => hideModal(dom.signatureModal));
    dom.saveSignatureBtn.addEventListener('click', saveSignature);
    
    // Tab switching
    dom.tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Track Modal
    dom.downloadSignedBtn.addEventListener('click', downloadSignedDocument);
    dom.sendReminderBtn.addEventListener('click', sendReminder);
    dom.voidDocumentBtn.addEventListener('click', voidDocument);
    
    // Document viewer for recent documents
    dom.recentDocuments.addEventListener('click', (e) => {
        const documentCard = e.target.closest('.document-card');
        if (documentCard) {
            const docId = documentCard.dataset.docId;
            const document = sampleDocuments.find(d => d.id == docId);
            if (document) {
                showDocumentDetails(document);
            }
        }
    });
}

// Setup drag and drop for document upload
function setupDragAndDrop() {
    const dropArea = dom.documentDropArea;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.style.borderColor = '#4A90E2';
        dropArea.style.backgroundColor = 'rgba(74, 144, 226, 0.05)';
    }
    
    function unhighlight() {
        dropArea.style.borderColor = '#E0E0E0';
        dropArea.style.backgroundColor = '#F8F9FA';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleDocumentSelect(files);
    }
}

// Setup signature canvas
function setupSignatureCanvas() {
    signatureCanvas = dom.signatureCanvas;
    signatureCtx = signatureCanvas.getContext('2d');
    
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    let strokes = [];
    let currentStroke = [];
    
    // Mouse events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    signatureCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchend', () => {
        const mouseEvent = new MouseEvent('mouseup');
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    function startDrawing(e) {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        currentStroke = [];
        currentStroke.push({ x: lastX, y: lastY });
    }
    
    function draw(e) {
        if (!drawing) return;
        
        signatureCtx.beginPath();
        signatureCtx.moveTo(lastX, lastY);
        signatureCtx.lineTo(e.offsetX, e.offsetY);
        signatureCtx.strokeStyle = dom.penColor.value;
        signatureCtx.lineWidth = dom.penSize.value;
        signatureCtx.lineCap = 'round';
        signatureCtx.lineJoin = 'round';
        signatureCtx.stroke();
        
        [lastX, lastY] = [e.offsetX, e.offsetY];
        currentStroke.push({ x: lastX, y: lastY });
    }
    
    function stopDrawing() {
        if (drawing) {
            strokes.push([...currentStroke]);
            drawing = false;
        }
    }
    
    // Set initial pen properties
    updatePenColor();
    updatePenSize();
}

// Setup canvas for PDF preview
function setupCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.style.maxWidth = '100%';
    canvas.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    dom.previewCanvas.innerHTML = '';
    dom.previewCanvas.appendChild(canvas);
}

// Handle document upload
function handleDocumentUpload(e) {
    const files = e.target.files;
    handleDocumentSelect(files);
}

function handleDocumentSelect(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
    }
    
    currentDocument = file;
    
    // Show file info
    dom.fileName.textContent = file.name;
    dom.fileSize.textContent = formatFileSize(file.size);
    dom.selectedFileContainer.style.display = 'block';
    dom.nextStepBtn.disabled = false;
    
    // Store for summary
    dom.summaryFileName.textContent = file.name;
}

function removeSelectedFile() {
    currentDocument = null;
    dom.documentInput.value = '';
    dom.selectedFileContainer.style.display = 'none';
    dom.nextStepBtn.disabled = true;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add signer
function addSigner() {
    const name = dom.signerName.value.trim();
    const email = dom.signerEmail.value.trim();
    const role = dom.signerRole.value;
    const message = dom.signerMessage.value.trim();
    
    if (!name || !email) {
        alert('Please enter name and email.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    const newSigner = {
        id: signers.length + 1,
        name,
        email,
        role,
        message,
        status: 'pending'
    };
    
    signers.push(newSigner);
    renderSignersList();
    
    // Clear form
    dom.signerName.value = '';
    dom.signerEmail.value = '';
    dom.signerMessage.value = '';
    dom.signerName.focus();
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Render signers list
function renderSignersList() {
    dom.signersList.innerHTML = '';
    
    signers.forEach((signer, index) => {
        const signerItem = document.createElement('div');
        signerItem.className = 'signer-item';
        signerItem.innerHTML = `
            <div class="signer-info">
                <div class="signer-avatar" style="background: ${getAvatarColor(index)}">
                    ${signer.name.charAt(0).toUpperCase()}
                </div>
                <div class="signer-details">
                    <h5>${signer.name}</h5>
                    <p>${signer.email}</p>
                    <small>${signer.role} • ${signer.message || 'No message'}</small>
                </div>
            </div>
            <div class="signer-actions">
                <button class="btn-icon edit-signer" data-id="${signer.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon remove-signer" data-id="${signer.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        dom.signersList.appendChild(signerItem);
    });
    
    // Add event listeners for edit/remove buttons
    document.querySelectorAll('.edit-signer').forEach(btn => {
        btn.addEventListener('click', function() {
            const signerId = parseInt(this.dataset.id);
            editSigner(signerId);
        });
    });
    
    document.querySelectorAll('.remove-signer').forEach(btn => {
        btn.addEventListener('click', function() {
            const signerId = parseInt(this.dataset.id);
            removeSigner(signerId);
        });
    });
}

function getAvatarColor(index) {
    const colors = ['#4A90E2', '#6C63FF', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
    return colors[index % colors.length];
}

function editSigner(signerId) {
    const signer = signers.find(s => s.id === signerId);
    if (!signer) return;
    
    dom.signerName.value = signer.name;
    dom.signerEmail.value = signer.email;
    dom.signerRole.value = signer.role;
    dom.signerMessage.value = signer.message;
    
    // Remove the signer from list
    signers = signers.filter(s => s.id !== signerId);
    renderSignersList();
}

function removeSigner(signerId) {
    if (confirm('Are you sure you want to remove this signer?')) {
        signers = signers.filter(s => s.id !== signerId);
        renderSignersList();
    }
}

// Load sample PDF for preview
function loadSamplePDF() {
    // In a real app, you would load the actual PDF
    // For demo, we'll create a canvas with sample content
    canvas.width = 600;
    canvas.height = 800;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sample document
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE DOCUMENT', canvas.width / 2, 100);
    
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('This is a preview of your document.', 50, 150);
    ctx.fillText('Signature fields can be placed anywhere on the document.', 50, 180);
    
    // Draw existing fields
    renderFieldsOnCanvas();
    
    // Update page info
    totalPages = 3;
    currentPage = 1;
    updatePageInfo();
    
    // Make canvas droppable
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleCanvasDrop(e) {
    e.preventDefault();
    
    const fieldType = e.dataTransfer.getData('text/plain');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addField(fieldType, x, y);
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a field
    for (const field of signatureFields) {
        if (field.page === currentPage &&
            x >= field.x && x <= field.x + field.width &&
            y >= field.y && y <= field.y + field.height) {
            selectField(field.id);
            return;
        }
    }
    
    // If not clicked on a field, deselect
    selectedField = null;
    dom.fieldSettings.style.display = 'none';
}

function handleFieldDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
}

// Add field to document
function addField(type, x, y) {
    const fieldId = signatureFields.length + 1;
    const field = {
        id: fieldId,
        type: type,
        x: x - 50, // Center the field
        y: y - 25,
        width: 100,
        height: 50,
        required: true,
        assignedTo: signers[0]?.id || 1,
        page: currentPage
    };
    
    signatureFields.push(field);
    renderFieldsOnCanvas();
    renderFieldsList();
    selectField(fieldId);
}

function selectField(fieldId) {
    selectedField = signatureFields.find(f => f.id == fieldId);
    if (!selectedField) return;
    
    // Update field settings
    dom.fieldRequired.checked = selectedField.required;
    updateAssignToSelect();
    dom.assignTo.value = selectedField.assignedTo;
    
    // Show settings panel
    dom.fieldSettings.style.display = 'block';
    
    // Highlight field on canvas
    renderFieldsOnCanvas();
}

function updateSelectedField() {
    if (!selectedField) return;
    
    selectedField.required = dom.fieldRequired.checked;
    selectedField.assignedTo = parseInt(dom.assignTo.value);
    
    renderFieldsOnCanvas();
    renderFieldsList();
}

function removeSelectedField() {
    if (!selectedField) return;
    
    if (confirm('Are you sure you want to remove this field?')) {
        signatureFields = signatureFields.filter(f => f.id !== selectedField.id);
        selectedField = null;
        dom.fieldSettings.style.display = 'none';
        renderFieldsOnCanvas();
        renderFieldsList();
    }
}

function renderFieldsOnCanvas() {
    // Redraw canvas with fields
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sample content
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE DOCUMENT - Page ' + currentPage, canvas.width / 2, 100);
    
    // Draw fields
    signatureFields.forEach(field => {
        if (field.page !== currentPage) return;
        
        // Draw field rectangle
        ctx.strokeStyle = field.id === selectedField?.id ? '#4A90E2' : '#FF9800';
        ctx.lineWidth = field.id === selectedField?.id ? 3 : 2;
        ctx.setLineDash(field.id === selectedField?.id ? [] : [5, 5]);
        ctx.strokeRect(field.x, field.y, field.width, field.height);
        
        // Draw field label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(field.type.toUpperCase(), field.x + field.width/2, field.y + field.height/2);
        
        // Draw assigned signer initial
        const signer = signers.find(s => s.id === field.assignedTo);
        if (signer) {
            ctx.fillText(signer.name.split(' ').map(n => n[0]).join(''), 
                        field.x + field.width/2, field.y + field.height/2 + 15);
        }
    });
    
    ctx.setLineDash([]);
}

function renderFieldsList() {
    dom.fieldsList.innerHTML = '';
    
    const currentPageFields = signatureFields.filter(f => f.page === currentPage);
    
    currentPageFields.forEach(field => {
        const signer = signers.find(s => s.id === field.assignedTo);
        const fieldItem = document.createElement('div');
        fieldItem.className = `field-item ${field.id === selectedField?.id ? 'selected' : ''}`;
        fieldItem.dataset.fieldId = field.id;
        fieldItem.innerHTML = `
            <div>
                <strong>${field.type}</strong>
                <small>${signer ? signer.name : 'Unassigned'}</small>
            </div>
            <div>
                ${field.required ? '<i class="fas fa-asterisk" style="color: #F44336;"></i>' : ''}
            </div>
        `;
        dom.fieldsList.appendChild(fieldItem);
    });
}

function updateAssignToSelect() {
    dom.assignTo.innerHTML = '';
    
    signers.forEach(signer => {
        const option = document.createElement('option');
        option.value = signer.id;
        option.textContent = `${signer.name} (${signer.role})`;
        dom.assignTo.appendChild(option);
    });
}

// PDF navigation
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePageInfo();
        renderFieldsOnCanvas();
        renderFieldsList();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePageInfo();
        renderFieldsOnCanvas();
        renderFieldsList();
    }
}

function updatePageInfo() {
    dom.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    dom.prevPageBtn.disabled = currentPage === 1;
    dom.nextPageBtn.disabled = currentPage === totalPages;
}

// Update send summary
function updateSendSummary() {
    dom.summarySignersCount.textContent = signers.length;
    dom.summaryFieldsCount.textContent = signatureFields.length;
    
    // Calculate expiry date (7 days from now by default)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    dom.summaryExpiry.textContent = expiry.toLocaleDateString();
}

// Setup expiry date input
function setupExpiryDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    dom.expiryDate.min = minDate;
    
    // Set default to 7 days from now
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    dom.expiryDate.value = defaultExpiry.toISOString().split('T')[0];
}

// Send document for signing
function sendDocumentForSigning() {
    const title = dom.documentTitle.value.trim();
    if (!title) {
        alert('Please enter a document title.');
        return;
    }
    
    // Create new document
    const newDoc = {
        id: sampleDocuments.length + 1,
        title: title,
        status: 'pending',
        sentDate: new Date().toISOString().split('T')[0],
        expiryDate: dom.expiryDate.value,
        signers: signers.length,
        completedSigners: 0,
        fields: signatureFields.length,
        message: dom.senderMessage.value
    };
    
    sampleDocuments.unshift(newDoc);
    
    // Show success message
    alert('Document sent for signing successfully!');
    
    // Reset and close
    resetForm();
    hideModal(dom.sendModal);
    
    // Update dashboard
    updateDashboardStats();
    loadRecentDocuments();
}

function resetForm() {
    // Reset all form data
    currentDocument = null;
    signers = [];
    signatureFields = [];
    selectedField = null;
    
    // Reset UI
    dom.selectedFileContainer.style.display = 'none';
    dom.nextStepBtn.disabled = true;
    dom.documentInput.value = '';
    dom.signersList.innerHTML = '';
    dom.fieldsList.innerHTML = '';
    dom.fieldSettings.style.display = 'none';
    dom.signerName.value = '';
    dom.signerEmail.value = '';
    dom.signerMessage.value = '';
}

// Signature functions
function clearSignatureCanvas() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    strokes = [];
}

function undoSignatureStroke() {
    if (strokes.length > 0) {
        strokes.pop();
        redrawSignature();
    }
}

function redrawSignature() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    
    strokes.forEach(stroke => {
        if (stroke.length < 2) return;
        
        signatureCtx.beginPath();
        signatureCtx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
            signatureCtx.lineTo(stroke[i].x, stroke[i].y);
        }
        
        signatureCtx.strokeStyle = dom.penColor.value;
        signatureCtx.lineWidth = dom.penSize.value;
        signatureCtx.lineCap = 'round';
        signatureCtx.lineJoin = 'round';
        signatureCtx.stroke();
    });
}

function updatePenColor() {
    signatureCtx.strokeStyle = dom.penColor.value;
}

function updatePenSize() {
    signatureCtx.lineWidth = dom.penSize.value;
}

function updateTypeSignature() {
    const text = dom.signatureText.value || 'Your Name';
    const font = dom.signatureFont.value;
    const color = dom.fontColor.value;
    
    dom.typePreview.innerHTML = '';
    dom.typePreview.style.fontFamily = font;
    dom.typePreview.style.color = color;
    dom.typePreview.textContent = text;
}

function handleSignatureImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        dom.signaturePreview.innerHTML = `<img src="${e.target.result}" alt="Signature" style="max-width: 100%;">`;
    };
    reader.readAsDataURL(file);
}

function switchTab(tabId) {
    // Update tab buttons
    dom.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    dom.signatureTabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === `${tabId}Tab`);
    });
}

function saveSignature() {
    let signatureData = null;
    const activeTab = document.querySelector('.signature-tab.active').id;
    
    if (activeTab === 'drawTab') {
        // Get canvas data
        signatureData = signatureCanvas.toDataURL('image/png');
    } else if (activeTab === 'typeTab') {
        // Create image from typed text
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 400;
        tempCanvas.height = 150;
        
        const text = dom.signatureText.value || 'Signature';
        const font = dom.signatureFont.value;
        const color = dom.fontColor.value;
        
        tempCtx.font = `48px ${font}`;
        tempCtx.fillStyle = color;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(text, 200, 75);
        
        signatureData = tempCanvas.toDataURL('image/png');
    } else if (activeTab === 'uploadTab') {
        const img = dom.signaturePreview.querySelector('img');
        if (img) {
            signatureData = img.src;
        }
    }
    
    if (!signatureData) {
        alert('Please create a signature first.');
        return;
    }
    
    // Save to localStorage
    const signature = {
        id: userSignatures.length + 1,
        data: signatureData,
        createdAt: new Date().toISOString()
    };
    
    userSignatures.push(signature);
    localStorage.setItem('userSignatures', JSON.stringify(userSignatures));
    
    alert('Signature saved successfully!');
    hideModal(dom.signatureModal);
    clearSignatureCanvas();
}

// Document tracking
function showDocumentDetails(document) {
    // Update tracking modal with document details
    dom.trackDocumentTitle.textContent = document.title;
    dom.trackSentDate.textContent = formatDate(document.sentDate);
    dom.trackExpiryDate.textContent = formatDate(document.expiryDate);
    
    // Update signers status
    renderSignersStatus();
    
    // Show modal
    showModal(dom.trackModal);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function renderSignersStatus() {
    dom.signersStatusList.innerHTML = '';
    
    signers.forEach(signer => {
        const statusItem = document.createElement('div');
        statusItem.className = 'status-item';
        statusItem.innerHTML = `
            <div class="signer-status">
                <div class="status-icon ${signer.status}">
                    <i class="fas fa-${signer.status === 'completed' ? 'check' : 'clock'}"></i>
                </div>
                <div>
                    <h5>${signer.name}</h5>
                    <p>${signer.email}</p>
                    ${signer.signedAt ? `<small>Signed: ${signer.signedAt}</small>` : ''}
                </div>
            </div>
            <div class="status-label">
                <span class="status-badge ${signer.status}">${signer.status}</span>
            </div>
        `;
        dom.signersStatusList.appendChild(statusItem);
    });
}

function downloadSignedDocument() {
    alert('Downloading signed document... (This would download the completed PDF in a real app)');
}

function sendReminder() {
    alert('Reminder sent to pending signers!');
}

function voidDocument() {
    if (confirm('Are you sure you want to void this document? This action cannot be undone.')) {
        alert('Document voided successfully.');
        hideModal(dom.trackModal);
    }
}

// Dashboard functions
function updateDashboardStats() {
    const pending = sampleDocuments.filter(d => d.status === 'pending').length;
    const inProgress = sampleDocuments.filter(d => d.status === 'in-progress').length;
    const completed = sampleDocuments.filter(d => d.status === 'completed').length;
    const expired = sampleDocuments.filter(d => d.status === 'expired').length;
    
    dom.pendingCount.textContent = pending;
    dom.inProgressCount.textContent = inProgress;
    dom.completedCount.textContent = completed;
    dom.expiredCount.textContent = expired;
}

function loadRecentDocuments() {
    dom.recentDocuments.innerHTML = '';
    
    sampleDocuments.forEach(doc => {
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        docCard.dataset.docId = doc.id;
        docCard.innerHTML = `
            <div class="document-header">
                <div class="document-icon">
                    <i class="fas fa-file-contract"></i>
                </div>
                <span class="document-status status-${doc.status}">${doc.status}</span>
            </div>
            <div class="document-info">
                <h4>${doc.title}</h4>
                <div class="document-meta">
                    <span><i class="fas fa-users"></i> ${doc.signers} signers</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(doc.sentDate)}</span>
                </div>
                <div class="document-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(doc.completedSigners / doc.signers) * 100}%"></div>
                    </div>
                    <span>${doc.completedSigners}/${doc.signers} completed</span>
                </div>
            </div>
        `;
        dom.recentDocuments.appendChild(docCard);
    });
}

// Modal helpers
function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);