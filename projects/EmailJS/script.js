
emailjs.init("YOUR_PUBLIC_KEY"); 

const emailForm = document.getElementById('emailForm');
const statusMessage = document.getElementById('statusMessage');
const sendBtn = document.querySelector('.send-btn');
const btnText = document.querySelector('.btn-text');
const loader = document.querySelector('.loader');

emailForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    
    sendBtn.disabled = true;
    btnText.style.display = 'none';
    loader.style.display = 'inline';
    statusMessage.style.display = 'none';
    
    
    const templateParams = {
        to_email: document.getElementById('toEmail').value,
        from_name: document.getElementById('fromName').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // EmailJS service vaprun email pathva
    // IMPORTANT: 'YOUR_SERVICE_ID' ani 'YOUR_TEMPLATE_ID' replace kara
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showMessage('Email successfully pathavli! ✅', 'success');
            emailForm.reset();
        })
        .catch(function(error) {
            console.error('FAILED...', error);
            showMessage('Email pathavnyas error aali! ❌ Punha try kara.', 'error');
        })
        .finally(function() {
            // Button reset kara
            sendBtn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        });
});

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
    

    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}
```

## EmailJS Setup Kasa Karaycha:

1. **EmailJS Account Banva**: https://www.emailjs.com/ var jaa ani free account banva

2. **Email Service Add Kara**:
   - Dashboard madhye "Add New Service" var click kara
   - Gmail/Outlook/Yahoo select kara
   - Tumcha email connect kara

3. **Email Template Banva**:
   - "Email Templates" madhye jaa
   - "Create New Template" click kara
   - Template madhe ha content ghala:
```
   Subject: {{subject}}
   
   From: {{from_name}}
   
   Message:
   {{message}}