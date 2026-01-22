const bill = document.getElementById("bill")
const people = document.getElementById("people")
const calculateBtn = document.getElementById("calculateBtn")
const tipButtons = document.querySelectorAll('.tip-options button');
const tipAmount = document.getElementById("tipAmount")
const totalPerPerson = document.getElementById("totalPerPerson")
let selectedTip = 0;
let billAmt = 0
let nopeople = 0
tipButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedTip = Number(button.dataset.tip);
        billAmt = Number(bill.value.trim())
        nopeople = Number(people.value.trim())
        newbill(selectedTip, billAmt)

    });
});
let newbillAmt = 0
function newbill(selectedTip, billAmt){
    newbillAmt = billAmt + (billAmt*(selectedTip/100))
    tipAmount.innerText = billAmt*(selectedTip/100)
    totalAmount.innerText = newbillAmt

}

calculateBtn.addEventListener("click" , (e)=>{
    e.preventDefault();
    nopeople = Number(people.value.trim())
    if(nopeople!=0){
        totalPerPerson.innerText = newbillAmt/nopeople
        document.getElementById("resultBox").style.display = "block";

    }
    
})
