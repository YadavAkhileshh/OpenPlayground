let nameInput = document.getElementById("nameInput");
let bioInput = document.getElementById("bioInput");
let skillsInput = document.getElementById("skillsInput");
let projectInput = document.getElementById("projectInput");
let themeColor = document.getElementById("themeColor");

nameInput.addEventListener("input", () => {
  document.getElementById("name").innerText = nameInput.value;
});

bioInput.addEventListener("input", () => {
  document.getElementById("bio").innerText = bioInput.value;
});

skillsInput.addEventListener("input", () => {
  let skills = skillsInput.value.split(",");
  let ul = document.getElementById("skills");
  ul.innerHTML = "";
  skills.forEach(skill => {
    let li = document.createElement("li");
    li.innerText = skill.trim();
    ul.appendChild(li);
  });
});

projectInput.addEventListener("input", () => {
  document.getElementById("project").innerText = projectInput.value;
});

themeColor.addEventListener("input", () => {
  document.getElementById("preview").style.borderColor = themeColor.value;
});