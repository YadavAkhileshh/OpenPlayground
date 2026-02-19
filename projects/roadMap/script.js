
const roadmaps = {
  fullstack: [
    { type: "node", title: "HTML", tip: "Structure, forms, semantics" },
    { type: "node", title: "CSS", tip: "Flexbox, Grid, responsive design" },
    { type: "node", title: "JavaScript", tip: "DOM, events, async JS" },
    { type: "checkpoint", title: "Frontend Basics" },
    { type: "node", title: "Node.js", tip: "Server-side JS" },
    { type: "node", title: "Express.js", tip: "Web frameworks" },
    { type: "node", title: "Databases", tip: "SQL & NoSQL" },
    { type: "checkpoint", title: "Backend Basics" },
    { type: "node", title: "Git & GitHub", tip: "Version control" },
    { type: "node", title: "React", tip: "Components, hooks" },
    { type: "checkpoint", title: "Full Stack Ready" }

  ],

  datascience: [
    { type: "node", title: "Python", tip: "Syntax, loops, functions" },
    { type: "node", title: "Statistics", tip: "Probability, distributions" },
    { type: "node", title: "Pandas & NumPy", tip: "Data analysis" },
    { type: "checkpoint", title: "Data Handling" },
    { type: "node", title: "Data Visualization", tip: "Matplotlib, Seaborn" },
    { type: "node", title: "SQL", tip: "Database queries" },
    { type: "checkpoint", title: "Data Insights" },
    { type: "node", title: "Machine Learning", tip: "Regression, classification" }
  ],

  dataanalyst: [
    { type: "node", title: "Excel", tip: "Formulas, pivot tables" },
    { type: "node", title: "SQL", tip: "Queries, joins" },
    { type: "checkpoint", title: "Reporting Skills" },
    { type: "node", title: "Python/R", tip: "Data manipulation" },
    { type: "node", title: "Power BI / Tableau", tip: "Dashboards" }
  ],

  cybersecurity: [
    { type: "node", title: "Networking", tip: "IP, DNS, TCP/IP" },
    { type: "node", title: "Linux", tip: "Commands, permissions" },
    { type: "checkpoint", title: "System Foundations" },
    { type: "node", title: "Ethical Hacking", tip: "Recon, scanning" },
    { type: "node", title: "Web Security", tip: "OWASP Top 10" }
  ],

  clouddevops: [
    { type: "node", title: "Linux", tip: "Shell basics" },
    { type: "node", title: "Cloud Basics", tip: "AWS, Azure" },
    { type: "checkpoint", title: "Core Cloud" },
    { type: "node", title: "Docker", tip: "Containers" },
    { type: "node", title: "Kubernetes", tip: "Orchestration" },
    { type: "checkpoint", title: "Containerization" },
    { type: "node", title: "CI / CD", tip: "Automation pipelines" }
  ],

  aiml: [
    { type: "node", title: "Math Basics", tip: "Linear algebra" },
    { type: "node", title: "Python", tip: "Data handling" },
    { type: "checkpoint", title: "Foundations" },
    { type: "node", title: "Statistics", tip: "Probability, distributions" },
    { type: "node", title: "Data Visualization", tip: "Matplotlib, Seaborn" },
    { type: "checkpoint", title: "Data Skills" },
    { type: "node", title: "Machine Learning", tip: "Models" },
    { type: "node", title: "Deep Learning", tip: "Neural networks" }
  ],
  uiux: [
    { type: "node", title: "Design Basics", tip: "Color, typography, spacing" },
    { type: "node", title: "UX Principles", tip: "Usability, accessibility" },
    { type: "checkpoint", title: "Design Foundations" },
    { type: "node", title: "Wireframing", tip: "Low & high fidelity" },
    { type: "node", title: "Figma", tip: "Design systems, prototypes" },
    { type: "checkpoint", title: "UI Skills" },
    { type: "node", title: "User Testing", tip: "Feedback, iteration" }
  ],

  android: [
    { type: "node", title: "Java / Kotlin", tip: "Syntax and OOP" },
    { type: "node", title: "Android Basics", tip: "Activities, intents" },
    { type: "checkpoint", title: "Android Foundations" },
    { type: "node", title: "UI Layouts", tip: "XML, Material UI" },
    { type: "node", title: "APIs", tip: "REST integration" },
    { type: "checkpoint", title: "App Development" },
    { type: "node", title: "Play Store", tip: "Release and updates" }
  ],

  ios: [
    { type: "node", title: "Swift Basics", tip: "Syntax, variables" },
    { type: "node", title: "iOS Fundamentals", tip: "UIKit, SwiftUI" },
    { type: "checkpoint", title: "iOS Foundations" },
    { type: "node", title: "App Architecture", tip: "MVC, MVVM" },
    { type: "node", title: "APIs", tip: "Networking and JSON" },
    { type: "checkpoint", title: "Production Ready" }
  ],

  blockchain: [
    { type: "node", title: "Blockchain Basics", tip: "Decentralization" },
    { type: "node", title: "Cryptography", tip: "Hashing, wallets" },
    { type: "checkpoint", title: "Blockchain Core" },
    { type: "node", title: "Smart Contracts", tip: "Solidity" },
    { type: "node", title: "Ethereum", tip: "Gas, transactions" },
    { type: "checkpoint", title: "Web3 Developer" }
  ],

  gamedev: [
    { type: "node", title: "Programming Basics", tip: "C# or C++" },
    { type: "node", title: "Game Engines", tip: "Unity or Unreal" },
    { type: "checkpoint", title: "Game Foundations" },
    { type: "node", title: "Game Physics", tip: "Collisions, movement" },
    { type: "node", title: "Game Assets", tip: "Sprites, audio" },
    { type: "checkpoint", title: "Game Developer" }
  ],

  backend: [
    { type: "node", title: "Programming Language", tip: "Node, Java, Python" },
    { type: "node", title: "APIs", tip: "REST principles" },
    { type: "checkpoint", title: "Backend Core" },
    { type: "node", title: "Databases", tip: "SQL & NoSQL" },
    { type: "node", title: "Auth", tip: "JWT, sessions" },
    { type: "checkpoint", title: "Backend Ready" }
  ],

  testing: [
    { type: "node", title: "Testing Basics", tip: "Why testing matters" },
    { type: "node", title: "Unit Testing", tip: "Jest, Mocha" },
    { type: "checkpoint", title: "Test Foundations" },
    { type: "node", title: "Integration Testing", tip: "API tests" },
    { type: "node", title: "Automation", tip: "Cypress, Selenium" },
    { type: "checkpoint", title: "QA Engineer" }
  ],

  devrel: [
    { type: "node", title: "Technical Writing", tip: "Docs, blogs" },
    { type: "node", title: "Public Speaking", tip: "Talks, demos" },
    { type: "checkpoint", title: "Communication" },
    { type: "node", title: "Community", tip: "Open source" },
    { type: "node", title: "Developer Tools", tip: "APIs, SDKs" },
    { type: "checkpoint", title: "DevRel Role" }
  ],

  product: [
    { type: "node", title: "Product Basics", tip: "User needs" },
    { type: "node", title: "Market Research", tip: "User interviews" },
    { type: "checkpoint", title: "Discovery Phase" },
    { type: "node", title: "Roadmapping", tip: "Prioritization" },
    { type: "node", title: "Metrics", tip: "KPIs, OKRs" },
    { type: "checkpoint", title: "Product Manager" }
  ],

  freelancing: [
    { type: "node", title: "Skill Building", tip: "Choose a niche" },
    { type: "node", title: "Portfolio", tip: "Showcase work" },
    { type: "checkpoint", title: "Freelance Setup" },
    { type: "node", title: "Clients", tip: "Upwork, LinkedIn" },
    { type: "node", title: "Pricing", tip: "Value-based pricing" },
    { type: "checkpoint", title: "Freelance Career" }
  ]
};

const container = document.getElementById("roadmapContainer");

function showRoadmap(name) {
  container.innerHTML = "";

  roadmaps[name].forEach(item => {
    if (item.type === "node") {
      const div = document.createElement("div");
      div.className = "node yellow";
      div.innerHTML = `
        ${item.title}
        <span class="tooltip">${item.tip}</span>
      `;
      container.appendChild(div);
    } else {
      const cp = document.createElement("div");
      cp.className = "checkpoint";
      cp.textContent = `Checkpoint – ${item.title}`;
      container.appendChild(cp);
    }
  });
}

// load default roadmap
showRoadmap("fullstack");