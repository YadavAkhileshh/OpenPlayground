let generateOTP=()=>{
    const optlength=6;

    // generate random OTP number 
    const otp=Math.floor(100000+Math.random()*900000);
    // display OTP number
    document.getElementById("otpDisplay").innerText=`${otp}`;

};
document.getElementById("generateBtn").addEventListener("click",generateOTP);
// copy OTP
copyBtn.addEventListener("click", () => {
    const otp = otpDisplay.innerText;

    if (otp === "------") {
        alert("Generate OTP first");
        return;
    }

    navigator.clipboard.writeText(otp);
    alert("OTP copied to clipboard");
});
document.addEventListener("load",generateOTP);