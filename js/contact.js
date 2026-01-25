document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const successMsg = document.getElementById("successMsg");
    const errorMsg = document.getElementById("errorMsg");
    const errorText = document.getElementById("errorText");
    const messageTextarea = document.getElementById("message");
    const charCount = document.getElementById("charCount");

    // Character counter for message
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', () => {
            const count = messageTextarea.value.length;
            charCount.textContent = count;
            
            if (count > 900) {
                charCount.style.color = '#ef4444';
            } else if (count > 700) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
    }

    // Real-time form validation
    function validateField(field) {
        const wrapper = field.closest('.input-wrapper') || field.closest('.form-group');
        const validation = wrapper.querySelector('.input-validation');
        
        if (!validation) return true;
        
        let isValid = true;
        let message = '';
        
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value && !emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        if (field.required && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }
        
        if (field.id === 'message' && field.value.length < 10 && field.value.length > 0) {
            isValid = false;
            message = 'Message must be at least 10 characters';
        }
        
        // Update validation UI
        validation.textContent = message;
        validation.className = `input-validation ${isValid ? 'valid' : 'invalid'}`;
        field.className = `form-input ${isValid ? 'valid' : 'invalid'}`;
        
        return isValid;
    }

    // Add validation listeners
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Validate all fields
            let isFormValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                errorMsg.style.display = "flex";
                errorText.textContent = "Please fix the errors above";
                return;
            }

            // Reset messages
            successMsg.style.display = "none";
            errorMsg.style.display = "none";

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value,
                priority: document.querySelector('input[name="priority"]:checked').value,
                newsletter: document.getElementById("newsletter").checked,
                timestamp: new Date().toISOString()
            };

            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1500));

                // Show success message and reset form
                successMsg.style.display = "flex";
                contactForm.reset();
                charCount.textContent = '0';
                
                // Reset validation states
                formInputs.forEach(input => {
                    input.className = input.className.replace(' valid invalid', '');
                    const validation = input.closest('.input-wrapper, .form-group')?.querySelector('.input-validation');
                    if (validation) {
                        validation.textContent = '';
                        validation.className = 'input-validation';
                    }
                });
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    successMsg.style.display = "none";
                }, 5000);
                
            } catch (error) {
                console.error("Submission error:", error);
                errorMsg.style.display = "flex";
                errorText.textContent = "Network error. Please check your connection and try again.";
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }
});
