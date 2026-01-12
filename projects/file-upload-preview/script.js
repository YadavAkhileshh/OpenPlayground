const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const error = document.getElementById("error");
const uploadProgressContainer = document.getElementById("uploadProgressContainer");
const uploadProgressFill = document.getElementById("uploadProgressFill");
const uploadPercentage = document.getElementById("uploadPercentage");
const uploadFileCount = document.getElementById("uploadFileCount");
const individualProgressContainer = document.getElementById("individualProgressContainer");
const cancelUploadBtn = document.getElementById("cancelUploadBtn");

const MAX_SIZE_MB = 2;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain"
];

const FILE_ICONS = {
  'pdf': '📕',
  'doc': '📄',
  'docx': '📄',
  'xls': '📊',
  'xlsx': '📊',
  'txt': '📝',
  'default': '📁'
};

let uploadQueue = [];
let isUploading = false;
let uploadCanceled = false;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

fileInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  error.textContent = "";
  uploadProgressContainer.classList.add("hidden");
  uploadQueue = [];
  
  const files = [...fileInput.files];
  
  if (files.length === 0) return;
  
  files.forEach((file, index) => {
    if (!isFileTypeAllowed(file)) {
      error.textContent = `Unsupported file type: ${file.name}. Only images, PDFs, and documents are allowed.`;
      return;
    }

    if (file.size > MAX_SIZE) {
      error.textContent = `File "${file.name}" exceeds ${MAX_SIZE_MB}MB size limit.`;
      return;
    }

    createPreview(file);
    uploadQueue.push({
      file,
      id: Date.now() + index,
      progress: 0,
      uploaded: false
    });
  });
  
  if (uploadQueue.length > 0) {
    updateUploadProgressDisplay();
  }
});

function isFileTypeAllowed(file) {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  
  const ext = file.name.split('.').pop().toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext);
}

function createPreview(file) {
  const div = document.createElement("div");
  div.className = "preview-item";
  div.id = `preview-${file.name.replace(/\s/g, '-')}`;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "×";
  removeBtn.onclick = () => {
    div.remove();
    uploadQueue = uploadQueue.filter(item => item.file !== file);
    updateUploadProgressDisplay();
  };

  div.appendChild(removeBtn);

  const icon = document.createElement("div");
  icon.className = "preview-icon";
  
  const ext = file.name.split('.').pop().toLowerCase();
  icon.textContent = FILE_ICONS[ext] || FILE_ICONS.default;
  
  div.appendChild(icon);
  
  if (file.type.startsWith("image/")) {
    createImagePreview(file, div);
  } else if (file.type === "application/pdf") {
    createPDFPreview(file, div);
  } else if (file.type.includes("word") || file.type.includes("document")) {
    createDocumentPreview(file, div, 'doc');
  } else if (file.type.includes("excel") || file.type.includes("spreadsheet")) {
    createDocumentPreview(file, div, 'xls');
  } else if (file.type === "text/plain") {
    createTextPreview(file, div);
  } else {
    addFileInfo(div, file);
  }

  previewContainer.appendChild(div);
}

function createImagePreview(file, container) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.createElement("img");
    img.src = reader.result;
    img.alt = file.name;
    
    const icon = container.querySelector('.preview-icon');
    icon.replaceWith(img);
    
    addFileInfo(container, file);
  };
  reader.readAsDataURL(file);
}

async function createPDFPreview(file, container) {
  const reader = new FileReader();
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      const pdfPreview = document.createElement("div");
      pdfPreview.className = "pdf-preview";
      pdfPreview.appendChild(canvas);
      
      const icon = container.querySelector('.preview-icon');
      icon.replaceWith(pdfPreview);
      
      addFileInfo(container, file);
    } catch (err) {
      console.error("PDF preview error:", err);
      addFileInfo(container, file);
    }
  };
  reader.readAsArrayBuffer(file);
}

function createDocumentPreview(file, container, type) {
  const reader = new FileReader();
  reader.onload = () => {
    const docPreview = document.createElement("div");
    docPreview.className = "doc-preview";
    
    if (type === 'doc' || type === 'xls') {
      const content = document.createElement("div");
      content.className = "preview-content";
      content.textContent = `Preview not available for ${file.name}. File will be uploaded correctly.`;
      docPreview.appendChild(content);
    }
    
    const icon = container.querySelector('.preview-icon');
    icon.replaceWith(docPreview);
    
    addFileInfo(container, file);
  };
  
  if (file.type === "text/plain") {
    reader.readAsText(file);
  } else {
    addFileInfo(container, file);
  }
}

function createTextPreview(file, container) {
  const reader = new FileReader();
  reader.onload = () => {
    const textPreview = document.createElement("div");
    textPreview.className = "text-preview";
    
    const content = document.createElement("div");
    content.className = "preview-content";
    
    const text = reader.result;
    content.textContent = text.length > 500 ? text.substring(0, 500) + "..." : text;
    
    textPreview.appendChild(content);
    
    const icon = container.querySelector('.preview-icon');
    icon.replaceWith(textPreview);
    
    addFileInfo(container, file);
  };
  reader.readAsText(file);
}

function addFileInfo(container, file) {
  const name = document.createElement("p");
  name.className = "file-name";
  name.textContent = truncateFileName(file.name, 20);

  const size = document.createElement("p");
  size.className = "file-size";
  size.textContent = formatFileSize(file.size);

  container.appendChild(name);
  container.appendChild(size);
}

function truncateFileName(name, maxLength) {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const nameWithoutExt = name.substring(0, name.length - ext.length - 1);
  const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 3);
  return `${truncated}...${ext}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function startUpload() {
  if (uploadQueue.length === 0 || isUploading) return;
  
  isUploading = true;
  uploadCanceled = false;
  uploadProgressContainer.classList.remove("hidden");
  
  individualProgressContainer.innerHTML = '';
  uploadQueue.forEach(item => {
    createIndividualProgressTracker(item);
  });
  
  simulateUpload();
}

function simulateUpload() {
  let uploadedCount = 0;
  const totalFiles = uploadQueue.length;
  
  uploadQueue.forEach((item, index) => {
    setTimeout(() => {
      if (uploadCanceled) return;
      
      const interval = setInterval(() => {
        if (item.progress >= 100 || uploadCanceled) {
          clearInterval(interval);
          return;
        }
        
        const increment = Math.random() * 15 + 5;
        item.progress = Math.min(item.progress + increment, 100);
        
        updateIndividualProgress(item.id, item.progress);
        
        updateOverallProgress();
        
        if (item.progress >= 100 && !item.uploaded) {
          item.uploaded = true;
          uploadedCount++;
          
          markPreviewAsUploaded(item.file.name);
          
          uploadFileCount.textContent = `${uploadedCount}/${totalFiles} files uploaded`;
          
          if (uploadedCount === totalFiles) {
            setTimeout(() => {
              uploadComplete();
            }, 1000);
          }
        }
      }, 200 + Math.random() * 300);
    }, index * 500); 
  });
}

function createIndividualProgressTracker(item) {
  const progressDiv = document.createElement("div");
  progressDiv.className = "individual-progress";
  progressDiv.id = `progress-${item.id}`;
  
  const icon = document.createElement("div");
  icon.className = "file-icon";
  const ext = item.file.name.split('.').pop().toLowerCase();
  icon.textContent = FILE_ICONS[ext] || FILE_ICONS.default;
  
  const infoDiv = document.createElement("div");
  infoDiv.className = "individual-progress-info";
  
  const name = document.createElement("p");
  name.className = "file-name";
  name.textContent = truncateFileName(item.file.name, 15);
  
  const size = document.createElement("p");
  size.className = "file-size";
  size.textContent = formatFileSize(item.file.size);
  
  const progressBar = document.createElement("div");
  progressBar.className = "individual-progress-bar";
  
  const progressFill = document.createElement("div");
  progressFill.className = "individual-progress-fill";
  progressFill.id = `progress-fill-${item.id}`;
  progressFill.style.width = "0%";
  
  progressBar.appendChild(progressFill);
  
  infoDiv.appendChild(name);
  infoDiv.appendChild(size);
  infoDiv.appendChild(progressBar);
  
  const percent = document.createElement("div");
  percent.className = "individual-progress-percent";
  percent.id = `progress-percent-${item.id}`;
  percent.textContent = "0%";
  
  progressDiv.appendChild(icon);
  progressDiv.appendChild(infoDiv);
  progressDiv.appendChild(percent);
  
  individualProgressContainer.appendChild(progressDiv);
}

function updateIndividualProgress(id, progress) {
  const progressFill = document.getElementById(`progress-fill-${id}`);
  const progressPercent = document.getElementById(`progress-percent-${id}`);
  
  if (progressFill && progressPercent) {
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;
    
    if (progress >= 100) {
      progressFill.style.background = "#4CAF50";
    }
  }
}

function updateOverallProgress() {
  const totalProgress = uploadQueue.reduce((sum, item) => sum + item.progress, 0) / uploadQueue.length;
  uploadProgressFill.style.width = `${totalProgress}%`;
  uploadPercentage.textContent = `${Math.round(totalProgress)}%`;
}

function markPreviewAsUploaded(fileName) {
  const previewId = `preview-${fileName.replace(/\s/g, '-')}`;
  const preview = document.getElementById(previewId);
  
  if (preview) {
    const successBadge = document.createElement("div");
    successBadge.className = "upload-success";
    successBadge.textContent = "✓";
    preview.appendChild(successBadge);
    
    preview.classList.remove("uploading");
  }
}

function updateUploadProgressDisplay() {
  if (uploadQueue.length > 0) {
    uploadFileCount.textContent = `0/${uploadQueue.length} files uploaded`;
    uploadProgressFill.style.width = "0%";
    uploadPercentage.textContent = "0%";
    
    setTimeout(() => {
      startUpload();
    }, 500);
  } else {
    uploadProgressContainer.classList.add("hidden");
  }
}

function uploadComplete() {
  isUploading = false;
  
  setTimeout(() => {
    error.textContent = "All files uploaded successfully!";
    error.style.color = "#4CAF50";
    
    setTimeout(() => {
      error.textContent = "";
    }, 3000);
  }, 500);
}

function cancelUpload() {
  uploadCanceled = true;
  isUploading = false;
  
  uploadQueue.forEach(item => {
    item.progress = 0;
    item.uploaded = false;
  });
  
  uploadProgressContainer.classList.add("hidden");
  
  individualProgressContainer.innerHTML = '';
  
  document.querySelectorAll('.upload-success').forEach(el => el.remove());
  
  error.textContent = "Upload canceled";
  error.style.color = "#ff6b6b";
  
  setTimeout(() => {
    error.textContent = "";
  }, 2000);
}

cancelUploadBtn.addEventListener("click", cancelUpload);

fileInput.addEventListener("change", () => {
  error.textContent = "";
  error.style.color = "#e63946";
});