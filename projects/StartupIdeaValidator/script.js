function analyzeIdea() {
  const name = document.getElementById("ideaName").value;
  const desc = document.getElementById("ideaDesc").value;
  const industry = document.getElementById("industry").value;
  const complexity = document.getElementById("complexity").value;
  const resultBox = document.getElementById("resultBox");

  if (!name || !desc) {
    resultBox.innerHTML = "<p>Please fill all fields.</p>";
    return;
  }

  let marketScore = Math.floor(Math.random() * 30) + 70; // 70–100
  let difficultyScore = complexity === "high" ? 80 : complexity === "medium" ? 60 : 40;

  let techStack = {
    fintech: "React, Node.js, PostgreSQL, Stripe API",
    edtech: "Next.js, Firebase, Video Streaming APIs",
    healthtech: "React, Node.js, MongoDB, Secure Auth",
    saas: "React, Express, PostgreSQL, Cloud Deployment",
    ecommerce: "React, Node.js, Payment Gateway, MongoDB"
  };

  let monetization = {
    fintech: "Transaction fees, premium accounts",
    edtech: "Subscription model, course sales",
    healthtech: "Subscription, partnerships with clinics",
    saas: "Monthly subscription, tiered pricing",
    ecommerce: "Product margins, ads, affiliate marketing"
  };

  let recommendation =
    marketScore > 85
      ? "Strong market potential. Consider building MVP immediately."
      : "Moderate opportunity. Validate with real users before scaling.";

  resultBox.innerHTML = `
    <div class="result-box">
      <p><strong>Startup:</strong> ${name}</p>
      <p><strong>Market Opportunity Score:</strong> ${marketScore}/100</p>
      <p><strong>Technical Difficulty:</strong> ${difficultyScore}/100</p>

      <p><strong>Recommended Tech Stack:</strong> 
        <span class="highlight">${techStack[industry]}</span>
      </p>

      <p><strong>Monetization Strategy:</strong> 
        ${monetization[industry]}
      </p>

      <p><strong>Strategic Insight:</strong> 
        ${recommendation}
      </p>
    </div>
  `;
}
