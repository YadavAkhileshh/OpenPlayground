function recommendStack() {

    const project = document.getElementById("projectType").value;
    const team = document.getElementById("teamSize").value;
    const performance = document.getElementById("performance").value;
    const deployment = document.getElementById("deployment").value;

    let frontend = "";
    let backend = "";
    let database = "";
    let devops = "";

    // Project Type Logic
    if (project === "web") {
        frontend = "React or Next.js";
        backend = "Node.js (Express)";
        database = "MongoDB or PostgreSQL";
    }

    if (project === "mobile") {
        frontend = "React Native or Flutter";
        backend = "Node.js or Firebase";
        database = "Firebase or PostgreSQL";
    }

    if (project === "ai") {
        frontend = "Streamlit or React";
        backend = "Python (FastAPI)";
        database = "PostgreSQL + Redis";
    }

    if (project === "startup") {
        frontend = "Next.js";
        backend = "Node.js";
        database = "MongoDB";
    }

    // Performance override
    if (performance === "high") {
        backend = "Go or FastAPI";
        database = "PostgreSQL + Redis Cache";
    }

    // Team size influence
    if (team === "large") {
        devops = "Docker + Kubernetes";
    } else {
        devops = "Docker";
    }

    // Deployment logic
    if (deployment === "serverless") {
        devops += " + AWS Lambda";
    } else if (deployment === "cloud") {
        devops += " + AWS / GCP";
    } else {
        devops += " + Nginx on VPS";
    }

    const result = `
    <strong>Frontend:</strong> ${frontend} <br>
    <strong>Backend:</strong> ${backend} <br>
    <strong>Database:</strong> ${database} <br>
    <strong>DevOps:</strong> ${devops}
    `;

    document.getElementById("stackResult").innerHTML = result;
}
