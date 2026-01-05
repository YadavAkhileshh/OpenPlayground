function calculateTip(){


    // get the input type values
    const billAmount = parseFloat(document.getElementById("bill-amount").value);
    const tipPercentage = parseFloat(document.getElementById("tip-percentage").value);

    // Calculate the Tip and Total Amount

    const tipAmount = billAmount * (tipPercentage/100);
    const totalAmount = tipAmount + billAmount;

    // Display the Results
    document.getElementById("tip-amount").textContent = '$' + tipAmount.toFixed(2);
    document.getElementById("total-amount").textContent = '$' + totalAmount.toFixed(2);

}