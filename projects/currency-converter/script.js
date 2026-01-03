const currencies = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.1,
    JPY: 144.7,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.23,
    SGD: 1.35
  };
  
  const fromSelect = document.getElementById("fromCurrency");
  const toSelect = document.getElementById("toCurrency");
  const amountInput = document.getElementById("amount");
  const resultDiv = document.getElementById("result");
  const convertBtn = document.getElementById("convertBtn");
  
  // Populate dropdowns
  Object.keys(currencies).forEach(currency => {
    const option1 = new Option(currency, currency);
    const option2 = new Option(currency, currency);
    fromSelect.add(option1);
    toSelect.add(option2);
  });
  
  fromSelect.value = "USD";
  toSelect.value = "INR";
  
  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
      resultDiv.textContent = "Please enter a valid amount";
      return;
    }

    const fromRate = currencies[fromSelect.value];
    const toRate = currencies[toSelect.value];
  
    const converted = (amount / fromRate) * toRate;
  
    resultDiv.textContent = `${amount} ${fromSelect.value} = ${converted.toFixed(2)} ${toSelect.value}`;
  });
  