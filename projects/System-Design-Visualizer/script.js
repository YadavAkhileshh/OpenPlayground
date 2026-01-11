const steps=[
    {
        text:"User enters a long URL",
        desc:"The user provides a long website URL that they want to shorten."
    },
    {
        text:"Request reaches server",
        desc:"The request is sent to the backend server for processing."
    },
    {
        text:"Short code generated",
        desc:"The server generates a unique short code for the URL."
    },
    {
        text:"Stored in database",
        desc:"The mapping between long URL and short code is saved."
    },
    {
        text:"Short URL returned",
        desc:"The shortened URL is sent back to the user."
    }
];

let currentStep=-1;

const startBtn=document.getElementById("startBtn");
const nextBtn=document.getElementById("nextBtn");
const resetBtn=document.getElementById("resetBtn");
const explanationText=document.getElementById("explanationText");

function clearActive(){
    for(let i=0;i<steps.length;i++){
        document.getElementById("step"+i).classList.remove("active");
    }
}

function showStep(){
    clearActive();
    if(currentStep>=0 && currentStep<steps.length){
        document.getElementById("step"+currentStep).classList.add("active");
        explanationText.textContent=steps[currentStep].desc;
    }
}

startBtn.onclick=()=>{
    currentStep=0;
    showStep();
    nextBtn.disabled=false;
};

nextBtn.onclick=()=>{
    currentStep++;
    if(currentStep<steps.length){
        showStep();
    }else{
        explanationText.textContent="Flow completed. Click Reset to start again.";
        nextBtn.disabled=true;
    }
};

resetBtn.onclick=()=>{
    currentStep=-1;
    clearActive();
    explanationText.textContent="Click \"Start\" to begin the visualization.";
    nextBtn.disabled=true;
};
