const methodSelect = document.getElementById("method");
const urlInput = document.getElementById("url");
const bodyInput = document.getElementById("bodyInput");
const sendBtn = document.getElementById("sendBtn");

const statusEl = document.getElementById("status");
const timeEl = document.getElementById("time");
const responseOutput = document.getElementById("responseOutput");
const copyBtn = document.getElementById("copyBtn");

sendBtn.addEventListener("click", async () => {

    const url = urlInput.value.trim();
    const method = methodSelect.value;

    if(!url){
        alert("Please enter a valid URL");
        return;
    }

    let options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if(method === "POST" || method === "PUT"){
        try{
            options.body = bodyInput.value ? JSON.stringify(JSON.parse(bodyInput.value)) : null;
        }catch(e){
            alert("Invalid JSON body");
            return;
        }
    }

    responseOutput.textContent = "Loading...";
    statusEl.textContent = "-";
    timeEl.textContent = "-";

    const startTime = performance.now();

    try{
        const response = await fetch(url, options);
        const endTime = performance.now();

        const timeTaken = Math.floor(endTime - startTime);
        timeEl.textContent = timeTaken;

        statusEl.textContent = response.status;

        const data = await response.json();
        responseOutput.textContent = JSON.stringify(data, null, 2);

        if(response.status >= 200 && response.status < 300){
            statusEl.style.color = "#2ecc71";
        }else{
            statusEl.style.color = "#e74c3c";
        }

    }catch(error){
        responseOutput.textContent = "Error: " + error.message;
        statusEl.textContent = "Failed";
        statusEl.style.color = "#e74c3c";
    }

});

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(responseOutput.textContent);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
        copyBtn.textContent = "Copy Response";
    }, 1500);
});
