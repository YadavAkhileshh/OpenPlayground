document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('multiStepForm');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const demoBtn = document.getElementById('demoBtn');
    const progressFill = document.getElementById('progressFill');
    const currentStepSpan = document.getElementById('currentStep');
    const reviewDetails = document.getElementById('reviewDetails');
    const successMessage = document.getElementById('successMessage');
    
    // Form inputs
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const dob = document.getElementById('dob');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    
    // Error elements
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const emailError = document.getElementById('emailError');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('confirmPasswordError');
    const termsError = document.getElementById('termsError');
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    // Password strength elements
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    // State variables
    let currentStep = 1;
    const totalSteps = 4;
    
    // Initialize
    updateProgress();
    setupEventListeners();
    setupKeyboardNavigation();
    
    // Event Listeners Setup
    function setupEventListeners() {
        // Navigation buttons
        prevBtn.addEventListener('click', goToPrevStep);
        nextBtn.addEventListener('click', goToNextStep);
        submitBtn.addEventListener('click', submitForm);
        resetBtn.addEventListener('click', resetForm);
        demoBtn.addEventListener('click', loadDemoData);
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm();
        });
        
        // Password toggle
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility(password, togglePassword);
        });
        
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility(confirmPassword, toggleConfirmPassword);
        });
        
        // Real-time validation
        firstName.addEventListener('input', () => validateFirstName());
        lastName.addEventListener('input', () => validateLastName());
        email.addEventListener('input', () => validateEmail());
        username.addEventListener('input', () => validateUsername());
        password.addEventListener('input', () => {
            validatePassword();
            checkPasswordStrength();
        });
        confirmPassword.addEventListener('input', () => validateConfirmPassword());
        terms.addEventListener('change', () => validateTerms());
        
        // Step indicator click
        stepIndicators.forEach(step => {
            step.addEventListener('click', function() {
                const stepNumber = parseInt(this.dataset.step);
                if (stepNumber < currentStep) {
                    goToStep(stepNumber);
                }
            });
        });
        
        // Update review on step 4
        steps[3].addEventListener('DOMNodeInserted', updateReviewDetails);
    }
    
    // Keyboard Navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (currentStep < totalSteps) {
                    goToNextStep();
                } else if (currentStep === totalSteps) {
                    submitForm();
                }
            }
            
            if (e.key === 'ArrowLeft' && currentStep > 1) {
                goToPrevStep();
            }
            
            if (e.key === 'ArrowRight' && currentStep < totalSteps) {
                goToNextStep();
            }
            
            // Tab navigation between steps
            if (e.key === 'Tab' && !e.shiftKey) {
                const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                const inputs = currentStepElement.querySelectorAll('input, textarea, select');
                const lastInput = inputs[inputs.length - 1];
                
                if (document.activeElement === lastInput) {
                    e.preventDefault();
                    if (currentStep < totalSteps) {
                        goToNextStep();
                        setTimeout(() => {
                            const nextStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                            const firstInput = nextStepElement.querySelector('input, textarea, select');
                            if (firstInput) firstInput.focus();
                        }, 100);
                    }
                }
            }
        });
    }
    
    // Navigation Functions
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;
        
        // Validate current step before moving
        if (step > currentStep && !validateCurrentStep()) {
            return;
        }
        
        // Update current step
        currentStep = step;
        currentStepSpan.textContent = currentStep;
        
        // Update step display
        steps.forEach((stepElement, index) => {
            if (index + 1 === currentStep) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
        
        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            if (index + 1 < currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (index + 1 === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
        
        // Update buttons
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
            updateReviewDetails();
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
        
        // Update progress bar
        updateProgress();
        
        // Scroll to top of form
        document.querySelector('.form-wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function goToNextStep() {
        if (validateCurrentStep()) {
            goToStep(currentStep + 1);
        }
    }
    
    function goToPrevStep() {
        goToStep(currentStep - 1);
    }
    
    function updateProgress() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    // Validation Functions
    function validateCurrentStep() {
        switch(currentStep) {
            case 1:
                return validateStep1();
            case 2:
                return validateStep2();
            case 3:
                return validateStep3();
            case 4:
                return validateStep4();
            default:
                return true;
        }
    }
    
    function validateStep1() {
        const isFirstNameValid = validateFirstName();
        const isLastNameValid = validateLastName();
        return isFirstNameValid && isLastNameValid;
    }
    
    function validateStep2() {
        return validateEmail();
    }
    
    function validateStep3() {
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        return isUsernameValid && isPasswordValid && isConfirmPasswordValid;
    }
    
    function validateStep4() {
        return validateTerms();
    }
    
    function validateFirstName() {
        const value = firstName.value.trim();
        if (!value) {
            showError(firstNameError, 'First name is required');
            return false;
        }
        if (value.length < 2) {
            showError(firstNameError, 'First name must be at least 2 characters');
            return false;
        }
        hideError(firstNameError);
        return true;
    }
    
    function validateLastName() {
        const value = lastName.value.trim();
        if (!value) {
            showError(lastNameError, 'Last name is required');
            return false;
        }
        if (value.length < 2) {
            showError(lastNameError, 'Last name must be at least 2 characters');
            return false;
        }
        hideError(lastNameError);
        return true;
    }
    
    function validateEmail() {
        const value = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!value) {
            showError(emailError, 'Email is required');
            return false;
        }
        if (!emailRegex.test(value)) {
            showError(emailError, 'Please enter a valid email address');
            return false;
        }
        hideError(emailError);
        return true;
    }
    
    function validateUsername() {
        const value = username.value.trim();
        if (!value) {
            showError(usernameError, 'Username is required');
            return false;
        }
        if (value.length < 3) {
            showError(usernameError, 'Username must be at least 3 characters');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            showError(usernameError, 'Username can only contain letters, numbers, and underscores');
            return false;
        }
        hideError(usernameError);
        return true;
    }
    
    function validatePassword() {
        const value = password.value;
        if (!value) {
            showError(passwordError, 'Password is required');
            return false;
        }
        if (value.length < 8) {
            showError(passwordError, 'Password must be at least 8 characters');
            return false;
        }
        hideError(passwordError);
        return true;
    }
    
    function validateConfirmPassword() {
        const value = confirmPassword.value;
        if (!value) {
            showError(passwordError, 'Please confirm your password');
            return false;
        }
        if (value !== password.value) {
            showError(passwordError, 'Passwords do not match');
            return false;
        }
        hideError(passwordError);
        return true;
    }
    
    function validateTerms() {
        if (!terms.checked) {
            showError(termsError, 'You must agree to the terms and conditions');
            return false;
        }
        hideError(termsError);
        return true;
    }
    
    function checkPasswordStrength() {
        const passwordValue = password.value;
        let strength = 0;
        let text = 'Weak';
        let color = '#dc3545';
        let width = '25%';
        
        if (passwordValue.length >= 8) strength++;
        if (/[A-Z]/.test(passwordValue)) strength++;
        if (/[0-9]/.test(passwordValue)) strength++;
        if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;
        
        switch(strength) {
            case 0:
            case 1:
                text = 'Weak';
                color = '#dc3545';
                width = '25%';
                break;
            case 2:
                text = 'Fair';
                color = '#ffc107';
                width = '50%';
                break;
            case 3:
                text = 'Good';
                color = '#28a745';
                width = '75%';
                break;
            case 4:
                text = 'Strong';
                color = '#20c997';
                width = '100%';
                break;
        }
        
        strengthBar.style.width = width;
        strengthBar.style.background = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
    
    // Helper Functions
    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }
    
    function hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }
    
    function togglePasswordVisibility(passwordField, toggleButton) {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        const icon = toggleButton.querySelector('i');
        if (type === 'password') {
            icon.className = 'fas fa-eye';
        } else {
            icon.className = 'fas fa-eye-slash';
        }
    }
    
    // Review Details
    function updateReviewDetails() {
        if (currentStep === 4) {
            const details = `
                <div>
                    <strong>Full Name:</strong>
                    <span>${firstName.value.trim()} ${lastName.value.trim()}</span>
                </div>
                <div>
                    <strong>Date of Birth:</strong>
                    <span>${dob.value || 'Not specified'}</span>
                </div>
                <div>
                    <strong>Email:</strong>
                    <span>${email.value.trim()}</span>
                </div>
                <div>
                    <strong>Phone:</strong>
                    <span>${phone.value.trim() || 'Not specified'}</span>
                </div>
                <div>
                    <strong>Address:</strong>
                    <span>${address.value.trim() || 'Not specified'}</span>
                </div>
                <div>
                    <strong>Username:</strong>
                    <span>${username.value.trim()}</span>
                </div>
            `;
            reviewDetails.innerHTML = details;
        }
    }
    
    // Form Submission
    function submitForm() {
        if (validateStep4()) {
            // Simulate form submission
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth' });
            
            // Log form data (in real app, this would be sent to server)
            const formData = {
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                dob: dob.value,
                email: email.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                username: username.value.trim()
            };
            console.log('Form submitted:', formData);
        }
    }
    
    // Reset Form
    function resetForm() {
        // Reset form inputs
        form.reset();
        
        // Reset state
        currentStep = 1;
        currentStepSpan.textContent = currentStep;
        
        // Reset UI
        form.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Reset steps
        steps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Reset indicators
        stepIndicators.forEach((indicator, index) => {
            if (index === 0) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
        
        // Reset buttons
        prevBtn.disabled = true;
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
        
        // Reset progress
        updateProgress();
        
        // Clear errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });
        
        // Reset password strength
        strengthBar.style.width = '25%';
        strengthBar.style.background = '#dc3545';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#dc3545';
        
        // Focus on first field
        firstName.focus();
    }
    
    // Load Demo Data
    function loadDemoData(e) {
        e.preventDefault();
        
        // Fill with demo data
        firstName.value = 'John';
        lastName.value = 'Doe';
        dob.value = '1990-01-15';
        email.value = 'john.doe@example.com';
        phone.value = '(123) 456-7890';
        address.value = '123 Main St, Anytown, USA';
        username.value = 'johndoe';
        password.value = 'SecurePass123!';
        confirmPassword.value = 'SecurePass123!';
        terms.checked = true;
        
        // Trigger validation
        validateFirstName();
        validateLastName();
        validateEmail();
        validateUsername();
        validatePassword();
        validateConfirmPassword();
        validateTerms();
        checkPasswordStrength();
        
        // Update review if on step 4
        if (currentStep === 4) {
            updateReviewDetails();
        }
        
        // Show success message
        showNotification('Demo data loaded successfully!', 'success');
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#4a6ee0'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            font-weight: 600;
        `;
        
        // Add keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Initialize first field focus
    setTimeout(() => {
        firstName.focus();
    }, 500);
});