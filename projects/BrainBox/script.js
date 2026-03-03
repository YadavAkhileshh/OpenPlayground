function showSection(id){
    document.querySelectorAll('.section').forEach(sec=>sec.style.display='none');
    document.getElementById(id).style.display='block';
}

let startTime;
function startGame(){
    const box=document.getElementById('reactionBox');
    box.style.background='red';
    box.innerText='Wait...';
    setTimeout(()=>{
        box.style.background='green';
        box.innerText='Click!';
        startTime=new Date().getTime();
        box.onclick=function(){
            let endTime=new Date().getTime();
            document.getElementById('reactionResult').innerText="Reaction Time: "+(endTime-startTime)+" ms";
        }
    },Math.random()*3000+2000);
}

const quizData=[
    {q:"Capital of France?",a:["Paris","Rome","Berlin"],c:0},
    {q:"5 + 7 = ?",a:["10","12","14"],c:1},
    {q:"Sun rises from?",a:["West","East","North"],c:1}
];

function startQuiz(){
    let current=0;
    let score=0;
    function loadQ(){
        if(current>=quizData.length){
            document.getElementById('quizResult').innerText="Score: "+score+"/"+quizData.length;
            return;
        }
        let q=quizData[current];
        document.getElementById('question').innerText=q.q;
        let ansDiv=document.getElementById('answers');
        ansDiv.innerHTML="";
        q.a.forEach((ans,i)=>{
            let btn=document.createElement('button');
            btn.innerText=ans;
            btn.onclick=function(){
                if(i===q.c) score++;
                current++;
                loadQ();
            }
            ansDiv.appendChild(btn);
        });
    }
    loadQ();
}

function generatePassword(){
    let length=document.getElementById('length').value;
    let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass="";
    for(let i=0;i<length;i++){
        pass+=chars.charAt(Math.floor(Math.random()*chars.length));
    }
    document.getElementById('passwordOutput').innerText=pass;
}
