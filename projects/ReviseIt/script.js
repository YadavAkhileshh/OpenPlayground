const toggleBtn = document.getElementById("themeToggle");

if (toggleBtn) {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    toggleBtn.textContent = "☀️";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
      toggleBtn.textContent = "☀️";
      localStorage.setItem("theme", "light");
    } else {
      toggleBtn.textContent = "🌙";
      localStorage.setItem("theme", "dark");
    }
  });
}

const topics = [
{
  id: "html",
  title: "HTML",
   image: "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=800&q=80",
  sections: {
    "What is HTML?": [
      "HTML stands for HyperText Markup Language",
      "Used to structure web pages",
      "Defines content using tags"
    ],
    "Basic Structure": [
      "<!DOCTYPE html>",
      "<html>, <head>, <body>"
    ],
    "Important Tags": [
      "<div>, <span>",
      "<a>, <img>",
      "<form>, <input>"
    ],
    "Semantic HTML": [
      "<header>, <footer>",
      "<section>, <article>"
    ],
    "Interview Notes": [
      "HTML5 introduced semantic tags",
      "Accessibility depends on proper tags"
    ]
  }
},

{
  id: "css",
  title: "CSS",
   image: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "CSS styles HTML content",
      "Controls layout and visuals"
    ],
    "Box Model": [
      "Content",
      "Padding",
      "Border",
      "Margin"
    ],
    "Layouts": [
      "Flexbox – 1D layout",
      "Grid – 2D layout"
    ],
    "Responsive Design": [
      "Media queries",
      "Relative units"
    ],
    "Interview Notes": [
      "Flexbox vs Grid is common question"
    ]
  }
},

{
  id: "javascript",
  title: "JavaScript",
  image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "JavaScript adds interactivity",
      "Runs in browser and Node.js"
    ],
    "Core Concepts": [
      "let, const",
      "Functions",
      "Scope"
    ],
    "Arrays & Objects": [
      "map, filter, reduce",
      "Key-value pairs"
    ],
    "Async JS": [
      "Promises",
      "async/await"
    ],
    "Interview Notes": [
      "Closures are very important"
    ]
  }
},

{
  id: "react",
  title: "React",
  image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "React is a UI library",
      "Component-based"
    ],
    "Core": [
      "JSX",
      "Props",
      "State"
    ],
    "Hooks": [
      "useState",
      "useEffect"
    ],
    "Performance": [
      "Virtual DOM",
      "Memoization"
    ],
    "Interview Notes": [
      "Hooks replaced class components"
    ]
  }
},

{
  id: "ds",
  title: "Data Structures",
  image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Organize data efficiently"
    ],
    "Linear DS": [
      "Array",
      "Stack",
      "Queue"
    ],
    "Non-Linear DS": [
      "Tree",
      "Graph"
    ],
    "Usage": [
      "Stacks → Undo",
      "Queues → Scheduling"
    ],
    "Interview Notes": [
      "Time complexity matters"
    ]
  }
},

{
  id: "algo",
  title: "Algorithms",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Step-by-step problem solving"
    ],
    "Searching": [
      "Linear Search",
      "Binary Search"
    ],
    "Sorting": [
      "Bubble",
      "Merge",
      "Quick"
    ],
    "Techniques": [
      "Recursion",
      "Greedy",
      "DP"
    ],
    "Interview Notes": [
      "Explain complexity clearly"
    ]
  }
},

{
  id: "dbms",
  title: "DBMS",
  image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Manages data efficiently"
    ],
    "Keys": [
      "Primary",
      "Foreign"
    ],
    "Concepts": [
      "Normalization",
      "Indexing"
    ],
    "Transactions": [
      "ACID properties"
    ],
    "Interview Notes": [
      "Normalization forms are important"
    ]
  }
},

{
  id: "sql",
  title: "SQL",
  image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Query relational databases"
    ],
    "Commands": [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE"
    ],
    "Clauses": [
      "WHERE",
      "GROUP BY",
      "HAVING"
    ],
    "Joins": [
      "INNER",
      "LEFT",
      "RIGHT"
    ],
    "Interview Notes": [
      "JOINs are heavily asked"
    ]
  }
},

{
  id: "os",
  title: "Operating System",
  image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Manages hardware & software"
    ],
    "Processes": [
      "Process vs Thread"
    ],
    "Scheduling": [
      "FCFS",
      "Round Robin"
    ],
    "Memory": [
      "Paging",
      "Virtual Memory"
    ],
    "Interview Notes": [
      "Deadlock conditions are common"
    ]
  }
},

{
  id: "cn",
  title: "Computer Networks",
  image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
  sections: {
    "Overview": [
      "Data communication systems"
    ],
    "Models": [
      "OSI Model",
      "TCP/IP"
    ],
    "Protocols": [
      "HTTP",
      "HTTPS",
      "FTP"
    ],
    "Concepts": [
      "IP Address",
      "DNS"
    ],
    "Interview Notes": [
      "OSI layers order is mandatory"
    ]
  }
}
];

// INDEX PAGE
const grid = document.getElementById("topicGrid");
if (grid) {
  topics.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${t.image}" />
      <h3>${t.title}</h3>
    `;
    card.onclick = () => {
      localStorage.setItem("topic", JSON.stringify(t));
      window.location.href = "cheatsheet.html";
    };
    grid.appendChild(card);
  });
}

// CHEAT SHEET PAGE
const topic = JSON.parse(localStorage.getItem("topic"));
if (topic) {
  document.getElementById("title").innerText = topic.title;

  const content = document.getElementById("content");
  for (let section in topic.sections) {
    const div = document.createElement("div");
    div.className = "section";
    div.innerHTML = `
      <h2>${section}</h2>
      <ul>
        ${topic.sections[section].map(p => `<li>${p}</li>`).join("")}
      </ul>
    `;
    content.appendChild(div);
  }
}



