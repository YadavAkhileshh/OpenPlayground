function digitalClock(){
    let datefunction = new Date()
    let hours = datefunction.getHours()
    let minutes = datefunction.getMinutes()
    let seconds = datefunction.getSeconds()
    let timeFormat = 'AM'
    
    timeFormat = hours >= 12 ? 'PM' : 'AM'
    hours = hours == 0 ? 12 : hours
    hours = hours > 12 ? hours - 12 : hours
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    document.querySelector('.hours').innerHTML = hours
    document.querySelector('.minutes').innerHTML = minutes
    document.querySelector('.seconds').innerHTML = seconds
    document.querySelector('.format').innerHTML = timeFormat
}
setInterval(digitalClock, 1000)

let newDateFunction = new Date()

function randerDate(){
    newDateFunction.setDate(1)
    let day = newDateFunction.getDay()

    let currentDate = new Date(
        newDateFunction.getFullYear(),
        newDateFunction.getMonth() + 1,0
    ).getDate() // to get the last date of current month


    let prevDate = new Date(
        newDateFunction.getFullYear(),
        newDateFunction.getMonth(), 0
    ).getDate() // to get the last date of previous month

    let addNextDate = new Date(
        newDateFunction.getFullYear(),
        newDateFunction.getMonth() + 1,0
    ).getDate()

    console.log(currentDate, prevDate, addNextDate);

    let addNext = addNextDate + 7

    let month = newDateFunction.getMonth()
    let year = newDateFunction.getFullYear()
    let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    document.getElementById("month").innerHTML = monthArr[month] + " - " + year

    let today = new Date()
    let weekDay = today.getDay()
    document.getElementById("date").innerHTML = today.toDateString()
    document.querySelector(`.week :nth-child(${weekDay + 1})`).classList.add("active")
 


    let DATES = ""

    for(let x = day; x > 0; x--){
        DATES += "<div class='prev'>" + (prevDate - x + 1) + "</div>"
    }

    for(let i = 1; i <= currentDate; i++){
        if(i === today.getDate() && newDateFunction.getMonth() == today.getMonth() && newDateFunction.getFullYear() === today.getFullYear()){
            DATES += "<div class='today'>" + i + "</div>"
        }
        else{
            DATES += "<div>" + i + "</div>"
        }
    }

    for(let k = 1; k <= addNext; k++){
        DATES += "<div class='next'>" + k + "</div>"
    }

    document.querySelector('.dates').innerHTML = DATES

    setCalendarBackgroundImage(month);
}

function moveDate(para){

    if(para == 'prev'){
        newDateFunction.setMonth(newDateFunction.getMonth() - 1)
    }
    
    else if(para == 'next'){
        newDateFunction.setMonth(newDateFunction.getMonth() + 1)
    }

    randerDate()
}


function setCalendarBackgroundImage(month) {
    let calendar = document.querySelector('.body');
    let backgroundImage = '';

    switch (month) {
        case 0: 
            backgroundImage = 'url("images/jan.jpg")';
            break;
        case 1: 
            backgroundImage = 'url("images/feb.jpg")';
            break;
        case 2:
            backgroundImage = 'url("images/mar.jpg")';
            break;
        case 3: 
            backgroundImage = 'url("images/apr.jpg")';
            break;
        case 4: 
            backgroundImage = 'url("images/may.jpg")';
            break;
        case 5: 
            backgroundImage = 'url("images/jun.jpg")';
            break;
        case 6:
            backgroundImage = 'url("images/jul.jpg")';
            break;
        case 7: 
            backgroundImage = 'url("images/aug.jpg")';
            break;
        case 8: 
            backgroundImage = 'url("images/sep.jpg")';
            break;
        case 9: 
            backgroundImage = 'url("images/oct.jpg")';
            break;
        case 10: 
            backgroundImage = 'url("images/nov.jpg")';
            break;
        case 11: 
            backgroundImage = 'url("images/dec.jpg")';
            break;
        default:
            backgroundImage = 'url("images/default.jpg")';
            break;
    }

    // apply the background image to the body
    document.body.style.backgroundImage = backgroundImage;
}