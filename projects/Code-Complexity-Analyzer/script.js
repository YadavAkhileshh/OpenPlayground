const input=document.getElementById("codeInput");
const analyzeBtn=document.getElementById("analyzeBtn");
const complexityOutput=document.getElementById("complexityOutput");
const funcCountEl=document.getElementById("funcCount");
const loopCountEl=document.getElementById("loopCount");
const nestDepthEl=document.getElementById("nestDepth");
const recursionEl=document.getElementById("recursion");
const meterFill=document.getElementById("meterFill");
const themeToggle=document.getElementById("themeToggle");

themeToggle.onclick=()=>document.body.classList.toggle("dark");

function countMatches(text,regex) {
  return (text.match(regex)||[]).length;
}

function maxNestingDepth(code) {
  let depth=0;
  let max=0;
  for(let char of code) {
    if(char==="{") {
      depth++;
      if(depth>max) max=depth;
    }
    if(char==="}") depth--;
  }
  return max;
}

function detectRecursion(code) {
  const funcs=code.match(/function\s+(\w+)/g)||[];
  for(let f of funcs) {
    const name=f.split(" ")[1];
    const body=new RegExp(name+"\\s*\\(","g");
    if(countMatches(code,body)>1) return true;
  }
  return false;
}

function estimateComplexity(loops,depth,recursion) {
  if(recursion&&depth>1) return "O(2ⁿ)";
  if(depth>=3) return "O(n³)";
  if(depth===2) return "O(n²)";
  if(loops>0) return "O(n)";
  return "O(1)";
}

function meterValue(bigO) {
  switch(bigO) {
    case "O(1)": return 15;
    case "O(n)": return 40;
    case "O(n²)": return 65;
    case "O(n³)": return 85;
    case "O(2ⁿ)": return 100;
    default: return 0;
  }
}

analyzeBtn.onclick=()=>{
  const code=input.value;

  const functions=countMatches(code,/function\s+\w+/g);
  const loops=countMatches(code,/for\s*\(|while\s*\(|do\s*\{/g);
  const depth=maxNestingDepth(code);
  const recursion=detectRecursion(code);

  const complexity=estimateComplexity(loops,depth,recursion);

  funcCountEl.textContent=functions;
  loopCountEl.textContent=loops;
  nestDepthEl.textContent=depth;
  recursionEl.textContent=recursion?"Yes":"No";
  complexityOutput.textContent=complexity;

  meterFill.style.width=meterValue(complexity)+"%";
};
