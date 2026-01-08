document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const summaryDiv = document.getElementById('summary');

    let currentStep = 0;

    function showStep(step) {
        steps.forEach((stepDiv, index) => {
            stepDiv.style.display = index === step ? 'block' : 'none';
        });
        updateProgress(step);
        updateButtons(step);
        if (step === 3) {
            updateSummary();
        }
    }

    function updateProgress(step) {
        progressSteps.forEach((progressStep, index) => {
            if (index < step) {
                progressStep.classList.add('completed');
                progressStep.classList.remove('active');
            } else if (index === step) {
                progressStep.classList.add('active');
                progressStep.classList.remove('completed');
            } else {
                progressStep.classList.remove('active', 'completed');
            }
        });
    }

    function updateButtons(step) {
        prevBtn.style.display = step === 0 ? 'none' : 'inline-block';
        nextBtn.style.display = step === steps.length - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = step === steps.length - 1 ? 'inline-block' : 'none';
    }

    function validateStep(step) {
        const inputs = steps[step].querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        return isValid;
    }

    function updateSummary() {
        const formData = new FormData(form);
        let summary = '<ul>';
        for (let [key, value] of formData.entries()) {
            summary += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        summary += '</ul>';
        summaryDiv.innerHTML = summary;
    }

    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', function() {
        currentStep--;
        showStep(currentStep);
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            alert('Form submitted successfully!');
            // Here you can send the form data to a server
        }
    });

    // Initial setup
    showStep(currentStep);
});