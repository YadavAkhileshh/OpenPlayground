const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
var dvdLogo;
var loaded = false;
var dvdQuantity = 1;
var overallBorderHit = 0;
var overallCornerHit = 0;
var CornerHitTolerance = 2;

class EpicDvdLogo {
    constructor(x, y, dx, dy, size, speed) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.speed = speed;
    }

    run() {
        this.draw();
        this.update();
    }

    draw() {
        document.getElementById("status").innerHTML = "Drawing..";
        if (!dvdLogo) {
            loadDvdPng();
        }
        ctx.beginPath();
        ctx.drawImage(dvdLogo, this.x, this.y, dvdLogo.width * this.size, dvdLogo.height * this.size);
    }

    update() {
        document.getElementById("status").innerHTML = "Moving..";
        if (this.x +  dvdLogo.width * this.size > window.innerWidth -CornerHitTolerance && this.y + dvdLogo.height * this.size > window.innerHeight -CornerHitTolerance){
            overallCornerHit++;
            document.getElementById("cornerHit").innerHTML = overallCornerHit;
        }
        if (this.x < CornerHitTolerance && this.y < CornerHitTolerance){
            overallCornerHit++;
            document.getElementById("cornerHit").innerHTML = overallCornerHit;
        }
        if (this.x +  dvdLogo.width * this.size > window.innerWidth || this.x < 0) {
            this.dx = -this.dx;
            overallBorderHit++;
            //audio.play();
        }
        if (this.y +dvdLogo.height * this.size > window.innerHeight || this.y < 0) {
            this.dy = -this.dy;
            overallBorderHit++;
            //audio.play();
        }

        document.getElementById("hit").innerHTML = overallBorderHit;
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed; 
        //console.log("dvd X = " + this.x + ", dvd Y = " + this.y);
    }
}

function loadDvdPng() {
    //Load dvdLogo svg
    document.getElementById("status").innerHTML = "Loading..";
    dvdLogo = new Image();
    dvdLogo.src = "https://i.ibb.co/b6bzpd7/dvdLogo-logo.png";
    dvdLogo.onload = function () {
        game_running = true;
        animate();
        loaded = true;
        document.getElementById("loaded").innerHTML = loaded;
    }
};



// test 
//generateDvdArray(150);



/*
function computeDvdSizeRatio(size){

    var okikoki = size 

    var ratioX = dvdLogo.width
    var ratioY = dvdLogo.height
}
*/

function resizeEventHandler() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById("status").innerHTML = "Resizing..";
}

$(document).ready(resizeEventHandler);

$(window).resize(resizeEventHandler);


var dvdArray = [];
//var audio = new Audio('https://jukehost.co.uk/api/audio/p/b638bcdddb5972279b215014171a65a34bf42cea/65b2b457b7a');

// function generateDvdArray(numOfDvd){
//     for (var i = 0; i < numOfDvd; i++) {
//         var x = Math.random() * (window.innerWidth - 500) + 200;
//         var y = Math.random() * (window.innerHeight - 300) + 150;
//         var dx = 3;
//         var dy = 1.5;
//         var size = 0.4;
//         dvdArray.push(new EpicDvdLogo(x, y, dx, dy, size, speedRatio))
//     }
// }

var speedRatio = 1;
var logoSize = 0.4;
function generateDvdLogo() {
    var x = Math.random() * (window.innerWidth - 1000 * logoSize) + 400 * logoSize;
    var y = Math.random() * (window.innerHeight - 600 * logoSize) + 300 * logoSize;
    var dx = 2.5;
    var dy = 1.5;
    var size = logoSize;
    var speed = speedRatio;
    dvdArray.push(new EpicDvdLogo(x, y, dx, dy, size, speed))
}
generateDvdLogo();


window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(function () {

                callback(+performance.now());
            }, 1000 / 150); //max fps but capped to screen refreshRate
        };
})();

var currentFrame = 0;
var lastRun;//performance.now();
var game_running = false;

function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);



    if (!lastRun) {
        lastRun = performance.now();
        requestAnimFrame(animate);
        return;
    }
    var delta = (performance.now() - lastRun) / 1000;
    lastRun = performance.now();
    var FPS = Math.round(1 / delta);
    if (game_running) {
        requestAnimFrame(animate);
    } else {
        var FPS = "PAUSED";
    }
    currentFrame++;
    document.getElementById("fps").innerHTML = FPS;

    for (var i = 0; i < dvdArray.length; i++) {
        dvdArray[i].run();
    }
}
animate();





document.getElementById('velocity')
    .addEventListener('change', updateVelocity, false);

document.getElementById('logoSize')
    .addEventListener('change', updateSize, false);


function updateVelocity(){
    document.getElementById("status").innerHTML = "Velocity change..";
    var value = document.getElementById('velocity').value;
    
    var range = (100 - 1);
    var newRange = (10 - 0.1);
    var newValue = (((value - 1) * newRange) / range) + 0.1;
    console.log(newValue);
    speedRatio = newValue;
}

function updateSize(){
    document.getElementById("status").innerHTML = "Size change..";
    var value = document.getElementById('logoSize').value;

    var range = (100 - 1);
    var newRange = (3 - 0.01);
    var newValue = (((value - 1) * newRange) / range) + 0.01;
    console.log(newValue);
    logoSize = newValue;

}

function addDvdLogo(){
    document.getElementById("status").innerHTML = "Add DVD pressed! That s epic";
    dvdQuantity++;
    generateDvdLogo();
    document.getElementById("dvdInstances").innerHTML = dvdQuantity;
  document.getElementById('video-background').style.visibility = "hidden";
}

$('input[name=collide]').change(function(){
    if($(this).is(':checked')) {
        document.getElementById("status").innerHTML = "Collision enabled..";
    } else {
        document.getElementById("status").innerHTML = "Collision disabled..";
    }
});

document.getElementById('bgControl').addEventListener('click', () => {
  console.log(document.getElementsByClassName('video-background')[0].style.visibility)
  const visible = document.getElementsByClassName('video-background')[0].style.visibility
  visible = visible === 'hidden' ? 'visible' : 'hidden'
})