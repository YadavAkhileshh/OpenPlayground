// Multi-Step Form Wizard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('multiStepForm');
    const progress = document.getElementById('progress');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');

    let currentStep = 1;
    const totalSteps = 3;

    // Initialize form
    updateUI();

    // Event Listeners
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);
    form.addEventListener('submit', submitForm);

    // Add real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });

    function nextStep() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            }
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    }

    function updateUI() {
        // Update form steps
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        // Update step indicators
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });

        // Update progress bar
        const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progress.style.width = progressPercent + '%';

        // Update buttons
        prevBtn.disabled = currentStep === 1;
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
        submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';

        // Update confirmation data if on step 3
        if (currentStep === 3) {
            updateConfirmation();
        }
    }

    function validateCurrentStep() {
        const currentFormStep = document.getElementById(`formStep${currentStep}`);
        const requiredFields = currentFormStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const fieldElement = field || this;
        const fieldName = fieldElement.name;
        const errorElement = document.getElementById(`${fieldName}Error`);
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        clearError(fieldElement);

        // Check if field is required and empty
        if (fieldElement.hasAttribute('required') && !fieldElement.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required.';
        } else {
            // Specific validations
            switch (fieldName) {
                case 'firstName':
                case 'lastName':
                    if (fieldElement.value.trim().length < 2) {
                        isValid = false;
                        errorMessage = 'Name must be at least 2 characters long.';
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(fieldElement.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                    break;
                case 'phone':
                    if (fieldElement.value && !/^\+?[\d\s\-\(\)]+$/.test(fieldElement.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number.';
                    }
                    break;
                case 'zipCode':
                    if (!/^\d{5}(-\d{4})?$/.test(fieldElement.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).';
                    }
                    break;
                case 'country':
                    if (!fieldElement.value) {
                        isValid = false;
                        errorMessage = 'Please select a country.';
                    }
                    break;
            }
        }

        if (!isValid) {
            fieldElement.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        }

        return isValid;
    }

    function clearError(field) {
        const fieldElement = field || this;
        const fieldName = fieldElement.name;
        const errorElement = document.getElementById(`${fieldName}Error`);
        fieldElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    function updateConfirmation() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zipCode').value;
        const country = document.getElementById('country').value;

        document.getElementById('reviewName').textContent = `${firstName} ${lastName}`;
        document.getElementById('reviewEmail').textContent = email;
        document.getElementById('reviewPhone').textContent = phone || 'Not provided';
        document.getElementById('reviewAddress').textContent = street;
        document.getElementById('reviewCity').textContent = city;
        document.getElementById('reviewState').textContent = state;
        document.getElementById('reviewZipCode').textContent = zipCode;
        document.getElementById('reviewCountry').textContent = document.getElementById('country').options[document.getElementById('country').selectedIndex].text;
    }

    function submitForm(e) {
        e.preventDefault();

        if (validateCurrentStep()) {
            // Show success message
            const container = document.querySelector('.container');
            container.innerHTML = `
                <div class="success-message">
                    <h2>Form Submitted Successfully!</h2>
                    <p>Thank you for completing the multi-step form wizard. Your information has been submitted.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Start Over</button>
                </div>
            `;
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (currentStep < totalSteps) {
                nextStep();
            } else {
                submitForm(e);
            }
        }
    });
});