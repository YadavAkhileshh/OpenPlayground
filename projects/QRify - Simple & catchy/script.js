let currentTemplate = 'url';
let uploadedLogo = null;

// Template buttons
const templateBtns = document.querySelectorAll('.template-btn');
const templateForms = document.querySelectorAll('.template-form');

templateBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.dataset.type;
        
        // Update active states
        templateBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding form
        templateForms.forEach(form => form.classList.remove('active'));
        document.getElementById(type + 'Form').classList.add('active');
        
        currentTemplate = type;
    });
});

// Logo upload
document.getElementById('logoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedLogo = new Image();
            uploadedLogo.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Generate QR Code
document.getElementById('generateBtn').addEventListener('click', function() {
    const qrData = getQRData();
    
    if (!qrData) {
        alert('Please fill in all required fields!');
        return;
    }
    
    generateQRCode(qrData);
});

function getQRData() {
    let data = '';
    
    switch(currentTemplate) {
        case 'url':
            data = document.getElementById('urlInput').value.trim();
            if (!data) return null;
            break;
            
        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value.trim();
            const pass = document.getElementById('wifiPassword').value.trim();
            const enc = document.getElementById('wifiEncryption').value;
            if (!ssid) return null;
            data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
            break;
            
        case 'email':
            const email = document.getElementById('emailTo').value.trim();
            const subject = document.getElementById('emailSubject').value.trim();
            const body = document.getElementById('emailBody').value.trim();
            if (!email) return null;
            data = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            break;
            
        case 'phone':
            const phone = document.getElementById('phoneNumber').value.trim();
            if (!phone) return null;
            data = `tel:${phone}`;
            break;
            
        case 'whatsapp':
            const waNumber = document.getElementById('whatsappNumber').value.trim();
            const waMsg = document.getElementById('whatsappMessage').value.trim();
            if (!waNumber) return null;
            data = `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}${waMsg ? '?text=' + encodeURIComponent(waMsg) : ''}`;
            break;
            
        case 'vcard':
            const name = document.getElementById('vcardName').value.trim();
            const vcPhone = document.getElementById('vcardPhone').value.trim();
            const vcEmail = document.getElementById('vcardEmail').value.trim();
            const org = document.getElementById('vcardOrg').value.trim();
            if (!name) return null;
            data = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${vcPhone}
EMAIL:${vcEmail}
ORG:${org}
END:VCARD`;
            break;
    }
    
    return data;
}

function generateQRCode(text) {
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    const size = parseInt(document.getElementById('qrSize').value);
    const darkColor = document.getElementById('darkColor').value;
    const lightColor = document.getElementById('lightColor').value;
    const errorLevel = document.getElementById('errorLevel').value;
    
    // Create temporary div for QRCode library
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    
    // Generate QR using library
    const qr = new QRCode(tempDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: darkColor,
        colorLight: lightColor,
        correctLevel: QRCode.CorrectLevel[errorLevel]
    });
    
    // Wait for QR code to generate
    setTimeout(() => {
        const qrImg = tempDiv.querySelector('img');
        
        canvas.width = size;
        canvas.height = size;
        
        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, size, size);
        
        // Add logo if uploaded
        if (uploadedLogo && uploadedLogo.complete) {
            const logoSize = size * 0.2;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // White background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(uploadedLogo, logoX, logoY, logoSize, logoSize);
        }
        
        // Show result
        document.getElementById('qrResult').classList.remove('hidden');
        document.getElementById('qrResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove temp div
        document.body.removeChild(tempDiv);
    }, 100);
}

// Download PNG
document.getElementById('downloadBtn').addEventListener('click', function() {
    const canvas = document.getElementById('qrCanvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    link.click();
});

// Download SVG (simplified version)
document.getElementById('downloadSvg').addEventListener('click', function() {
    const canvas = document.getElementById('qrCanvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode-vector.png';
    link.href = url;
    link.click();
    alert('SVG export coming soon! PNG downloaded instead.');
});

// Clear
document.getElementById('clearBtn').addEventListener('click', function() {
    document.querySelectorAll('input[type="text"], input[type="url"], input[type="email"], input[type="tel"], textarea').forEach(input => {
        input.value = '';
    });
    document.getElementById('logoUpload').value = '';
    uploadedLogo = null;
    document.getElementById('qrResult').classList.add('hidden');
});