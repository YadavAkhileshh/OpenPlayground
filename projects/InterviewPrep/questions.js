// Global Variables
let resumeText = "";
let questions = [];
let currentIndex = 0;
let answers = [];

// Generate Dynamic Questions Based on Resume Skills
function generateQuestions() {
  questions = [];

  let skills = [];

  // Detect Skills
  if (resumeText.includes("react")) skills.push("React");
  if (resumeText.includes("node")) skills.push("Node.js");
  if (resumeText.includes("mongodb")) skills.push("MongoDB");
  if (resumeText.includes("python")) skills.push("Python");
  if (resumeText.includes("machine learning")) skills.push("Machine Learning");
  if (resumeText.includes("internship")) skills.push("Internship Experience");

  // Dynamic Questions
  skills.forEach(skill => {
    questions.push(`Can you explain your experience with ${skill}?`);
    questions.push(`What challenges did you face while working with ${skill}?`);
  });

  // Default Questions
  questions.push("Tell me about yourself.");
  questions.push("Explain your strongest project from your resume.");
  questions.push("Why should we hire you?");
  questions.push("Where do you see yourself in 5 years?");
}
