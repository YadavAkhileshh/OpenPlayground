let syllabus = JSON.parse(localStorage.getItem("syllabus")) || {};

const subjectInput = document.getElementById("subject");
const unitInput = document.getElementById("unit");
const hourInput = document.getElementById("unitHours");
const addBtn = document.getElementById("addUnitBtn");
const listDiv = document.getElementById("syllabusList");

addBtn.addEventListener("click", function(){

  const subject = subjectInput.value.trim();
  const unit = unitInput.value.trim();
  const hours = Number(hourInput.value);

  if (hours <= 0) {
    alert("Hours must be greater than 0");
    return;
  }

  if(!subject || !unit || !hours) return;

  if(!syllabus[subject]){
    syllabus[subject] = [];
  }

  syllabus[subject].push({
    unit,
    hours,
    done:0
  });

  localStorage.setItem("syllabus", JSON.stringify(syllabus));

  subjectInput.value="";
  unitInput.value="";
  hourInput.value="";

  renderSyllabus();
});

function renderSyllabus(){
  listDiv.innerHTML="";

  for(let sub in syllabus){
    const h4 = document.createElement("h4");
    h4.textContent = sub;
    listDiv.appendChild(h4);

    syllabus[sub].forEach(u=>{
      const p = document.createElement("p");
      p.textContent = `${u.unit} - ${u.hours}h`;
      listDiv.appendChild(p);
    });
  }
}

renderSyllabus();