document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const successMsg = document.getElementById("successMsg");
    const errorMsg = document.getElementById("errorMsg");
    const errorText = document.getElementById("errorText");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Validation using ValidationEngine
            const rules = {
                name: { required: true, min: 2 },
                email: { required: true, type: 'email' },
                message: { required: true, min: 10 }
            };

            const validation = window.ValidationEngine.validate(data, rules);

            if (!validation.isValid) {
                const errorMsg = Object.values(validation.errors)[0];
                window.notificationManager.error(errorMsg);
                return;
            }

            // Reset messages (using centralized notification now, but keep DOM if needed for UI)
            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending...</span><i class="ri-loader-4-line ri-spin"></i>';

            try {
                // Simulate a short delay for sending
                await new Promise(resolve => setTimeout(resolve, 800));

                // Show success message and reset form
                window.notificationManager.success('Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } catch (error) {
                console.error('Submission error:', error);
                window.notificationManager.error('Oops! Something went wrong. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Send Message</span><i class="ri-send-plane-fill"></i>';
            }
        });
    }
});
