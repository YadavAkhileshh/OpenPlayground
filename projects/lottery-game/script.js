const sumElm = document.getElementById('sum')
const button = document.querySelector('button')
const ticketNo = document.getElementById('ticket-no')
const winElm = document.getElementById('win')
const loseElm = document.getElementById('lose')
const ruleElm = document.getElementById('rule')

const getSum = (num) => {
    let sum = 0
    while (num > 0) {
        let lastDig = num % 10
        sum += lastDig
        num = Math.floor(num / 10)
    }
    return sum
}

button.addEventListener('click', () => {
    ruleElm.style.display = 'none'

    const ticket = Math.floor(Math.random() * 900) + 100
    const total = getSum(ticket)

    ticketNo.textContent = ticket
    sumElm.textContent = `sum : ${total}`

    if (total == 15) {
        winElm.style.display = 'block'
        loseElm.style.display = 'none'
    } else {
        winElm.style.display = 'none'
        loseElm.style.display = 'block'
    }
})
