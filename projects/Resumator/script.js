let resume = {
  name: "",
  email: "",
  phone: "",
  summary: "",
  skills: [],
  experience: []
};

const inputs = ["name", "email", "phone", "summary"];
inputs.forEach(id => {
  document.getElementById(id).addEventListener("input", updatePreview);
});

function updatePreview() {
  resume.name = name.value;
  resume.email = email.value;
  resume.phone = phone.value;
  resume.summary = summary.value;

  document.getElementById("p-name").textContent = resume.name || "Your Name";
  document.getElementById("p-contact").textContent =
    `${resume.email || ""} ${resume.phone || ""}`;
  document.getElementById("p-summary").textContent = resume.summary;
}

function addSkill() {
  const skill = document.getElementById("skill-input").value.trim();
  if (!skill) return;

  resume.skills.push(skill);
  document.getElementById("skill-input").value = "";
  renderSkills();
}

function renderSkills() {
  const ul = document.getElementById("skills-list");
  const pUl = document.getElementById("p-skills");
  ul.innerHTML = pUl.innerHTML = "";

  resume.skills.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = s;
    li.onclick = () => removeSkill(i);
    ul.appendChild(li);

    const pli = document.createElement("li");
    pli.textContent = s;
    pUl.appendChild(pli);
  });
}

function removeSkill(index) {
  resume.skills.splice(index, 1);
  renderSkills();
}

function addExperience() {
  const role = expRole.value;
  const company = expCompany.value;
  const years = expYears.value;

  if (!role || !company || !years) return;

  resume.experience.push({ role, company, years });

  expRole.value = expCompany.value = expYears.value = "";
  renderExperience();
}

function renderExperience() {
  const ul = document.getElementById("exp-list");
  const pUl = document.getElementById("p-exp");
  ul.innerHTML = pUl.innerHTML = "";

  resume.experience.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.role} at ${exp.company} (${exp.years})`;
    ul.appendChild(li);

    const pli = document.createElement("li");
    pli.textContent = li.textContent;
    pUl.appendChild(pli);
  });
}

function downloadJSON() {
  const data = JSON.stringify(resume, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resumeData.json";
  a.click();
}
