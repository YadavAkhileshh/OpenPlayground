const courses = [
  {
    id: 1,
    title: "Web Development Basics",
    description: "HTML, CSS & JavaScript fundamentals",
    progress: 0
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    description: "Closures, async, DOM & projects",
    progress: 0
  },
  {
    id: 3,
    title: "Cyber Security 101",
    description: "Networks, threats & protection",
    progress: 0
  }
];

const container = document.getElementById("courseContainer");
let currentCourse = null;

function loadCourses() {
  container.innerHTML = "";
  courses.forEach(course => {
    container.innerHTML += `
      <div class="course-card">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <button onclick="openCourse(${course.id})">View Course</button>
      </div>
    `;
  });
}

function openCourse(id) {
  currentCourse = courses.find(c => c.id === id);
  document.getElementById("courseTitle").innerText = currentCourse.title;
  document.getElementById("courseDesc").innerText = currentCourse.description;
  updateProgress();
  document.getElementById("courseModal").style.display = "block";
}

function closeModal() {
  document.getElementById("courseModal").style.display = "none";
}

function completeLesson() {
  if (currentCourse.progress < 100) {
    currentCourse.progress += 20;
    updateProgress();
  }
}

function updateProgress() {
  document.getElementById("progressBar").style.width =
    currentCourse.progress + "%";
}

loadCourses();
