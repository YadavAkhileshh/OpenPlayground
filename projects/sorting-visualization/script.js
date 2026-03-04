const barsContainer = document.getElementById("barsContainer");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const generateBtn = document.getElementById("generate");
const startBtn = document.getElementById("start");
const algorithmSelect = document.getElementById("algorithm");

let array = [];
let delay = 100;

function generateArray(size){
    array = [];
    barsContainer.innerHTML = "";

    for(let i=0;i<size;i++){
        const value = Math.floor(Math.random()*400)+20;
        array.push(value);

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value}px`;
        barsContainer.appendChild(bar);
    }
}

function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

function disableControls(state){
    sizeSlider.disabled = state;
    generateBtn.disabled = state;
    startBtn.disabled = state;
    algorithmSelect.disabled = state;
}

async function bubbleSort(){
    const bars = document.getElementsByClassName("bar");

    for(let i=0;i<array.length;i++){
        for(let j=0;j<array.length-i-1;j++){

            bars[j].style.background="red";
            bars[j+1].style.background="red";

            await sleep(delay);

            if(array[j] > array[j+1]){
                [array[j],array[j+1]] = [array[j+1],array[j]];

                bars[j].style.height = `${array[j]}px`;
                bars[j+1].style.height = `${array[j+1]}px`;
            }

            bars[j].style.background="white";
            bars[j+1].style.background="white";
        }
        bars[array.length-i-1].style.background="lime";
    }
}

async function selectionSort(){
    const bars = document.getElementsByClassName("bar");

    for(let i=0;i<array.length;i++){
        let min = i;

        for(let j=i+1;j<array.length;j++){
            bars[j].style.background="red";
            await sleep(delay);

            if(array[j] < array[min]){
                min = j;
            }
            bars[j].style.background="white";
        }

        [array[i],array[min]] = [array[min],array[i]];
        bars[i].style.height = `${array[i]}px`;
        bars[min].style.height = `${array[min]}px`;
        bars[i].style.background="lime";
    }
}

async function insertionSort(){
    const bars = document.getElementsByClassName("bar");

    for(let i=1;i<array.length;i++){
        let key = array[i];
        let j = i-1;

        bars[i].style.background="red";
        await sleep(delay);

        while(j>=0 && array[j] > key){
            array[j+1] = array[j];
            bars[j+1].style.height = `${array[j+1]}px`;
            j--;
            await sleep(delay);
        }

        array[j+1] = key;
        bars[j+1].style.height = `${key}px`;
        bars[i].style.background="white";
    }

    for(let i=0;i<bars.length;i++){
        bars[i].style.background="lime";
    }
}

startBtn.addEventListener("click", async ()=>{
    disableControls(true);

    delay = 101 - speedSlider.value;

    const algo = algorithmSelect.value;

    if(algo === "bubble") await bubbleSort();
    if(algo === "selection") await selectionSort();
    if(algo === "insertion") await insertionSort();

    disableControls(false);
});

generateBtn.addEventListener("click",()=>{
    generateArray(sizeSlider.value);
});

sizeSlider.addEventListener("input",()=>{
    generateArray(sizeSlider.value);
});

generateArray(sizeSlider.value);
