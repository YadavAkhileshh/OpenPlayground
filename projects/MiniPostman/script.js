const sendBtn = document.getElementById("sendBtn");
const output = document.getElementById("responseOutput");
const meta = document.getElementById("meta");

sendBtn.addEventListener("click", async () => {

  const method = document.getElementById("method").value;
  const url = document.getElementById("url").value.trim();

  if(!url) return;

  let headers = {};
  let body = null;

  try{
    headers = JSON.parse(
      document.getElementById("headers").value || "{}"
    );
  }catch{
    alert("Invalid headers JSON");
    return;
  }

  try{
    const rawBody =
      document.getElementById("body").value.trim();

    if(rawBody) body = JSON.stringify(JSON.parse(rawBody));
  }catch{
    alert("Invalid body JSON");
    return;
  }

  const start = performance.now();

  try{
    const res = await fetch(url,{
      method,
      headers,
      body: method==="GET" ? null : body
    });

    const end = performance.now();

    const text = await res.text();

    let formatted;
    try{
      formatted = JSON.stringify(JSON.parse(text),null,2);
    }catch{
      formatted = text;
    }

    meta.textContent =
      `Status: ${res.status} | Time: ${(end-start).toFixed(2)} ms`;

    output.textContent = formatted;

  }catch(err){
    meta.textContent = "Request Failed";
    output.textContent = err.toString();
  }

});