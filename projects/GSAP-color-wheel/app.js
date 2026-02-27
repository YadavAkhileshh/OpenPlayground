import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/+esm";
import tinycolor2 from "https://esm.sh/tinycolor2";

let select = (e) => document.querySelector(e);
let selectAll = (e) => document.querySelectorAll(e);

const body = select("body"),
  outlinePath = select("#outlinePath"),
  tCW = select("#tCW"),
  tCWB = select("#tCWB"),
  theColorWheel = select("#theColorWheel"),
  ringD = select("#ring").getAttribute("d"),

  menuMotionPath = select("#menuMotionPath"),
  sideMenuItems = selectAll("i.sm.bi"),
  menuShadow = select("#menuShadow"),
  randomBt = select(".bi.bi-arrow-repeat"),
  tetradicBt = select(".bi.bi-square"),
  triadicBt = select(".bi.bi-triangle"),
  complementaryBt = select(".bi-noise-reduction"),
  splitComplementaryBt = select(".bi-share"),
  analogousBt = select(".bi-three-dots"),

  dataDisplayTitle = select("#dataDisplay h1");

var menuIndex = 4;
gsap.set(body, { autoAlpha: 1, attr: { ["data-type"]: "tetradic" } });
var newColor = resetLightness(chroma.random().hex());
updateColor(newColor, true);

$(document).ready(function () {

  $("#lightness").roundSlider({
    radius: 242,
    handleSize: "38,30",
    circleShape: "custom-half",
    sliderType: "pie",
    showTooltip: false,
    startAngle: 110,
    lineCap: "square",
    value: -90,
    min: -90,
    max: 90,
    width: 20,
    change: function (e) {
      let lightness = e.value;
      select("#lightnessVar").value = lightness;
      updateColor(newColor, false);
      if (lightness < 0 ) {
        gsap.to(body, { "--textColor": "#FFFFFF" });
        gsap.to(body, { "--textColor2": "#000000" });
      } else {
        gsap.to(body, { "--textColor": "#000000" });
        gsap.to(body, { "--textColor2": "#FFFFFF" });
      }
    }
  });

  let intro = gsap.timeline()
    .set( outlinePath, { attr: { d: ringD } })
    .to( outlinePath, { duration: 0.5, morphSVG: "#corner", ease: "power1.out" }, 1)
    .to( outlinePath, { duration: 0.5, morphSVG: "#body", ease: "none" })

    .fromTo( "#dataDisplay", { opacity: 0 }, { duration: 0.75, opacity: 1 } )
    .fromTo( "#dataDisplay .bgC", { opacity: 0 }, { duration: 0.7, opacity: 1, stagger: 0.2 }, "<" )
    .call( expandMenu, [], "<" )
    .call( runSlider, [], "<" )
    .call( setUpAllEventListeners, [] )
    .fromTo( tCW, { rotation: 260, opacity: 0,  transformOrigin: "50% 50%"}, { duration: 1, rotation: 0, opacity: 1, transformOrigin: "50% 50%", ease: "power03.out" }, 1);
  
});

function onMouseMove(e) {

  if (
    theColorWheel.classList.contains("mouseDrag") ||
    theColorWheel.classList.contains("mouseClick")
  ) {
    theColorWheel.classList.remove("mouseClick");

    const wheel = tCW.getBoundingClientRect(),
      r = wheel.width / 2,
      x = wheel.left + r - e.clientX,
      y = wheel.top + r - e.clientY,
      h = Math.sqrt(x * x + y * y).toFixed(2);

    if (h < r) {
      let a = Math.atan2(y, x);

      let hu = ((Math.atan2(y, x) * 180) / Math.PI).toFixed(2) - 90;
      if (hu < 0) hu += 360;

      let st = Math.min(1, h / r);
      if (st > 1) st = 1;

      newColor = chroma.hsl(hu, st, 0.5).hex();
      updateColor(newColor, true);

    }
  }
}

function resetLightness(newColor) {
  let resetColor = chroma
    .hsl(
      tinycolor2(newColor).toHsl()["h"],
      tinycolor2(newColor).toHsl()["l"],
      0.5
    )
    .hex();
  if (resetColor) return resetColor;
  else return newColor;
}

function updateColor(newColor, setBox) {
  var newColors, newColorsLt;
  let paletteType = body.getAttribute("data-type");

  let lt = select("#lightnessVar").value;
  if (lt != 0) lt = (select("#lightnessVar").value / 2).toFixed(2);

  let newColorLt = newColor;
  if (lt > 0) newColorLt = tinycolor2(newColor).lighten(lt).toHexString();
  if (lt < 0)
    newColorLt = tinycolor2(newColor).darken(Math.abs(lt)).toHexString();

  if (body.getAttribute("data-type") == "analogous") {
    let analogous = tinycolor2(newColor).analogous();
    let analogousLt = tinycolor2(newColorLt).analogous();

    newColors = [tinycolor2(newColor), analogous[1], analogous[5]];
    newColorsLt = [tinycolor2(newColorLt), analogousLt[1], analogousLt[5]];
  } else if (paletteType == "splitComplementary") {
    newColors = tinycolor2(newColor).splitcomplement();
    newColorsLt = tinycolor2(newColorLt).splitcomplement();
  } else if (paletteType == "complementary") {
    newColors = [tinycolor2(newColor), tinycolor2(newColor).complement()];
    newColorsLt = [tinycolor2(newColorLt), tinycolor2(newColorLt).complement()];
  } else if (paletteType == "triadic") {
    newColors = tinycolor2(newColor).triad();
    newColorsLt = tinycolor2(newColorLt).triad();
  } else {
    newColors = tinycolor2(newColor).tetrad();
    newColorsLt = tinycolor2(newColorLt).tetrad();
  }

  let tCWBxy = [];
  newColors.forEach((thisColor, index) => {
    let a = ((thisColor.toHsl()["h"] - 90) * Math.PI) / 180;
    let r = (thisColor.toHsl()["s"] / 100) * 50;
    let x = 380 * r * Math.cos(a);
    let y = 380 * r * Math.sin(a);

    if (setBox) gsap.set("#tCW" + index, {
      //duration: 0.25,
      x: x, y: y });

    gsap.set("#c" + index + "b", {
      innerHTML:
        "<b>#" +
        newColorsLt[index].toHex().toUpperCase() +
        "</b><span>" +
        newColorsLt[index].toRgbString() +
        "</span>" +
        "<span>" +
        newColorsLt[index].toHslString() +
        "</span>"
    });

    tCWBxy.push(x + 190, y + 190);
    
  });

  if (paletteType == "complementary") {
    gsap.set("body", {
      "--c0": newColorsLt[0].toHexString(),
      "--c1": newColorsLt[1].toHexString()
    });
  } else if (
    paletteType == "triadic" ||
    paletteType == "splitComplementary" ||
    paletteType == "analogous"
  ) {
    gsap.set("body", {
      "--c0": newColorsLt[0].toHexString(),
      "--c1": newColorsLt[1].toHexString(),
      "--c2": newColorsLt[2].toHexString()
    });
  } else {
    gsap.set("body", {
      "--c0": newColorsLt[0].toHexString(),
      "--c1": newColorsLt[1].toHexString(),
      "--c2": newColorsLt[2].toHexString(),
      "--c3": newColorsLt[3].toHexString()
    });
  }

  if (setBox) {
    if (paletteType == "complementary") {
      gsap.set(tCWB, {
        //duration: 0.25,
        attr: {
          d: `M ${tCWBxy[0]}, ${tCWBxy[1]} L${tCWBxy[2]}, ${tCWBxy[3]} Z`
        }
      });
    } else if (
      paletteType == "triadic" ||
      paletteType == "splitComplementary"
    ) {
      gsap.set(tCWB, {
        //duration: 0.25,
        attr: {
          d: `M ${tCWBxy[0]}, ${tCWBxy[1]} L${tCWBxy[2]}, ${tCWBxy[3]} L${tCWBxy[4]}, ${tCWBxy[5]} Z`
        }
      });
    } else if (paletteType == "analogous") {
      gsap.set(tCWB, {
        //duration: 0.25,
        attr: {
          d: `M ${tCWBxy[0]}, ${tCWBxy[1]} L${tCWBxy[2]}, ${tCWBxy[3]} L${tCWBxy[4]}, ${tCWBxy[5]} Z`
        }
      });
    } else {
      gsap.set(tCWB, {
        //duration: 0.25,
        attr: {
          d: `M ${tCWBxy[0]}, ${tCWBxy[1]} L${tCWBxy[2]}, ${tCWBxy[3]} L${tCWBxy[4]}, ${tCWBxy[5]} L${tCWBxy[6]}, ${tCWBxy[7]} Z`
        }
      });
    }
  }
}

function expandMenu() {

  sideMenuItems.forEach((sideMenuItem, index) => {

    let t = gsap.to(sideMenuItem, {
      motionPath: {
        start: 2 * 0.2,
        end: index * 0.2,
        path: menuMotionPath,
        align: menuMotionPath,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
      },
      duration: 0.6,
      transformOrigin: "50% 50%",
      opacity: 1
    });

  });

} 

function runSlider() {

  gsap.fromTo( menuShadow,
              {
    motionPath: {
      path: menuMotionPath,
      align: menuMotionPath,
      alignOrigin: [0.5, 0.5],
      autoRotate: true,
      curviness: 2,
      end: 4 * 0.2,
    },
    transformOrigin: "50% 50%",
  }, { fillOpacity: 0.08, duration: 1, });

  $("#lightness").roundSlider({ value: 0 });

}

function updateMenu(oldIndex, newIndex) {

  let disptance = Math.abs(oldIndex - newIndex);
  if( disptance > 0 )
  {

    let menuDuration = disptance * 0.2;
    gsap.to( menuShadow,
    {
      motionPath: {
        path: menuMotionPath,
        align: menuMotionPath,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
        curviness: 2,
        start: oldIndex * 0.2,
        end: newIndex * 0.2,
      },
      duration: menuDuration,
      //ease:"elastic.out(0.6,0.4,0.2)",
      transformOrigin: "50% 50%",
    });

  }

}


function setUpAllEventListeners(){
  
  tCW.addEventListener("mousemove", onMouseMove);
  tCW.addEventListener("click", onMouseMove);

  tCW.addEventListener("click", (event) => {
    theColorWheel.classList.add("mouseClick");
  });
  tCW.addEventListener("mousedown", (event) => {
    theColorWheel.classList.add("mouseDrag");
  });
  tCW.addEventListener("mouseup", (event) => {
    theColorWheel.classList.remove("mouseDrag");
  });
  tCW.addEventListener("mouseleave", (event) => {
    theColorWheel.classList.remove("mouseDrag");
  });
  //tCW.addEventListener("mouseenter", (event) => { theColorWheel.classList.remove("mouseDrag"); });

  randomBt.addEventListener("click", randomPalette);
  function randomPalette() {
    var tl = gsap
      .timeline()
      .fromTo(
        ".bi-arrow-repeat",
        0.5,
        { rotation: 0 },
        { rotation: 360, transformOrigin: "50% 50%" }
      );
    newColor = chroma.random().hex();
    updateColor(newColor, true);
  }

  tetradicBt.addEventListener("click", tetradicPalette);
  function tetradicPalette() {
    gsap.set(body, { attr: { ["data-type"]: "tetradic" } });
    dataDisplayTitle.innerHTML = "<i class='bi bi-square'></i> Tetradic colors";
    updateColor(newColor, true);
    updateMenu(menuIndex,4);
    menuIndex = 4;
  }

  triadicBt.addEventListener("click", triadicPalette);
  function triadicPalette() {
    gsap.set(body, { attr: { ["data-type"]: "triadic" } });
    dataDisplayTitle.innerHTML =
      "<i class='bi bi-triangle'></i> Triadic colors";
    updateColor(newColor, true);
    updateMenu(menuIndex,3);
    menuIndex = 3;
  }

  complementaryBt.addEventListener("click", complementaryPalette);
  function complementaryPalette() {
    gsap.set(body, { attr: { ["data-type"]: "complementary" } });
    dataDisplayTitle.innerHTML =
      "<i class='bi bi-noise-reduction'></i> Complementary colors";
    updateColor(newColor, true);
    updateMenu(menuIndex,2);
    menuIndex = 2;
  }

  splitComplementaryBt.addEventListener("click", splitComplementaryPalette);
  function splitComplementaryPalette() {
    gsap.set(body, { attr: { ["data-type"]: "splitComplementary" } });
    dataDisplayTitle.innerHTML =
      "<i class='bi bi-share'></i> Split complementary colors";
    updateColor(newColor, true);
    updateMenu(menuIndex,1);
    menuIndex = 1;
  }

  analogousBt.addEventListener("click", analogousPalette);
  function analogousPalette() {
    gsap.set(body, { attr: { ["data-type"]: "analogous" } });
    dataDisplayTitle.innerHTML =
      "<i class='bi bi-three-dots'></i> Analogous colors";
    updateColor(newColor, true);
    updateMenu(menuIndex,0);
    menuIndex = 0;
  }

}