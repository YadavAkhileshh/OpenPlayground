gsap.set("#gsapWrapper", { autoAlpha: 1 });


let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);

const
body = select('body'),
world3d = select('#world3d'),
world3dCover = select('#world3dCover'),
gsapWrapper = select('#gsapWrapper'),  
dataInfo = select('#dataInfo'),
directions = select('#directions'),
touchSwitch = select('#touchSwitch'),
playAgain = select('#playAgain'),
mines = selectAll(".mine"),
minesMaxNo = 6;

const zeroPad = (num, places) => String(num).padStart(places, '0');

var numberOfClicks = 0,
liveMinesCounter = 0,
minesDetected = 0,
endGame = false,
displayTime = false,
startTime = Math.floor( Date.now() / 1000 ),
tl = gsap.timeline({ repeat: -1, repeatDelay: 0, onUpdate:()=>{

    if( displayTime )
    {
        let currentTime = Math.floor( Date.now() / 1000 );
        let diff = currentTime - startTime;
        let min = Math.floor(diff / 60);
        let sec = diff % 60;
        select("#dataTime").innerHTML = "Time: " + min + ":" + zeroPad(sec,2);
    }

}, defaults:{ duration: 1 }});


init();
playAgain.addEventListener("click", (event) => {

    gsap.set( world3dCover, { transform: "translateZ(15px)", transformOrigin: "0% 0%" });

    focusOut();
 
    numberOfClicks = 0;
    liveMinesCounter = 0;
    minesDetected = 0;
    endGame = false;

    body.classList.remove("detect");
    select("#dataTime").innerHTML = "Time: 0:00";
    
    mines.forEach( ( mine ) => {
        mine.classList.remove("clicked");
        mine.classList.remove("detected");
        mine.classList.remove("live");
        gsap.set( mine, { attr: { "data-proximity": "" } });
        gsap.set( mine, { transform: "translateZ(0px)", transformOrigin: "0% 0%" });
    });
    displayData();
    init();

});

function init() {
    
    /* setup startup requirements */
    body.classList.remove("popupOpen");
    select("#boom").classList.remove('display');
    select("#cleared").classList.remove('display');

    /* add live mines */
    mines.forEach( ( mine, i ) => {

        if( i === mines.length - 1)
        {
            liveMinesCounter = 0;   
            while( minesMaxNo > liveMinesCounter )
            {
                let thisMine =  mines[gsap.utils.random( 0,35,1 )];
                let targetId = "#"+thisMine.getAttribute("id");
                if( !select(targetId).classList.contains('live') )
                {
                    select(targetId).classList.add('live');
                    liveMinesCounter++;
                }
            }

        }
    
    });

    /* glow animation */
    animateMines();

}


touchSwitch.addEventListener("click", (event) => {
	if( numberOfClicks > 0 )
	{
		body.classList.toggle("detect");
		document.activeElement.blur();
	}
});


/* add eventListeners to each mine */
mines.forEach( ( mine ) => {

	mine.addEventListener("click", (event) => {

			if( body.classList.contains("detect") )
			{
				event.preventDefault();
				detectMine( mine );
				return false;
			}
			else
				clickMine( mine );

	});
	
	if( !window.matchMedia("(pointer: coarse)").matches )
	{
			mine.addEventListener("mouseover", (event) => { glowMine( mine ); });
			mine.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				detectMine( mine );
				return false;
			});
	}

});


/* receding glow trail animation */
function animateMines() {

    focusOut();

    const mineColors = [ "#14bdcc", "#f29224", "#FF0000", "#9cfc1e", "#ffe878", "#FFFFFF" ];
	const triggerMap = [ "#p00", "#p01", "#p02", "#p03", "#p04", "#p05", "#p15", "#p25", "#p35", "#p45", "#p55", "#p54", "#p53", "#p52", "#p51", "#p50", "#p40", "#p30", "#p20", "#p10", "#p11", "#p12", "#p13", "#p14", "#p24", "#p34", "#p44", "#p43", "#p42", "#p41", "#p31", "#p21", "#p22", "#p23", "#p33", "#p32" ]; 
    const triggerMapA = [ "#p00", "#p01", "#p02", "#p03", "#p04", "#p05", "#p15", "#p25", "#p35", "#p45", "#p44", "#p43", "#p42", "#p41",  "#p31", "#p21", "#p22", "#p23" ];   
    const triggerMapB = [ "#p55", "#p54", "#p53", "#p52", "#p51", "#p50", "#p40", "#p30", "#p20", "#p10", "#p11", "#p12", "#p13", "#p14", "#p24", "#p34" , "#p33", "#p32" ]; 
    const triggerMapC = [ "#p00", "#p01", "#p02", "#p03", "#p04", "#p05", "#p15", "#p14", "#p13", "#p12", "#p11", "#p10", "#p20", "#p21", "#p22", "#p23", "#p24", "#p25", "#p35", "#p34", "#p33", "#p32", "#p31", "#p30", "#p40", "#p41", "#p42", "#p43", "#p44", "#p45", "#p55", "#p54", "#p53", "#p52", "#p51", "#p50" ];
    const triggerMapD = [ "#p00", "#p01", "#p10", "#p20", "#p11", "#p02", "#p03", "#p12", "#p21", "#p30", "#p40", "#p31", "#p22", "#p13", "#p04", "#p05", "#p50", "#p51", "#p41", "#p32", "#p23", "#p14", "#p42", "#p33", "#p24", "#p15", "#p25", "#p34", "#p43", "#p52", "#p53", "#p44", "#p35", "#p45", "#p54", "#p55" ];


    gsap.set( world3dCover, { transform: "translateZ(15px)", transformOrigin: "0% 0%" });

    let n = getRandomIntInclusive(1,4);
    let cIndex1 = getRandomIntInclusive(0,3);
    let cIndex2 = getRandomIntInclusive(0,3);
    let cIndex3 = getRandomIntInclusive(0,3);

    switch( n )
     {

        case 1:
        triggerMap.forEach( ( mine, i ) => { 
            setTimeout(function() {
                glowMine( select(mine),mineColors[cIndex1] );
                if( i === mines.length - 1)
                    gsap.timeline()
                    .delay(0.5)
                    .set( world3dCover, { duration: 0.85, transform: "translateZ(0px)", transformOrigin: "0% 0%" });
            }, 50 * i);
        });
        break;

        case 2:
        triggerMapA.forEach( ( mine, i ) => {
        let mine2 = triggerMapB[i];
            setTimeout(function() {
                glowMine( select(mine),mineColors[cIndex2] );
                glowMine( select(mine2),mineColors[cIndex3] );
                if( i === triggerMapA.length - 1)
                    gsap.timeline()
                    .delay(0.25)
                    .set( world3dCover, { duration: 0.85, transform: "translateZ(0px)", transformOrigin: "0% 0%" });
            }, 100 * i);
        });
        break;
        
        case 3:
        triggerMapC.forEach( ( mine, i ) => { 
            setTimeout(function() {
                glowMine( select(mine),mineColors[cIndex1] );
                if( i === mines.length - 1)
                    gsap.timeline()
                    .delay(0.5)
                    .set( world3dCover, { duration: 0.85, transform: "translateZ(0px)", transformOrigin: "0% 0%" });
            }, 50 * i);
        });
        break;
        
        case 4:
        triggerMapD.forEach( ( mine, i ) => { 
            setTimeout(function() {
                glowMine( select(mine),mineColors[cIndex1] );
                if( i === mines.length - 1)
                    gsap.timeline()
                    .delay(0.5)
                    .set( world3dCover, { duration: 0.85, transform: "translateZ(0px)", transformOrigin: "0% 0%" });
            }, 50 * i);
        });
        break;

    }

    focusOut();

}

function detectMine( mine ) {

    if( numberOfClicks > 0 )
    {
        mine.classList.toggle("detected");
        focusOut();
        numberOfClicks++;
        displayData();
    }

}


function clickMine( mine ) {

    let proximityCounter, rowStart, rowEnd, colStart, colEnd;

    mine.classList.add("clicked");
    numberOfClicks++;
    if( numberOfClicks == 1 )
    {
        
        startTime = Math.floor( Date.now() / 1000 );
        displayTime = true;

        /* first click swap live mine with inactive one */
        if( mine.classList.contains('live') )
        {
            liveMinesCounter = liveMinesCounter - 1;   
            while( minesMaxNo > liveMinesCounter )
            {
                let thisMine =  mines[gsap.utils.random( 0,35,1 )];
                let targetId = "#"+thisMine.getAttribute("id");
                if( !select(targetId).classList.contains('live') )
                {
                    select(targetId).classList.add('live');
                    liveMinesCounter++;
                }
            }
            mine.classList.remove('live');
        }

        /* go through all mines and calculate their adjacent active mines */
        mines.forEach( ( mine ) => {

            gsap.set( mine, { attr: { "data-proximity": "" }} );
            if( !mine.classList.contains('live') )
            {

                let thisId = mine.id;
                let thisRow = parseInt(thisId[1]);
                let thisCol = parseInt(thisId[2]);

                proximityCounter = 0;
                rowStart = thisRow - 1;
                rowStart = gsap.utils.clamp(0,5,rowStart);
                rowEnd = thisRow + 1;
                rowEnd = gsap.utils.clamp(0,5,rowEnd);

                for( let r = rowStart; r <= rowEnd; r++ )
                {

                    colStart = thisCol - 1;
                    colStart = gsap.utils.clamp(0,5,colStart);
                    colEnd = thisCol + 1;
                    colEnd = gsap.utils.clamp(0,5,colEnd);

                    for( let c = colStart; c <= colEnd; c++ )
                    {
                        if( ( r != thisRow ) || ( c != thisCol ) )
                        {
                            if( select("#p"+r+c).classList.contains('live') )
                                proximityCounter++;
                        }
                    }

                }

                if( proximityCounter > 0 )
                    gsap.set( mine, { attr: { "data-proximity": proximityCounter }} );

            }

        });
                
        proximityClear( mine );

    }
    else
    {

        /* live mine clicked - end game and disable user entry */
        if( mine.classList.contains('live') )
        {
            displayTime = false;
            endGame = true;
            gsap.set( world3dCover, { transform: "translateZ(15px)", transformOrigin: "0% 0%" });
            body.classList.add("popupOpen");
            select("#boom").classList.add('display');
            select("#cleared").classList.remove('display');
        }
        else
            proximityClear( mine );
                
    }

    displayData();

}


function glowMine( mine, newColor="#14bdcc" ) {

    let surface = mine.querySelector(".surface");
    //let oldColor = gsap.getProperty(surface,"color");
    let oldColor = "#14bdcc";
    gsap.timeline({ onComplete: ()=> { gsap.set( surface, { color: oldColor }) }, defaults:{duration: 0.5} })
    .set( surface, { color: newColor } )
    .to( mine, { transform: "translateZ(10px)", transformOrigin: "0% 0%" })
    .fromTo( surface, { filter: "brightness(1.5)", boxShadow: "0px 0px 8px 6px" }, { filter: "brightness(1)", boxShadow: "0px 0px 0px 0px" }, "<");

}


/* update data display information and end game on completion */
function displayData() {

    let displayDetected = 0;
    let displayClicked = 0;

    mines.forEach( ( mine ) => {
			
			if( mine.classList.contains("clicked") )
            displayClicked++;
			else if( mine.classList.contains("detected") )
            displayDetected++;
			
        
    })

    if( displayClicked == 30 )
    {

        if( displayDetected != 6 )
        {
            mines.forEach( ( mine ) => {
                if( mine.classList.contains("live") )
                    mine.classList.add("detected");
            })
            displayDetected = 6;
        }

        displayTime = false;
        if( !endGame )
        {
            gsap.set( world3dCover, { transform: "translateZ(15px)", transformOrigin: "0% 0%" });
            body.classList.add("popupOpen");
            select("#boom").classList.remove('display');
            select("#cleared").classList.add('display');
        }
    }

    select("#dataDetected").innerHTML = "Detected: " + displayDetected + "/"+ minesMaxNo;
    select("#dataClicks").innerHTML = "Clicks: " + numberOfClicks;
	
    focusOut();

}

function focusOut() {
    
    document.getElementById("focusInput").readOnly = false;
    document.getElementById("focusInput").focus();
    document.getElementById("focusInput").readOnly = true;
    document.getElementById("focusInput").blur();
    document.getElementById("focusInput").readOnly = false;

}



function proximityClear( mine ) {

    let thisId = mine.id;
    let thisRow = parseInt(thisId[1]);
    let thisCol = parseInt(thisId[2]);

    let rowStart = thisRow - 1;
    rowStart = gsap.utils.clamp(0,5,rowStart);
    let rowEnd = thisRow + 1;
    rowEnd = gsap.utils.clamp(0,5,rowEnd);

    for( let r = rowStart; r <= rowEnd; r++ )
    {

        let colStart = thisCol - 1;
        colStart = gsap.utils.clamp(0,5,colStart);
        let colEnd = thisCol + 1;
        colEnd = gsap.utils.clamp(0,5,colEnd);

        for( let c = colStart; c <= colEnd; c++ )
        {
            if( ( r == thisRow ) || ( c == thisCol ) )
            {
                let target = select("#p"+r+c);
                if( !target.classList.contains('clicked') && !target.classList.contains('live') )
                {
                    let proximityCounter = target.getAttribute('data-proximity');
                    if( !proximityCounter )
                        target.classList.add('clicked');
                }
            }
        }

    }

    blankProximityClear(4);

}


function blankProximityClear( iteration ) {

    let clickCounter = 0;

    mines.forEach( ( mine ) => {

        if( mine.classList.contains('clicked') && ( mine.getAttribute('data-proximity') == "" ) )
        {

            let thisId = mine.id;
            let thisRow = parseInt(thisId[1]);
            let thisCol = parseInt(thisId[2]);

            let rowStart = thisRow - 1;
            rowStart = gsap.utils.clamp(0,5,rowStart);
            let rowEnd = thisRow + 1;
            rowEnd = gsap.utils.clamp(0,5,rowEnd);

            for( let r = rowStart; r <= rowEnd; r++ )
            {

                let colStart = thisCol - 1;
                colStart = gsap.utils.clamp(0,5,colStart);
                let colEnd = thisCol + 1;
                colEnd = gsap.utils.clamp(0,5,colEnd);

                for( let c = colStart; c <= colEnd; c++ )
                {
                    let target = select("#p"+r+c);
                    if( !target.classList.contains('clicked') )
                    {
                        target.classList.add('clicked');
                        clickCounter++;
                    }
                }

            }

        }

    });

    if( ( clickCounter > 0 ) && ( iteration > 0 ) )
        blankProximityClear( iteration-- );

}


gsapWrapper.addEventListener( 'mousemove', onMouseMove );
function onMouseMove ( e ) {
	
	// change rotation on mouse move
	const
	minPointX = gsapWrapper.offsetWidth / 2,
	sidesZ = ( minPointX - e.clientX ) / gsapWrapper.offsetWidth,
	world3dZAngle = parseInt( 20 * sidesZ ) - 10;

	gsap.to( world3d, 4, { transform: "rotateX(55deg) rotateY(0deg) rotateZ("+world3dZAngle+"deg)", transformOrigin: "50% 50%" } );

}


function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}