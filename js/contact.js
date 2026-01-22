document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const successMsg = document.getElementById("successMsg");
    const errorMsg = document.getElementById("errorMsg");
    const errorText = document.getElementById("errorText");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Reset messages
            successMsg.style.display = "none";
            errorMsg.style.display = "none";

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<span>Sending...</span><i class="ri-loader-4-line ri-spin"></i>';

            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value,
            };

            try {
                // Simulate a short delay for sending
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Show success message and reset form
                successMsg.style.display = "flex";
                contactForm.reset();
            } catch (error) {
                console.error("Submission error:", error);
                errorMsg.style.display = "flex";
                errorText.innerText = "Oops! Something went wrong. Please try again.";
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML =
                    '<span>Send Message</span><i class="ri-send-plane-fill"></i>';
            }
        });
    }
});
