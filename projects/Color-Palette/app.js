import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/+esm";
import tinycolor2 from "https://esm.sh/tinycolor2";

let select = (e) => document.querySelector(e);
let selectAll = (e) => document.querySelectorAll(e);

const axis = select("#axis"),
axis2 = select("#axis2"),
axisSVG = select("#axisSVG"),
titleBorderWrapper = select("#titleBorderWrapper"),
titleBorder = select("#titleBorder"),
customSelect = select("#customSelect"),
customSelectOptions = selectAll("#customSelect > option"),
options = selectAll("option");

const dataCard = select("#dataCard");

var optionValue = customSelect.value;
var optionValueText = optionValue.replace(/([A-Z])/g, ' $1').trim();


let appearanceBaseSelectEnabled = false;
if ( window.getComputedStyle(customSelect).getPropertyValue("appearance") == "base-select" )
    appearanceBaseSelectEnabled = true;




/* select change eventListener */
customSelect.addEventListener("change", function() {

    if( customSelect.value && ( optionValue != customSelect.value ) )
    {

        optionValue = customSelect.value;
        optionValueText = optionValue.replace(/([A-Z])/g, ' $1').trim();

        let dataCardText = selectAll(".dataCardText");
        dataCardText[0].innerHTML = optionValueText;
        dataCardText[1].innerHTML = optionValueText;
        gsap.set("body", { "--selectColor": optionValue });
        gsap.set("body", { "--selectColorText": optionValueText });
        
    		animateTitle();
        setupSwatches();

    }

});


document.body.onload = () => {

    gsap.set("body", { "--selectColor": optionValue });
    gsap.set("body", { "--selectColorText": optionValueText });
    let dataCardText = selectAll(".dataCardText");
    dataCardText[0].innerHTML = optionValueText;
    dataCardText[1].innerHTML = optionValueText;

    animateTitle();
    setupSwatches();

	/* update each select option */	
    options.forEach((option,i) => {

        let optionValue = option.getAttribute("value");

        if( optionValue )
        {

            let optionValueText = optionValue.replace(/([A-Z])/g, ' $1').trim();

            if( !appearanceBaseSelectEnabled )
            {
                option.innerHTML = optionValueText;
                let chromaColor = chroma(optionValue).hex();
                option.setAttribute("style", "background-color: "+optionValue+"!important;");                
                gsap.set( ['#fc1','#fc2'], { fill:"#FFFFFF" } );
            }
            else
            {
                option.setAttribute("title", optionValueText);
            }

        }

    });

    axis.appendChild(axisSVG);
    if( appearanceBaseSelectEnabled )
    {
        let newSVG = axisSVG.cloneNode(true);
        newSVG.id = "axisSVG2";
        axis2.appendChild(newSVG);
    }
    titleBorderWrapper.appendChild(titleBorder);

    gsap.set("#gsapWrapper", { autoAlpha: 1 });

}


function animateTitle() {

    const tl = gsap.timeline()
    .set(["#masterTextPath"], { attr: { fill: "#FFFFFF" } })
    .set(["#masterTextPath2"], { attr: { "stroke-opacity": 0 } })
    .set(["#masterTextPath","#masterTextPath2"], { textContent: optionValueText.toUpperCase() })
    .from(["#masterTextPath","#masterTextPath2"], 2.5, { attr: { startOffset: "60%" }, ease: "power1" })
    .to("#masterTextPath", 1.5, { attr: { fill: "#000000" }, ease: "power1" },"<")
    .to("#masterTextPath2", 1.5, { attr: { "stroke-opacity": 1 }, ease: "power1" },"<");

}



/* from the picked color, generate palette colors and display */
/* CSS contrast color --selectContrastColor                   */
/* saturated or desaturate color using chroma.js              */
/* complementy color using tinycolor                          */
/* average of all three colors using chroma.js                */

function setupSwatches() {
    
    var cS0 = namedToHex(customSelect.value);
    var cS1 = colorToHex( dataCard, "color" );

    gsap.set("#cS0", { "--color": cS0 });
    gsap.set("#cS1", { "--color": cS1 });
    gsap.set("body", {"--bd1": cS1 });

    var cS2 = chroma(customSelect.value).saturate(5);
    var difference = chroma.deltaE(cS0,cS2);
    console.log(difference);
    if( difference < 10 )
        cS2 = chroma(customSelect.value).desaturate(5);
    gsap.set("#cS2", { "--color": cS2 });
    gsap.set("body", {"--bd2": cS2 });

    if( cS0 != "#000000" )
    {
        var cS3 = tinycolor2(cS0).complement().toHexString();
        gsap.set("#cS3", { "--color": cS3 });
    }
    else
    {
        var cS3 = "#FFFFFF";
        gsap.set("#cS3", { "--color": "#FFFFFF" });
    }
    gsap.set("body", {"--bd3": cS3 });

    var cS4 = chroma.average([cS1, cS2, cS3]); 
    gsap.set("body", {"--bd4": cS4 });

  
		/*  update display details */	
    select("#cS0").innerHTML = "<span class='code'>"+cS0+"</span>";
    select("#cS0").innerHTML += "<span>"+chroma(cS0).css('hsl').replace("deg","")+"</span>";
    select("#cS0").innerHTML += "<span>"+chroma(cS0).css('rgb')+"</span>";
    
    select("#cS1").innerHTML = "<span class='code'>"+cS1+"</span>";
    select("#cS1").innerHTML += "<span>"+chroma(cS1).css('hsl').replace("deg","")+"</span>";
    select("#cS1").innerHTML += "<span>"+chroma(cS1).css('rgb')+"</span>";

    select("#cS2").innerHTML = "<span class='code'>"+cS2+"</span>";
    select("#cS2").innerHTML += "<span>"+chroma(cS2).css('hsl').replace("deg","")+"</span>";
    select("#cS2").innerHTML += "<span>"+chroma(cS2).css('rgb')+"</span>";

    select("#cS3").innerHTML = "<span class='code'>"+cS3+"</span>";
    select("#cS3").innerHTML += "<span>"+chroma(cS3).css('hsl').replace("deg","")+"</span>";
    select("#cS3").innerHTML += "<span>"+chroma(cS3).css('rgb')+"</span>";

}


/* convert CSS color-mix color to hex */
function colorToHex(el,selector) {

    let style = gsap.getProperty(el, selector);
    let offscreen = new OffscreenCanvas(1, 1).getContext("2d");
    offscreen.fillStyle = style;
    offscreen.fillRect(0, 0, 1, 1);
    const pixel = offscreen.getImageData(0, 0, 1, 1).data;
    return `#${intToHex(pixel[0])}${intToHex(pixel[1])}${intToHex(pixel[2])}`;

    function intToHex(i) {
        return Math.floor(i).toString(16).padStart(2, "0");
    }
  
}

/* convert named color to Hex */
function namedToHex(name){
    var offscreen = document.createElement('canvas').getContext('2d');
    offscreen.fillStyle = name;
    return offscreen.fillStyle;
}