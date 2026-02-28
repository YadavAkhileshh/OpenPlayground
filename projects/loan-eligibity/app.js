// Advanced Loan Eligibility Calculator JS

document.addEventListener('DOMContentLoaded', function () {
  const loanForm = document.getElementById('loanForm');
  const loanResult = document.getElementById('loanResult');

  loanForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // Get values
    const name = document.getElementById('fullName').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const existingLoans = parseFloat(document.getElementById('existingLoans').value);
    const employment = document.getElementById('employment').value;
    const creditScore = parseInt(document.getElementById('creditScore').value);
    const loanType = document.getElementById('loanType').value;
    const desiredAmount = parseFloat(document.getElementById('desiredAmount').value);
    const tenure = parseInt(document.getElementById('tenure').value);

    // Advanced calculations
    let eligible = true;
    let reasons = [];
    let maxLoan = 0;
    let interestRate = 0;
    let emi = 0;
    let maxEmi = (income - expenses - existingLoans) * 0.5;

    // Interest rates by loan type and credit score
    if (loanType === 'Home') interestRate = creditScore > 750 ? 7.5 : 8.5;
    else if (loanType === 'Personal') interestRate = creditScore > 750 ? 10.5 : 13.5;
    else if (loanType === 'Car') interestRate = creditScore > 750 ? 8.5 : 10.5;
    else interestRate = creditScore > 750 ? 9.0 : 11.0;

    // Max loan logic
    if (employment === 'Salaried') maxLoan = income * tenure * 12 * 0.6;
    else if (employment === 'Self-Employed') maxLoan = income * tenure * 12 * 0.5;
    else if (employment === 'Business Owner') maxLoan = income * tenure * 12 * 0.7;
    else maxLoan = income * tenure * 12 * 0.3;
    maxLoan -= existingLoans * tenure * 12;
    if (maxLoan < 0) maxLoan = 0;

    // EMI calculation
    let r = interestRate / 1200;
    let n = tenure * 12;
    emi = desiredAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

    // Eligibility checks
    if (age < 18 || age > 70) {
      eligible = false;
      reasons.push('Age must be between 18 and 70.');
    }
    if (income < 10000) {
      eligible = false;
      reasons.push('Monthly income must be at least ₹10,000.');
    }
    if (creditScore < 650) {
      eligible = false;
      reasons.push('Credit score is too low for most loans.');
    }
    if (emi > maxEmi) {
      eligible = false;
      reasons.push('EMI exceeds your safe monthly limit.');
    }
    if (desiredAmount > maxLoan) {
      eligible = false;
      reasons.push('Desired loan amount exceeds your maximum eligibility.');
    }

    // Result output
    loanResult.style.display = 'block';
    loanResult.innerHTML = `<h3>Eligibility Result for ${name}</h3>
      <ul>
        <li><strong>Loan Type:</strong> ${loanType}</li>
        <li><strong>Interest Rate:</strong> ${interestRate.toFixed(2)}% p.a.</li>
        <li><strong>Max Eligible Loan:</strong> ₹${maxLoan.toLocaleString()}</li>
        <li><strong>Requested Amount:</strong> ₹${desiredAmount.toLocaleString()}</li>
        <li><strong>Estimated EMI:</strong> ₹${emi.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
        <li><strong>Max Safe EMI:</strong> ₹${maxEmi.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
        <li><strong>Credit Score:</strong> ${creditScore}</li>
      </ul>
      <h3 style="color:${eligible?'#047857':'#b91c1c'};margin-top:18px;">${eligible ? 'Eligible ✅' : 'Not Eligible ❌'}</h3>
      ${reasons.length ? `<ul style='color:#b91c1c;'>${reasons.map(r=>`<li>${r}</li>`).join('')}</ul>` : '<ul style="color:#047857;"><li>Congratulations! You are eligible for this loan.</li></ul>'}
    `;
  });
});
