document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('password');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('lengthValue');
    const copyBtn = document.getElementById('copyBtn');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const breachStatus = document.getElementById('breachStatus');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportModal = document.getElementById('exportModal');
    const confirmExportBtn = document.getElementById('confirmExportBtn');
    const cancelExportBtn = document.getElementById('cancelExportBtn');
    
    // Password history array
    let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    // Update history display
    function updateHistoryDisplay() {
        if (passwordHistory.length > 0) {
            historySection.style.display = 'block';
            historyList.innerHTML = '';
            passwordHistory.slice(-5).reverse().forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${item.breached ? 'warning' : ''}`;
                historyItem.innerHTML = `
                    <span class="password-text">${item.password}</span>
                    ${item.breached ? '<span class="warning-icon" title="This password has been breached!">⚠️</span>' : ''}
                    <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
                `;
                historyList.appendChild(historyItem);
            });
            historyCount.textContent = passwordHistory.length;
        } else {
            historySection.style.display = 'none';
        }
    }
    
    function addToHistory(password, breached = false) {
        passwordHistory.push({
            password: password,
            timestamp: new Date().toISOString(),
            breached: breached
        });
        
        // Keep only last 20 passwords
        if (passwordHistory.length > 20) {
            passwordHistory = passwordHistory.slice(-20);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        updateHistoryDisplay();
    }
    
    // Clear history
    clearHistoryBtn.addEventListener('click', () => {
        passwordHistory = [];
        localStorage.removeItem('passwordHistory');
        updateHistoryDisplay();
    });
    
    // Calculate password strength
    function calculateStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else if (password.length >= 6) score += 10;
        
        // Character variety
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^a-zA-Z0-9]/.test(password)) score += 15;
        
        // Pattern checks
        if (/(.)\1{2,}/.test(password)) score -= 10; 
        if (/^[a-zA-Z]+$/.test(password)) score -= 10; 
        if (/^[0-9]+$/.test(password)) score -= 15; 
        score = Math.max(0, Math.min(100, score));
        
        return score;
    }
    
    function updateStrengthMeter(password) {
        const strength = calculateStrength(password);
        strengthBar.style.width = strength + '%';
        
        if (strength < 30) {
            strengthBar.style.background = '#dc3545';
            strengthText.textContent = 'Weak Password';
            strengthText.style.color = '#dc3545';
        } else if (strength < 60) {
            strengthBar.style.background = '#ffc107';
            strengthText.textContent = 'Moderate Password';
            strengthText.style.color = '#ffc107';
        } else if (strength < 80) {
            strengthBar.style.background = '#17a2b8';
            strengthText.textContent = 'Strong Password';
            strengthText.style.color = '#17a2b8';
        } else {
            strengthBar.style.background = '#28a745';
            strengthText.textContent = 'Very Strong Password';
            strengthText.style.color = '#28a745';
        }
        
        strengthBar.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            strengthBar.style.animation = '';
        }, 500);
    }
    
    async function checkBreach(password) {
        breachStatus.style.display = 'block';
        breachStatus.className = 'breach-status';
        breachStatus.textContent = 'Checking breach status...';
        breachStatus.classList.add('warning');
        
        try {
            const response = await fetch('http://localhost:8000/check-breach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });
            
            const result = await response.json();
            
            if (result.breached === true) {
                breachStatus.className = 'breach-status warning';
                breachStatus.textContent = result.message;
                addToHistory(password, true);
            } else if (result.breached === false) {
                breachStatus.className = 'breach-status safe';
                breachStatus.textContent = result.message;
                addToHistory(password, false);
            } else {
                breachStatus.className = 'breach-status error';
                breachStatus.textContent = result.message;
                addToHistory(password, false);
            }
        } catch (error) {
            breachStatus.className = 'breach-status error';
            breachStatus.textContent = 'Unable to check breach status. Please try again later.';
            addToHistory(password, false);
        }
    }
    
    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const length = parseInt(lengthSlider.value);
        const includeUpper = document.getElementById('includeUpper').checked;
        const includeLower = document.getElementById('includeLower').checked;
        const includeDigits = document.getElementById('includeDigits').checked;
        const includeSpecial = document.getElementById('includeSpecial').checked;
        
        const password = generatePassword(length, includeUpper, includeLower, includeDigits, includeSpecial);
        
        if (password) {
            passwordInput.value = password;
            
            updateStrengthMeter(password);
            
            await checkBreach(password);
            
            passwordInput.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        } else {
            passwordInput.value = 'Error: Please select at least one character type';
            breachStatus.style.display = 'none';
        }
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        if (passwordInput.value && !passwordInput.value.startsWith('Error:')) {
            passwordInput.select();
            navigator.clipboard.writeText(passwordInput.value).then(() => {
                copyBtn.textContent = '✅';
                copyBtn.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                    copyBtn.style.animation = '';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 2000);
            });
        }
    });
    
    // Export functionality
    exportBtn.addEventListener('click', () => {
        exportModal.style.display = 'flex';
    });
    
    cancelExportBtn.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });
    
    confirmExportBtn.addEventListener('click', async () => {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const passwords = passwordHistory.map(item => item.password);
        
        if (passwords.length === 0) {
            alert('No passwords to export!');
            exportModal.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:8000/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ passwords: passwords, format: format })
            });
            
            const result = await response.json();
            
            const blob = new Blob([result.content], { type: result.media_type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            exportModal.style.display = 'none';
        } catch (error) {
            alert('Error exporting passwords. Please try again.');
        }
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            exportModal.style.display = 'none';
        }
    });
    
    // Password generation function
    function generatePassword(length, includeUpper, includeLower, includeDigits, includeSpecial) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let charset = '';
        let password = '';
        
        if (includeUpper) charset += uppercase;
        if (includeLower) charset += lowercase;
        if (includeDigits) charset += digits;
        if (includeSpecial) charset += special;
        
        if (charset === '') return null;
        
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        return password;
    }
    
    updateHistoryDisplay();
    
    setTimeout(() => {
        document.getElementById('generateBtn').click();
    }, 100);
});