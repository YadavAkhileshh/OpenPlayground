// Responsive Image Optimizer core logic
// Drag & drop, upload, compress, generate responsive sizes, preview, download as zip

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const previewArea = document.getElementById('preview-area');
const outputArea = document.getElementById('output-area');
const downloadZipBtn = document.getElementById('download-zip');

let optimizedImages = [];

// Drag & drop events
uploadArea.addEventListener('click', () => fileInput.click());
selectBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
  previewArea.innerHTML = '';
  outputArea.innerHTML = '';
  optimizedImages = [];
  [...files].forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        previewArea.appendChild(img.cloneNode());
        optimizeImage(img, file.name);
      };
    };
    reader.readAsDataURL(file);
  });
}

// Generate multiple sizes and formats (JPG, PNG, WebP)
const sizes = [400, 800, 1200];
const formats = ['image/jpeg', 'image/png', 'image/webp'];

function optimizeImage(img, baseName) {
  sizes.forEach(size => {
    formats.forEach(format => {
      const canvas = document.createElement('canvas');
      const scale = size / Math.max(img.width, img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const outImg = new Image();
        outImg.src = url;
        outImg.title = `${baseName.replace(/\.[^.]+$/, '')}_${size}.${format.split('/')[1]}`;
        outputArea.appendChild(outImg);
        optimizedImages.push({
          name: outImg.title,
          blob
        });
        downloadZipBtn.style.display = 'block';
      }, format, 0.8);
    });
  });
}

downloadZipBtn.addEventListener('click', () => {
  if (optimizedImages.length === 0) return;
  createZipAndDownload();
});

// Simple zip using JSZip CDN
function createZipAndDownload() {
  if (!window.JSZip) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = zipAndDownload;
    document.body.appendChild(script);
  } else {
    zipAndDownload();
  }
}

function zipAndDownload() {
  const zip = new JSZip();
  optimizedImages.forEach(img => {
    zip.file(img.name, img.blob);
  });
  zip.generateAsync({type:'blob'}).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'optimized-images.zip';
    a.click();
  });
}

// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
