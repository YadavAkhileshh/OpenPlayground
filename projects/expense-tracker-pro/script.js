const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");
const filterCategory = document.getElementById("filterCategory");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function save(){
    localStorage.setItem("transactions",JSON.stringify(transactions));
}

function updateBalance(){
    const total = transactions.reduce((acc,t)=>acc + t.amount,0);
    balanceEl.textContent = total.toFixed(2);
}

function render(){
    list.innerHTML="";
    const filter = filterCategory.value;

    const filtered = filter==="All"
        ? transactions
        : transactions.filter(t=>t.category===filter);

    filtered.forEach(t=>{
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${t.desc} (${t.category})</span>
            <span>$${t.amount}</span>
            <button class="delete">X</button>
        `;
        li.querySelector("button").onclick = ()=>{
            transactions = transactions.filter(tr=>tr.id!==t.id);
            save();
            render();
        };
        list.appendChild(li);
    });

    updateBalance();
    drawChart();
}

function drawChart(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const categories = {};
    transactions.forEach(t=>{
        if(t.amount < 0){
            categories[t.category] =
                (categories[t.category]||0) + Math.abs(t.amount);
        }
    });

    const keys = Object.keys(categories);
    const max = Math.max(...Object.values(categories),1);

    keys.forEach((key,index)=>{
        const value = categories[key];
        const barHeight = (value/max)*200;

        ctx.fillStyle="#66a6ff";
        ctx.fillRect(index*120+50,250-barHeight,80,barHeight);
        ctx.fillStyle="black";
        ctx.fillText(key,index*120+50,270);
    });
}

addBtn.addEventListener("click",()=>{
    if(desc.value===""||amount.value==="") return;

    transactions.push({
        id:Date.now(),
        desc:desc.value,
        amount:Number(amount.value),
        category:category.value
    });

    desc.value="";
    amount.value="";
    save();
    render();
});

filterCategory.addEventListener("change",render);

render();
