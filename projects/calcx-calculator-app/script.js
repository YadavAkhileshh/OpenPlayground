const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let currentInput = "";

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.innerText;

        // Clear all
        if (value === "AC") {
            currentInput = "";
            display.value = "";
        }

        // Backspace
        else if (value === "⌫") {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput;
        }

        // Calculate
        else if (value === "=") {
            try {
                currentInput = eval(currentInput).toString();
                display.value = currentInput;
            } catch {
                display.value = "Error";
                currentInput = "";
            }
        }

        // Percentage
        else if (value === "%") {
            currentInput = (eval(currentInput) / 100).toString();
            display.value = currentInput;
        }

        // Numbers & Operators
        else {
            currentInput += value;
            display.value = currentInput;
        }
    });
});
