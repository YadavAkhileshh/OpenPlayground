
        const widthEL=document.getElementById("width");
        const heightEL=document.getElementById("height");
         const copyBtn = document.getElementById("copyBtn");
        const copyMsg = document.getElementById("copyMsg");

        function updateSize(){
            widthEL.textContent=window.innerWidth;
            heightEL.textContent=window.innerHeight;
        }
        updateSize();
        window.addEventListener("resize",updateSize);
        copyBtn.addEventListener("click",()=>{
            const sizeText=`${window.innerWidth} x ${window.innerHeight}`;
            navigator.clipboard.writeText(sizeText).then(()=>{
                copyMsg.textContent="copied to clipboard!";
                setTimeout(() => {
                    copyMsg.textContent="";
                }, 2000);
            })
        })
    