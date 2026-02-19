function generatePlan(){

  const oldPlan = JSON.parse(localStorage.getItem("plan")) || [];

  const user = JSON.parse(localStorage.getItem("user"));
  const syllabus = JSON.parse(localStorage.getItem("syllabus"));

  if(Object.keys(syllabus).length === 0){
  alert("Please add syllabus first");
  return;
}


  if(!user || !syllabus) return;

  const examDate = new Date(user.examDate);
  const today = new Date();

  const daysLeft = Math.ceil(
    (examDate - today) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
  alert("Exam date must be in the future");
  return;
}

  const dailyLimit = user.dailyHours;

  let units = [];

  
  for(let subject in syllabus){
    syllabus[subject].forEach(u=>{
      units.push({
        subject,
        unit: u.unit,
        remaining: u.hours
      });
    });
  }

  let plan = [];
  let unitIndex = 0;

  for(let d = 0; d < daysLeft; d++){

    let capacity = dailyLimit;
    let tasks = [];

    while(capacity > 0 && unitIndex < units.length){

      let current = units[unitIndex];

      let assigned = Math.min(current.remaining, capacity);

      tasks.push({
        subject: current.subject,
        unit: current.unit,
        hours: assigned
      });

      current.remaining -= assigned;
      capacity -= assigned;

      if(current.remaining === 0){
        unitIndex++;
      }
    }

    plan.push({
      date: new Date(today.getTime() + d*86400000)
              .toISOString().split("T")[0],
      tasks
    });
  }

  localStorage.setItem("plan", JSON.stringify(plan));
}