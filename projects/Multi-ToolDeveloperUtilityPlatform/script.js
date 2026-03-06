const workspace = document.getElementById("workspace")

function openTool(tool){

if(tool==="json"){

workspace.innerHTML=`
<h2>JSON Formatter</h2>

<textarea id="jsonInput" placeholder="Paste JSON here"></textarea>

<br><br>

<button onclick="formatJSON()">Format JSON</button>

<pre id="jsonOutput"></pre>
`

}

if(tool==="base64"){

workspace.innerHTML=`
<h2>Base64 Encoder / Decoder</h2>

<textarea id="baseInput"></textarea>

<br><br>

<button onclick="encode()">Encode</button>
<button onclick="decode()">Decode</button>

<pre id="baseOutput"></pre>
`

}

if(tool==="textcase"){

workspace.innerHTML=`
<h2>Text Case Converter</h2>

<textarea id="textInput"></textarea>

<br><br>

<button onclick="upper()">UPPERCASE</button>
<button onclick="lower()">lowercase</button>

<pre id="textOutput"></pre>
`

}

}

function formatJSON(){

const input=document.getElementById("jsonInput").value

try{

const formatted=JSON.stringify(JSON.parse(input),null,2)

document.getElementById("jsonOutput").innerText=formatted

}catch{

alert("Invalid JSON")

}

}

function encode(){

const text=document.getElementById("baseInput").value

document.getElementById("baseOutput").innerText=btoa(text)

}

function decode(){

const text=document.getElementById("baseInput").value

document.getElementById("baseOutput").innerText=atob(text)

}

function upper(){

const text=document.getElementById("textInput").value

document.getElementById("textOutput").innerText=text.toUpperCase()

}

function lower(){

const text=document.getElementById("textInput").value

document.getElementById("textOutput").innerText=text.toLowerCase()

}