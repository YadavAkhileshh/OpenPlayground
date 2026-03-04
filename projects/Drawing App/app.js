const SWATCH_SIZE = 25
const SWATCH_PADDING = 3
const SIDE_PANEL_WIDTH = 300
let palettesByName = []
let palettesByIndex = []
let c,ctx,currColor,colorValue,pals,palCntr
let splash
let sCurrColor = "Red"
let nPenThickness = 12


// see: https://www.color-hex.com/color-palettes/popular.php
// (I did not do a complete list... at least for now...)
let palPopular = {
	name:"Popular Color Palettes",
	key:"popular",
	sys:true,
	swatches: [
		"%Cappuccino",
		"#4b3832","#854442","#fff4e6","#3c2f2f","#be9b7b",
		"%Pastel Colors of the Rainbow",
		"#ffb3ba","#ffdfba","#ffffba","#baffc9","#bae1ff",
		"%Beach",
		"#96ceb4","#ffeead","#ff6f69","#ffcc5c","#88d8b0",
		"%Pastel Rainbow",
		"#a8e6cf","#dcedc1","#ffd3b6","#ffaaa5","#ff8b94",
		"%Beautiful Blues",
		"#011f4b","#03396c","#005b96","#6497b1","#b3cde0",
		"%Skin Tones",
		"#8d5524","#c68642","#e0ac69","#f1c27d","#ffdbac",
		"%Shades of Teal",
		"#b2d8d8","#66b2b2","#008080","#006666","#004c4c",
		"%Faded Rose",
		"#dfdfde","#a2798f","#d7c6cf","#8caba8","#ebdada",
		"%Aesthetic",
		"#66545e","#a39193","#aa6f73","#eea990","#f6e0b5",
		"%Facebook",
		"#3b5998","#8b9dc3","#dfe3ee","#f7f7f7","#ffffff",
		"%Retro",
		"#666547","#fb2e01","#6fcb9f","#ffe28a","#fffeb3",
		"%Princess Pink",
		"#ffc2cd","#ff93ac","#ff6289","#fc3468","#ff084a"
	]
}

let palNamedColors = {
	name:"Named Colors",
	key:"clrNamed",
	sys:true,
	swatches: ["%Red HTML Color Names",
		"transparent","IndianRed","LightCoral","Salmon","DarkSalmon",
		"LightSalmon","Crimson","Red","FireBrick","DarkRed",
		"%Pink HTML Color Names",
		"Pink","LightPink","HotPink","DeepPink","MediumVioletRed",
		"PaleVioletRed",
	  "%Orange HTML Color Names",
		"LightSalmon","Coral","Tomato","OrangeRed",
		"DarkOrange","Orange",
		"%Yellow HTML Color Names",
		"Gold","Yellow","LightYellow",
		"LemonChiffon","LightGoldenrodYellow","PapayaWhip","Moccasin",
		"PeachPuff","PaleGoldenrod","Khaki","DarkKhaki",
		"%Purple HTML Color Names",
		"Lavender","Thistle","Plum","Violet","Orchid","Fuchsia","Magenta",
		"MediumOrchid","MediumPurple","RebeccaPurple","BlueViolet",
		"DarkViolet","DarkOrchid","DarkMagenta","Purple","Indigo",
		"SlateBlue","DarkSlateBlue","MediumSlateBlue",
		"%Green HTML Color Names",
		"GreenYellow",
		"Chartreuse","LawnGreen","Lime","LimeGreen","PaleGreen",
		"LightGreen","MediumSpringGreen","SpringGreen","MediumSeaGreen",
		"SeaGreen","ForestGreen","Green","DarkGreen","YellowGreen",
		"OliveDrab","Olive","DarkOliveGreen","MediumAquamarine",
		"DarkSeaGreen","LightSeaGreen","DarkCyan","Teal",
		"%Blue HTML Color Names",
		"Aqua","Cyan","LightCyan","PaleTurquoise","Aquamarine",
		"Turquoise","MediumTurquoise","DarkTurquoise","CadetBlue",
		"SteelBlue","LightSteelBlue","PowderBlue","LightBlue","SkyBlue",
		"LightSkyBlue","DeepSkyBlue","DodgerBlue","CornflowerBlue",
		"MediumSlateBlue","RoyalBlue","Blue","MediumBlue","DarkBlue",
		"Navy","MidnightBlue",
	  "%Brown HTML Color Names",
		"Cornsilk","BlanchedAlmond","Bisque","NavajoWhite","Wheat",
		"BurlyWood","Tan","RosyBrown","SandyBrown","Goldenrod",
		"DarkGoldenrod","Peru","Chocolate","SaddleBrown","Sienna",
		"Brown","Maroon",
		"%White HTML Color Names",
		"White","Snow","HoneyDew","MintCream","Azure","AliceBlue",
		"GhostWhite","WhiteSmoke","SeaShell","Beige","OldLace",
		"FloralWhite","Ivory","AntiqueWhite","Linen",
		"LavenderBlush","MistyRose",
		"%Gray HTML Color Names",
		"Gainsboro","LightGray","Silver","DarkGray","Gray",
		"DimGray","LightSlateGray","SlateGray","DarkSlateGray",
		"Black"
						 
		]}

let palCrayons = {
	name:"Crayons",
	key:"clrSys",
	sys:true,
	swatches: ["transparent","#000000","#212122","#424243","#5e5f5f","#797979","#919291","#929392","#aaa9a9","#c1c0c0","#d5d6d6","#ebeaeb","#ffffff","#fe7f7a","#ffd478","#fffc78","#d4fb79","#72fa79","#73fcd6","#72fdff","#76d5fe","#7a81ff","#d783ff","#ff84ff","#ff8ad9","#931102","#945202","#938f01","#4e9000","#008f00","#008f51","#039192","#005493","#021992","#541a94","#942193","#951751","#ff2503","#ff9400","#fefc00","#8cfb00","#00fa05","#00fb92","#09fcff","#0097ff","#0333fe","#9436fe","#ff41ff","#fe3093"
		]}

let palSystem = {
	name:"System Colors",
	key:"clrSys",
	sys:true,
	swatches: ["transparent","#e0e0e0","#a2a3a3","#656565","#474747","#3d3d3d","#ff4246","#2ed158","#0391fe","#ff9232","#fed700","#b78a66","#fe365e","#db35f2","#09d2e0","#6d7cff","#353535","#323232","#282828","#1e1e1e","#265e61","#464646","#3e3d3c","#ffff00","#656665","#e0e0e0","#526666","#e0e0e0","#656565","#4f7072","#417e82","#0adac3","#3cd3fe","#98989c","#439cfe","#656665","#e0e0e0","#ffffff","#ffffff","#ffffff","#474648","#1a1a1a","#ffffff","#1e1e1e","#ffffff","#546566","#464646","#ffffff","#474747","#434342","#3d3d3d","#393a39"
		]}

let palApple = {
	name:"Apple Colors",
	key:"clrSafe",
	sys:true,
	swatches: ["transparent","#000000","#0533ff","#aa7a42","#00feff","#00fa00","#ff41ff","#ff9400","#942192","#ff2500","#fffb00","#fffffe"
		]}

let palClrSafe = {
	name:"Web Safe Colors",
	key:"clrSafe",
	sys:true,
	swatches: ["transparent","#fefeff","#d6d5d5","#a9a9aa","#7a7979","#424243","#000000","#ffd6d5","#d7aaa9","#aa7a79","#7a4441","#430400","#ffaaa9","#d77c79","#d84a41","#ab4642","#7a0d00","#ff7d7a","#ff4b42","#ff2600","#d91e00","#ab1400","#ffaa79","#ff7d41","#ff4b00","#d74900","#ab4600","#ffd5a8","#d6a878","#d87a42","#aa7942","#7a4300","#ffaa40","#ff7c00","#ffa800","#d87a00","#d7a841","#ffd479","#ffd440","#ffd300","#d6a800","#aa7900","#fefed6","#d5d5aa","#a9a879","#797842","#424100","#fffca9","#d4d478","#d7d341","#a9a743","#797800","#fefd79","#fefc41","#fefc00","#d5d300","#a8a700","#d4fc78","#d3fb42","#d4fb00","#a9d100","#79a500","#d4fca9","#a9d279","#a7d242","#78a742","#407601","#a6fa42","#a6fa01","#72fa01","#74d200","#76d143","#a5fb79","#75f941","#31fa00","#37d100","#3ea600","#d5fdd5","#a8d3a8","#78a77a","#417743","#004000","#a6fca9","#74d279","#37d141","#3ca642","#007600","#72fb7a","#2dfa41","#00f800","#00d000","#00a600","#74fba9","#30fb78","#00fa41","#00d042","#00a643","#a7fcd6","#75d3aa","#35d278","#3da77a","#007742","#30fbaa","#00fb7a","#00fba9","#00d079","#37d3aa","#73fcd6","#33fdd5","#00fdd7","#00d2aa","#00a77a","#d5feff","#a8d5d6","#79a8aa","#40787a","#004243","#a7fdfe","#75d3d5","#38d4d6","#3ea8a9","#007979","#72fdff","#32feff","#00fdfe","#00d4d6","#00a8ab","#77d6ff","#39d6ff","#00d5ff","#00aad7","#007aaa","#a9d6ff","#78aad5","#3da9d5","#417aa9","#004479","#3dacff","#00acff","#0080ff","#007dd5","#3f7dd6","#79acff","#4181ff","#0052ff","#004cd6","#0048a9","#d6d7ff","#aaabd5","#787ca9","#43457a","#010643","#a9adff","#797ed6","#434dd6","#4349a9","#001279","#7a80ff","#4453ff","#0533ff","#0429d7","#011eaa","#aa81ff","#7b54ff","#4533ff","#432ad5","#441faa","#d8aeff","#a97fd5","#7a4fd5","#7b4ba9","#441579","#ab55ff","#7c36ff","#ac39ff","#7b2dd7","#ab51d7","#d783ff","#d758ff","#d83cff","#ab2fd6","#7b23aa","#ffd9ff","#d7acd5","#ab7da9","#7a477a","#430942","#ffaeff","#d780d6","#d853d6","#ab4ba9","#7b1979","#ff85ff","#ff5bff","#ff42ff","#d834d6","#ab28aa","#ff82d6","#ff56d5","#ff3ad5","#d82da8","#ac1e7a","#ffadd6","#d77daa","#d84fa9","#aa497a","#7a1042","#ff53a9","#ff32a9","#ff2b79","#d72779","#d84c78","#ff80ab","#ff4f79","#ff2841","#d82041","#ac1941"
	]
}

let palBW = {
	name:"Gray Scale",
	key:"gray",
	sys:true,
	swatches: [
		"transparent","#000000","#0d0d0c","#1a1a19","#262626","#323334",
		"#333333","#4c4e4e","#595958","#666665","#737373","#7f8080","#8c8c8c",
		"#999998","#a6a6a6","#b2b2b2","#bfbfbf","#cccdcc","#d9d9d9",
		"#e6e6e6","#f3f2f3","#ffffff"
	]
}

let palColors = {
	name:"Colors",
	key:"colors",
	sys:true,
	swatches: [
		"transparent","#df3326","#e1672e","#e8b23e","#e8f151",
    "#aaf04c","#7eef4a","#70ee51","#70ee86","#6feecb","#3677ea",
		"#1528e8","#3d11e9","#871fe9","#d030ea","#de33aa","#dd3361",
    "#d3352b","#d56a32","#ddac40","#d1a643","#cfd950","#9fd74c",
		"#78d64b","#68d655","#68d584","#5ab7d5","#3f7ad2","#2b3bd0",
		"#4b28d0","#842fd1","#be38d3","#c739a1","#c73a67","#bc403a",
		"#bf6e40","#c4a048"
	]
}

let nLastX, nLastY
let bDrawing = false

function handlePointerDown(evt) {
	ctx.beginPath();
  ctx.moveTo(evt.x, evt.y);
	ctx.stroke()
	nLastX = evt.x
	nLastY = evt.y
	hideSplash()
} // end of handlePointerDown


function handlePointerMove(evt) {
	if (evt.buttons === 0) return
	
	if (bDrawing) return
	
	bDrawing = true
	
	ctx.beginPath()
	ctx.moveTo(nLastX, nLastY)	
	
	nLastX = evt.offsetX
	nLastY = evt.offsetY
	
	ctx.lineTo(nLastX, nLastY)
	ctx.stroke()
	
	bDrawing = false
} // end of handlePointerMove


function handlePointerUp(evt) {
	nLastX = evt.offsetX
	nLastY = evt.offsetY
	ctx.beginPath()
	ctx.moveTo(nLastX, nLastY)	
	const dataURL = c.toDataURL();  
	imgCache.src = dataURL
} // end of handlePointerUp

let about

function pageSetup() {
	c = document.getElementById("c")
	c.addEventListener("dblclick", handlePointerDown)
	c.addEventListener("pointerdown", handlePointerDown)
	c.addEventListener("pointermove", handlePointerMove)
	c.addEventListener("pointerup", handlePointerUp)
	
	
	ctx = c.getContext("2d")
	currColor = document.getElementById("currColor")
	colorValue = document.getElementById("colorValue")
	colorValue.value = "Red"
	
	pals = document.getElementById("pals")
	pals.addEventListener("change", changePalette)
	palCntr = document.getElementById("palCntr")
	palCntr.addEventListener("click", changeColor)
	const palParams = {
		palettes:[palColors, palBW,palNamedColors,palApple,palSystem,
							palCrayons,palClrSafe,palPopular]
	}
	
	splash = document.getElementById("splash")
	splash.addEventListener("click", hideSplash)
	
	for (let n=0; n < palParams.palettes.length; n++) {
		const pal = palParams.palettes[n]
		makePalette(pal)
	} // next n
	
	
	about = document.getElementById("about")
	about.addEventListener("click", aboutToggle)
	
	pageResize()
	
	pals.selectedIndex = 6
	
	displayPalette()
	
	setTimeout(hideSplash, 3500)
} // end of pageSetup



function hideSplash() {
		splash.style.display = "none"	
} // end of hideSplash

function aboutToggle() {
	if (splash.style.display === "none") {
		splash.style.left = Math.floor((window.innerWidth - 620) / 2)+"px"
		splash.style.top = Math.floor((window.innerHeight - 509) / 2)+"px"
		splash.style.display = ""
	} else {
		splash.style.display = "none"
	} // end if/else
	
} // end of aboutToggle


const imgCache = new Image()

function pageResize() {
	
	c.width = window.innerWidth - SIDE_PANEL_WIDTH - 12
	c.height = window.innerHeight - 6
	
	
	
	ctx.strokeStyle = sCurrColor
	ctx.lineWidth = nPenThickness
	ctx.lineCap = "round"
	//ctx.lineJoin = "round"
	setTimeout(restoreImg, 100)
	if (splash.style.display !== "none") {
		splash.style.left = Math.floor((window.innerWidth - 620) / 2)+"px"
		splash.style.top = Math.floor((window.innerHeight - 509) / 2)+"px"
	} // end if
	
	
} // end of pageResize

function restoreImg() {
	ctx.drawImage(imgCache, 0, 0, imgCache.width, imgCache.height)
}


function makeSwatch(params) {
	
} // end of makeSwatch

function changePalette(evt) {
	displayPalette()
	
} // end of changePalette


function changeColor(evt) {
	const el = evt.target
	
	if (!el.classList.contains("swatch")) {
		return
	} // end if

	sCurrColor = el.title
	currColor.title = sCurrColor
	
	if (el.title === "transparent") {
		makeTransparentIcon(currColor)
	} else {
		currColor.innerHTML = ""
		currColor.style.backgroundColor = el.style.backgroundColor
	} // end if/else
	
	ctx.strokeStyle = sCurrColor
	colorValue.value = sCurrColor
} // end of changeColor


function makeTransparentIcon(el) {
	el.style.backgroundColor = "white"
	const s = []
	s.push("<svg width='"+SWATCH_SIZE+"' height='"+SWATCH_SIZE+"' class='trs'>")	
	s.push("<line x1='"+SWATCH_SIZE+"' y1='0' ")
	s.push("x2='0' y2='"+SWATCH_SIZE+"' stroke='red' ")
	s.push(" ></line>")
	s.push("</svg>")
	el.innerHTML = s.join("")
	//alert(s.join(""))

} // end makeTransparentIcon


function makePalette(params) {
	palettesByName[params.name] = params
	palettesByIndex.push(params)
	option = document.createElement("option")
	option.text = params.name
	option.value = params.key
	pals.add(option)
} // end of makePalette


function displayPalette() {
	palCntr.style.display = "none"
	palCntr.innerHTML = ""
	const idx = pals.selectedIndex
	const pal = palettesByIndex[idx]
	const nMax = pal.swatches.length
	let x = 0
	let y = 0
	let nCol = 0
	let nCatCount = 0
	
	for (let n=0; n < nMax; n++) {
		const swatchColor = pal.swatches[n]
		const sw = document.createElement("div")
		if (swatchColor.substring(0, 1) === "%") {
			nCatCount++
			x = 0
			if (y > 0){
				y = y + SWATCH_SIZE 
			}

			if (nCatCount > 2) y = y +20
			
			sw.innerText = swatchColor.substring(1)+":"
			sw.className = "colorCat"
			sw.style.left = (x)+"px"
			sw.style.top = (y)+"px"
			nCol = 0
			y=y+25
			palCntr.appendChild(sw)
		} else {
			sw.className = "swatch sl"
			if (swatchColor === "transparent") {
				sw.style.backgroundColor = "white"
				makeTransparentIcon(sw)
			} else {
				sw.style.backgroundColor = swatchColor
			} // end if / else

			sw.style.left = (x)+"px"
			sw.style.top = (y)+"px"

			sw.title = swatchColor
			
			x = x + SWATCH_SIZE + SWATCH_PADDING
			nCol = nCol + 1
		} // end if/else
		
		palCntr.appendChild(sw)
		
		
		
		if (nCol > 9) {
			nCol = 0
			y = y + SWATCH_SIZE + SWATCH_PADDING
			x = 0
		} // end if
		
	} // next n
	
	palCntr.style.display = ""
	
} // end of displayPalette



window.addEventListener("load", pageSetup)
window.addEventListener("resize", pageResize)