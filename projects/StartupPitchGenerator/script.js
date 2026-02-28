function generatePitch() {
  const name = document.getElementById("name").value;
  const problem = document.getElementById("problem").value;
  const solution = document.getElementById("solution").value;
  const target = document.getElementById("target").value;
  const model = document.getElementById("model").value;

  const output = document.getElementById("pitchOutput");

  if (!name || !problem || !solution || !target) {
    output.innerHTML = "<p>Please fill all fields.</p>";
    return;
  }

  const revenueModels = {
    subscription: "Recurring monthly subscription with tiered pricing.",
    ads: "Ad-based revenue through strategic brand partnerships.",
    transaction: "Small commission per transaction processed.",
    freemium: "Free core features with premium upgrade options."
  };

  const marketSize = Math.floor(Math.random() * 500) + 100;

  output.innerHTML = `
    <div class="slide">
      <h3>1. Problem</h3>
      <p>${problem}</p>
    </div>

    <div class="slide">
      <h3>2. Solution</h3>
      <p>${solution}</p>
    </div>

    <div class="slide">
      <h3>3. Market Opportunity</h3>
      <p>Targeting ${target}. Estimated market size: $${marketSize}M.</p>
    </div>

    <div class="slide">
      <h3>4. Product</h3>
      <p>${name} is designed to provide scalable and user-friendly solutions in this space.</p>
    </div>

    <div class="slide">
      <h3>5. Revenue Model</h3>
      <p>${revenueModels[model]}</p>
    </div>

    <div class="slide">
      <h3>6. Growth Strategy</h3>
      <p>Leverage digital marketing, partnerships, and early adopter communities.</p>
    </div>
  `;
}
