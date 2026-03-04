const courses = [
  {
    title: "HTML Basics",
    content: "Learn structure of web pages using HTML elements."
  },
  {
    title: "CSS Fundamentals",
    content: "Style websites using colors, layouts, and animations."
  },
  {
    title: "JavaScript Basics",
    content: "Learn variables, loops, functions, and DOM manipulation."
  },
  {
    title: "DSA Introduction",
    content: "Understand arrays, strings, sorting, and searching algorithms."
  }
];

const courseList = document.getElementById("courseList");
const lessonTitle = document.getElementById("lessonTitle");
const lessonContent = document.getElementById("lessonContent");

courses.forEach(course => {
  const li = document.createElement("li");
  li.textContent = course.title;

  li.addEventListener("click", () => {
    lessonTitle.textContent = course.title;
    lessonContent.textContent = course.content;
  });

  courseList.appendChild(li);
});

/* ---------- Code Runner ---------- */
document.getElementById("runBtn").addEventListener("click", () => {
  const code = document.getElementById("codeEditor").value;
  const output = document.getElementById("outputBox");

  try {
    const runner = new Function(code + "; return solve;");
    const solve = runner();
    output.value = solve();
  } catch (err) {
    output.value = "Error: " + err.message;
  }
});