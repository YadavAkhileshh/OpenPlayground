// Open Source License Checker core logic
// Drag & drop, scan files, detect licenses, display results, dark/light mode

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const scanStatus = document.getElementById('scan-status');
const licenseResults = document.getElementById('license-results');

// Common license keywords
const LICENSE_PATTERNS = [
  {name: 'MIT', pattern: /mit license/i},
  {name: 'Apache 2.0', pattern: /apache license,? version 2/i},
  {name: 'GPL', pattern: /gnu (general public|gpl)/i},
  {name: 'BSD', pattern: /bsd license/i},
  {name: 'MPL', pattern: /mozilla public license/i},
  {name: 'Unlicense', pattern: /unlicense/i},
  {name: 'LGPL', pattern: /lesser general public license|lgpl/i},
  {name: 'AGPL', pattern: /affero general public license|agpl/i},
  {name: 'EPL', pattern: /eclipse public license/i},
  {name: 'Proprietary', pattern: /proprietary/i}
];

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
  scanStatus.textContent = 'Scanning files...';
  licenseResults.innerHTML = '';
  const fileArr = [...files];
  let processed = 0;
  let foundLicenses = [];
  fileArr.forEach(file => {
    if (/license|copying|notice|readme/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target.result;
        const detected = detectLicense(content);
        if (detected) {
          foundLicenses.push({file: file.name, license: detected});
        }
        processed++;
        if (processed === fileArr.length) showResults(foundLicenses);
      };
      reader.readAsText(file);
    } else {
      processed++;
      if (processed === fileArr.length) showResults(foundLicenses);
    }
  });
}

function detectLicense(content) {
  for (const lic of LICENSE_PATTERNS) {
    if (lic.pattern.test(content)) return lic.name;
  }
  return null;
}

function showResults(licenses) {
  scanStatus.textContent = 'Scan complete.';
  if (licenses.length === 0) {
    licenseResults.innerHTML = '<b>No open source licenses detected.</b>';
    return;
  }
  licenseResults.innerHTML = licenses.map(l =>
    `<span class="license-badge">${l.license}</span> <b>${l.file}</b>`
  ).join('<br>');
}

// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
