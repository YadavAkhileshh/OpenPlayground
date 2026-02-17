const masterPasswordInput = document.getElementById("masterPassword");
const unlockBtn = document.getElementById("unlockBtn");
const loginSection = document.getElementById("loginSection");
const vaultSection = document.getElementById("vaultSection");
const strengthBar = document.getElementById("strength");

const siteInput = document.getElementById("site");
const userInput = document.getElementById("username");
const passInput = document.getElementById("password");
const addBtn = document.getElementById("addBtn");
const credentialList = document.getElementById("credentialList");
const lockBtn = document.getElementById("lockBtn");

let masterKey = "";
let credentials = [];

function hash(text){
    let hash = 0;
    for(let i=0;i<text.length;i++){
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function encrypt(text,key){
    return btoa(text.split("")
        .map((char,i)=>String.fromCharCode(char.charCodeAt(0)^key.charCodeAt(i%key.length)))
        .join(""));
}

function decrypt(text,key){
    const decoded = atob(text);
    return decoded.split("")
        .map((char,i)=>String.fromCharCode(char.charCodeAt(0)^key.charCodeAt(i%key.length)))
        .join("");
}

function checkStrength(password){
    let score = 0;
    if(password.length > 6) score++;
    if(/[A-Z]/.test(password)) score++;
    if(/[0-9]/.test(password)) score++;
    if(/[^A-Za-z0-9]/.test(password)) score++;

    const percent = (score/4)*100;
    strengthBar.style.width = percent + "%";

    if(percent < 50) strengthBar.style.background="red";
    else if(percent < 75) strengthBar.style.background="orange";
    else strengthBar.style.background="lime";
}

masterPasswordInput.addEventListener("input",()=>{
    checkStrength(masterPasswordInput.value);
});

unlockBtn.addEventListener("click",()=>{
    if(!masterPasswordInput.value) return alert("Enter master password");

    masterKey = masterPasswordInput.value;
    credentials = JSON.parse(localStorage.getItem("vault")) || [];

    loginSection.classList.add("hidden");
    vaultSection.classList.remove("hidden");
    render();
});

addBtn.addEventListener("click",()=>{
    if(!siteInput.value || !userInput.value || !passInput.value) return;

    const encryptedPass = encrypt(passInput.value, masterKey);

    credentials.push({
        id:Date.now(),
        site:siteInput.value,
        username:userInput.value,
        password:encryptedPass
    });

    localStorage.setItem("vault",JSON.stringify(credentials));
    siteInput.value="";
    userInput.value="";
    passInput.value="";
    render();
});

function render(){
    credentialList.innerHTML="";

    credentials.forEach(cred=>{
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${cred.site} (${cred.username})</span>
            <div>
                <button class="copy-btn">Copy</button>
                <button class="copy-btn">Delete</button>
            </div>
        `;

        const buttons = li.querySelectorAll("button");

        buttons[0].onclick=()=>{
            const decrypted = decrypt(cred.password, masterKey);
            navigator.clipboard.writeText(decrypted);
            alert("Password copied!");
        };

        buttons[1].onclick=()=>{
            credentials = credentials.filter(c=>c.id!==cred.id);
            localStorage.setItem("vault",JSON.stringify(credentials));
            render();
        };

        credentialList.appendChild(li);
    });
}

lockBtn.addEventListener("click",()=>{
    masterKey="";
    loginSection.classList.remove("hidden");
    vaultSection.classList.add("hidden");
});
