function calculateProgress(plan){

  let total=0;
  let done=0;

  plan.forEach(day=>{
    day.tasks.forEach(task=>{
      total++;
      if(task.completed) done++;
    });
  });

  return total===0 ? 0 : Math.round((done/total)*100);
}

function checkPanic(user, syllabus){

  const examDate=new Date(user.examDate);
  const today=new Date();

  const daysLeft=Math.ceil(
    (examDate-today)/(1000*60*60*24)
  );

  let remainingHours=0;

  for(let subject in syllabus){
    syllabus[subject].forEach(u=>{
      remainingHours += (u.hours - u.done);
    });
  }

  return remainingHours > daysLeft * user.dailyHours;
}