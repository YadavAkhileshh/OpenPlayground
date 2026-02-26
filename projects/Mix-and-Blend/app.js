import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/+esm";
import tinycolor2 from "https://esm.sh/tinycolor2";

let select = (e) => document.querySelector(e);
let selectAll = (e) => document.querySelectorAll(e);

const

mixBlendSelect = select("#mixBlendModeSelect"),
mixBlendSelectOptions = selectAll("#mixBlendModeSelect option"),
colorSelect = select("#colorSelect"),
colorSelectOptions = selectAll("#colorSelect option");
var isIoS = false;
if( navigator.platform.startsWith("iP") || navigator.platform.startsWith("Mac") && navigator.maxTouchPoints > 4 )
{
		isIoS = true;
		mixBlendSelect.classList.add("iosSelect");
		colorSelect.classList.add("iosSelect");
}
else
{
		mixBlendSelect.classList.add("notIosSelect");
		colorSelect.classList.add("notIosSelect");
}

const dataCard = select("#dataCard");
var optionEl = document.querySelectorAll('#colorSelect option:checked');
var optionValues = Array.from(optionEl).map(el => el.value);
var optionValueText = optionValues[0].replace(/([A-Z])/g, ' $1').trim();


var spiral = select("#spiral"), spiralLength, spiralPathArray = [];
var spiral2 = select("#spiral2");
spiral.setAttribute("d", select("#spiralPath2").getAttribute("d"));
spiral2.setAttribute("d", select("#spiralPath2").getAttribute("d"));
var numberOfSegments = 15;
var startPosMem = 0;
var startIndexMem = 0;

let appearanceBaseSelectEnabled = false;
if ( window.getComputedStyle(colorSelect).getPropertyValue("appearance") == "base-select" )
    appearanceBaseSelectEnabled = true;
  


/* select change eventListeners */

mixBlendSelect.addEventListener("change", function() {

    let mixBlendEl = selectAll('#mixBlendModeSelect option:checked');
    let mixBlends = "";
    for( var i = 0; i < mixBlendEl.length; i++ )
    {
        if( i > 0 )
            mixBlends += ", ";
        mixBlends += mixBlendEl[i].value;
    }
    gsap.set("svg#spiralSvg", { "--mixBlendMode": mixBlends.trim() });
    
    setupSegments();

});

colorSelect.addEventListener("change", function() {

    optionEl = selectAll('#colorSelect option:checked');
    numberOfSegments = optionEl.length;
    optionValues = Array.from(optionEl).map(el => el.value);
    optionValueText = optionValues[0].replace(/([A-Z])/g, ' $1').trim();

    gsap.set("body", { "--selectColor": optionValues[0] });
    gsap.set("body", { "--selectColorText": optionValueText });
    gsap.set("body", { "--selectColorLast": optionValues[numberOfSegments-1] });
    
    setupSegments();

});


document.body.onload = () => {

    gsap.set("body", { "--selectColor": optionValues[0] });
    gsap.set("body", { "--selectColorText": optionValueText });
    gsap.set("body", { "--selectColorLast": optionValues[numberOfSegments-1] });

	/* update each select option */	
    colorSelectOptions.forEach((option,i) => {

        let optionValue = option.value;

        if( optionValue )
        {
            let optionValueText = optionValue.replace(/([A-Z])/g, ' $1').trim();
            option.setAttribute("style", "background-color: "+optionValue+"!important;");    
            option.setAttribute("title", optionValueText);
            if( isIoS )
                option.innerHTML = optionValueText;
        }

    });

    spiralLength = spiral.getTotalLength();
    for( var i = 0; i < spiralLength; i+=10 )
        spiralPathArray.push(spiral.getPointAtLength(i));

    setupSegments();

    gsap.set("#gsapWrapper", { autoAlpha: 1 });

}

function setupSegments() {

    if( numberOfSegments < 6 )
        numberOfSegments = 6;

    const
    segmentsTemp = selectAll("#segmentsTemp .segmentPath"),
    segments = selectAll("#segments .segmentPath");

    segmentsTemp.forEach((segment) => { segment.remove(); });
    segments.forEach((segment) => { segment.remove(); });

    var spiralSegmentPathArray = [];

    createSegments(numberOfSegments);
    function createSegments(numberOfSegments) {

        var newSegment,newSegment2,newSegmentTemp,
        startIndex = 10;/* ,newSegmentTemp2 */

        for( let i = 0, optionElIndex = 0; i < numberOfSegments; i++, optionElIndex++ )
        {

            if( !optionEl[optionElIndex] )
                optionElIndex = 0;

            newSegment = select("#spiralSegment").cloneNode(true);
            newSegment2 = select("#spiralSegment").cloneNode(true);
            newSegmentTemp = select("#spiralSegment").cloneNode(true);
            newSegment.id += i;
            newSegment2.id += i + "a";
            if( optionValues[optionElIndex] )
            {
                newSegment.setAttribute("data-color", optionValues[optionElIndex]);
                gsap.set( newSegment, { "--segmentColor": optionValues[optionElIndex] });
            }
            else
            {
                newSegment.setAttribute("data-color","Black");
                gsap.set( newSegment, { "--segmentColor": "Black"});
            }

            newSegmentTemp.id += i + "b";
            let l = i + 1;
            select("#segmentsTemp").appendChild(newSegmentTemp);
            let startPos = 0.93 * ( l * ( 1 / numberOfSegments ) ) * ( l  *  ( 1 / numberOfSegments ) ) / 6.35;

            gsap.set(newSegmentTemp, {
                motionPath: {
                    path: "#spiral",
                    align: "#spiral",
                    alignOrigin: [0, 0],
                    start: startPos,
                    end: startPos,
                    autoRotate: true
                } 
            });
            
            let matrix = MotionPathPlugin.convertCoordinates( newSegmentTemp, select("#spiralWrapper") ),
            p1 = matrix.apply({ x: 0, y: 0 }),
            p2 = matrix.apply({ x: 170, y: 700 });
            p2 = matrix.apply({ x: 0, y: 650 });
            let points = [ [p1.x,p1.y], [p2.x,p2.y] ];
            let path = "M " + points.map(p => p.join(" ")).join(" L ");
            newSegment.setAttribute("d",path);
         		select("#segments").appendChild(newSegment);/*  */

            if( i > 0 )
            {
                let k = i - 1;
                let startPosMid = startPos - ( ( startPos - startPosMem) / 2 );
                gsap.set(newSegmentTemp, {
                    motionPath: {
                        path: "#spiral",
                        align: "#spiral",
                        alignOrigin: [0, 0],
                        start: startPosMid,
                        end: startPosMid,
                        autoRotate: true
                    } 
                });
                let matrix2 = MotionPathPlugin.convertCoordinates( newSegmentTemp, select("#spiralWrapper") ),
                p1a = matrix2.apply({ x: 0, y: 0 }),
                p2a = matrix2.apply({ x: 170, y: 700 });
                p2a = matrix2.apply({ x: 0, y: 600 });
                let points2 = [ [p1a.x,p1a.y], [p2a.x,p2a.y] ];
                let path2 = "M " + points2.map(p => p.join(" ")).join(" L ");
                newSegment2.setAttribute("d",path2);
                select("#segments").appendChild(newSegment2);

            }

            spiralSegmentPathArray.push( getIntersection( startIndex, newSegment ) );
            if( spiralSegmentPathArray[i] )
            {
                startIndex = spiralSegmentPathArray[i][2];
                if( i > 0 )
                {
                    let midPoint = getMidIntersection( startIndexMem, newSegment2 );
                    var j = i - 1;
                    let path2 = spiralSegmentPathArray[i][0];
                    path2 += " Q" + midPoint[0] +" " + midPoint[1] + ", " + midPoint[0] + " " + midPoint[1];
                    path2 += " Q" + spiralSegmentPathArray[j][5] +" " + spiralSegmentPathArray[j][6] + ", " + spiralSegmentPathArray[j][5] + " " + spiralSegmentPathArray[j][6];
                    path2 += spiralSegmentPathArray[j][1];
                    path2 += " z ";
                    newSegment.setAttribute("d",path2);
                    newSegment.classList.add("segmentFill");
                }
            }

            startPosMem = startPos;

        }
        
    }

}

function getMidIntersection( startIndexMem, path ) {

        if( startIndexMem < 10 )
            startIndexMem = 10;
        var pathLength = path.getTotalLength();

        for( var j = startIndexMem; j < pathLength; j++ )
        {
            var p = path.getPointAtLength(j);
            let pointObj = { x: p.x, y: p.y };
            if( spiral2.isPointInStroke(pointObj) )
            {
                return [ (pointObj.x ).toFixed(2), ( pointObj.y ).toFixed(2)];
            }
        }
        return false;

}

function getIntersection( startIndex, path ) {

        if( startIndex < 10 )
            startIndex = 10;
        var pathLength = path.getTotalLength();
        var startPoint = path.getPointAtLength(0);

        for( var j = startIndex; j < pathLength; j++ )
        {
            var p = path.getPointAtLength(j);
            let pointObj = { x: p.x, y: p.y };
            if( spiral2.isPointInStroke(pointObj) )
            {
                return [
                    " M " + startPoint.x.toFixed(2) + ', ' + startPoint.y.toFixed(2) + " L " + pointObj.x.toFixed(2) + ', ' + pointObj.y.toFixed(2),
                    " L " + startPoint.x.toFixed(2) + ',' + startPoint.y.toFixed(2),
                    j, startPoint.x.toFixed(2), startPoint.y.toFixed(2), pointObj.x.toFixed(2), pointObj.y.toFixed(2)
                ];
            }
        }
        return false;

}