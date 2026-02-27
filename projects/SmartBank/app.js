// SIGNUP
const signupForm=document.getElementById("signupForm");
if(signupForm){
    signupForm.addEventListener("submit",e=>{
        e.preventDefault();
        const user={
            name:name.value,
            email:email.value,
            phone:phone.value,
            password:password.value
        };
        localStorage.setItem("user",JSON.stringify(user));
        alert("Account Created!");
        window.location.href="index.html";
    });
}

// LOGIN
const loginForm=document.getElementById("loginForm");
if(loginForm){
    loginForm.addEventListener("submit",e=>{
        e.preventDefault();
            const user=JSON.parse(localStorage.getItem("user"));
            if(user && user.email===loginEmail.value && user.password===loginPassword.value){
            localStorage.setItem("loggedIn",true);
            window.location.href="dashboard.html";
        }else{
            alert("Invalid Credentials");
        }
    });
}

let transactions=JSON.parse(localStorage.getItem("bankTx"))||[];
let editIndex=null;
const ctx=document.getElementById("chart").getContext("2d");

function save(){localStorage.setItem("bankTx",JSON.stringify(transactions))}

function render(){
  const list=document.getElementById("list");
  const month=document.getElementById("monthFilter").value;
  let income=0,expense=0;
  list.innerHTML="";

  transactions.forEach((t,i)=>{
    if(month && !t.date.startsWith(month)) return;
    t.type==="credit"?income+=t.amount:expense+=t.amount;

    list.innerHTML+=`
    <div class="tx-card">
      <div>
        <b>${t.title}</b><br>
        <small>${t.date}</small>
      </div>
      <div class="${t.type}">
        ${t.type==="credit"?"+":"-"}₹${t.amount}
      </div>
      <div class="tx-actions">
        <button class="edit" onclick="editTx(${i})">Edit</button>
        <button class="delete" onclick="delTx(${i})">Delete</button>
      </div>
    </div>`;
  });

  balance.textContent="₹"+(income-expense);
  income.textContent="₹"+income;
  expense.textContent="₹"+expense;
  drawLineChart(income,expense);
}

function drawLineChart(income,expense){
  ctx.clearRect(0,0,400,260);
  ctx.strokeStyle="#2563eb";
  ctx.beginPath();
  ctx.moveTo(50,200-income/50);
  ctx.lineTo(200,200-expense/50);
  ctx.stroke();
}

form.onsubmit=e=>{
  e.preventDefault();
  const tx={title:title.value,amount:+amount.value,type:type.value,date:date.value};
  editIndex===null?transactions.unshift(tx):transactions[editIndex]=tx;
  editIndex=null;
  save();render();form.reset();
};

function editTx(i){
  const t=transactions[i];
  title.value=t.title;amount.value=t.amount;type.value=t.type;date.value=t.date;
  editIndex=i;
}

function delTx(i){
  transactions.splice(i,1);
  save();render();
}

function exportCSV(){
  let csv="Title,Amount,Type,Date\n";
  transactions.forEach(t=>csv+=`${t.title},${t.amount},${t.type},${t.date}\n`);
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="transactions.csv";
  a.click();
}

/* THEME */
themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");
};
if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark");

monthFilter.onchange=render;
render();