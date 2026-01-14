// Run after the page loads
document.addEventListener("DOMContentLoaded", function () {

    // 1️⃣ Select elements
    const quoteInput = document.getElementById("quoteInput");
    const saveBtn = document.getElementById("saveBtn");
    const quoteDisplay = document.getElementById("quoteDisplay");

    // 2️⃣ Load quote when page opens
    const savedQuote = localStorage.getItem("savedQuote");

    if (savedQuote) {
        quoteDisplay.textContent = savedQuote;
    } else {
        quoteDisplay.textContent = "No quote saved yet";
    }

    // 3️⃣ Save quote on button click
    saveBtn.addEventListener("click", function () {
        const quoteText = quoteInput.value;

        // Store quote
        localStorage.setItem("savedQuote", quoteText);

        // Update display immediately
        quoteDisplay.textContent = quoteText;

        // 4️⃣ Clear input after save
        quoteInput.value = "";
    });

});
