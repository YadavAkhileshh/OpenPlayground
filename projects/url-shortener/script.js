const longUrlInput=document.getElementById("longUrl");
const shortenBtn=document.getElementById("shortenBtn");
const result=document.getElementById("result");
const shortUrlInput=document.getElementById("shortUrl");
const copyBtn=document.getElementById("copyBtn");
const urlList=document.getElementById("urlList");

function generateCode(len=6){
    const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res="";
    for(let i=0;i<len;i++){
        res+=chars[Math.floor(Math.random()*chars.length)];
    }
    return res;
}

function getData(){
    return JSON.parse(localStorage.getItem("shortUrls"))||{};
}

function saveData(data){
    localStorage.setItem("shortUrls",JSON.stringify(data));
}

function renderList(){
    const data=getData();
    urlList.innerHTML="";
    Object.keys(data).forEach(code=>{
        const li=document.createElement("li");
        li.innerHTML=`${code} → ${data[code].url} (Clicks: ${data[code].clicks})`;
        urlList.appendChild(li);
    });
}

shortenBtn.onclick=()=>{
    const longUrl=longUrlInput.value.trim();
    if(!longUrl)return;

    const data=getData();
    let code;
    do{
        code=generateCode();
    }while(data[code]);

    data[code]={url:longUrl,clicks:0};
    saveData(data);

    const shortLink=`${window.location.origin}${window.location.pathname}?id=${code}`;
    shortUrlInput.value=shortLink;
    result.classList.remove("hidden");
    renderList();
};

copyBtn.onclick=()=>{
    shortUrlInput.select();
    document.execCommand("copy");
};

function handleRedirect(){
    const params=new URLSearchParams(window.location.search);
    const id=params.get("id");
    if(!id)return;

    const data=getData();
    if(!data[id])return;

    data[id].clicks++;
    saveData(data);
    window.location.href=data[id].url;
}

handleRedirect();
renderList();
