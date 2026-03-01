const isDebug = /debug/.test(window.location.href)
const w3 = "http://www.w3.org/"
const svgNS = w3 + "2000/svg"
const xlinkNS = w3 + "1999/xlink"
const notes = "C C# D D# E F F# G G# A A# B".split(" ")
let w, h
let scrollX = 0, scrollY = 0, cursorX = 0
const borders = { l: 0, r: 250 }
const borderExtend = 250
let moveMode = null
let playing = false
const d = document
const $ = document.querySelector.bind(d)
const $$ = (sel, con) => Array.prototype.slice.call((con||d).querySelectorAll(sel))
const { sqrt, min, max } = Math
const distance = (a, b) => sqrt((b[0]-a[0])**2 + (b[1]-a[1])**2)
const freq = (y) => max(880 - y, 10)
const freqToY = (f) => 880 - f
const svg = $`#main`
let masterVolume
let AC = new AudioContext()
const defaultVolume = 0.5
const initAudioContext = () => {
  if(AC.state === "suspended") {
    $`.overlay`.style.display='block'
    $`.overlay`.addEventListener('click', () => {
      $`.overlay`.style.display='none'
      AC.resume()
    })
  }
  masterVolume = AC.createGain()
  masterVolume.gain.value = defaultVolume
  masterVolume.connect(AC.destination)  
}
initAudioContext()
const music = []
let mouseNoise = null
let touchNoises = []
let midiNoises = {}
let currentType = "sine"
let clientRect = svg.getBoundingClientRect()

Array.prototype.avg = function() {
  let r = 0, i = 0;
  for(i = 0; i < this.length; i++)
    r+=this[i]
  return r/this.length
}

const typeColors = {
  "sine": "#9944ff",
  "square": "#aad400",
  "sawtooth": "#c83737",
  "triangle": "#2a7fff",
  "noise": "#ffffff"
}

const noteToFreq = (note, octave) => {
  const n = (typeof note === "string") ? notes.indexOf(note.replace(/_/,'')) : n
  const f = (110*2**octave)*2**((n+3)/12)
  return f
}

const hexColor = (c) => {
  if (c.slice(0) === '#') return c
  if (c.slice(0,4) === 'rgb(') {
    return "#" + c.slice(4,-1).split(",").map(a => ((a|0)>>4).toString(16)+((a|0)%16).toString(16)).join("")
  }
  return c
}

const types = Object.keys(typeColors)

const attribs = (el, attrs, x) => {
	for(x in attrs)
		if(attrs.hasOwnProperty(x) && attrs[x] !== undefined)
			el.setAttribute(x,attrs[x])
}

const draw = (name,attrs) => {
	const el = document.createElementNS(svgNS, name)
	if(attrs) attribs(el,attrs)
	return el
}

const scrollToCursor = () => {
  const middleX = (clientRect.right - clientRect.left) / 2
  if (cursorX > scrollX + middleX || scrollX > cursorX) {
    scrollX = cursorX - middleX
  }
}

const relPos = (x,y) => {
  // calculate from mouse/touch position 
  // to svg coordinate
  const relativeX = scrollX + x - clientRect.left
  const relativeY = scrollY + y - clientRect.top
  return { relX: relativeX, relY: relativeY }
}

const userIsJamming = () => {
  return (!!mouseNoise) || touchNoises.length > 0 || Object.keys(midiNoises).length > 0
}

const setCursor = (x) => {
  if (userIsJamming() && x < cursorX) {
    return
  }
  cursorX = x
  scrollToCursor()
  setViewBox()
}

const SoundMachine = {
  // Helper factory that creates and reuses 
  // oscillators. Usage:
  // SoundMachine.noise(frequency, type)
  // returns a noise that starts playing
  // immediately. It does not create a
  // new oscillator each time. After a noise 
  // is muted, it can be reused, avoiding
  // memory issues.

  noises: [],
  
  whiteNoiseBuffer: null,
  createWhiteNoise: () => {
    if (! SoundMachine.whiteNoiseBuffer) {
      const len = AC.sampleRate * 2
      const buf = AC.createBuffer(1, AC.sampleRate, len)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1
      }
      SoundMachine.whiteNoiseBuffer = buf 
    }
    const bufSrc = AC.createBufferSource()
    bufSrc.buffer = SoundMachine.whiteNoiseBuffer
    bufSrc.loop = true
    bufSrc.playbackRate.value = 1.0
    return bufSrc
  },
  
  makeSomeNoise: (freq, type) => {
    const noise = {
      osc: type === "noise" ?
           SoundMachine.createWhiteNoise() : AC.createOscillator(), 
      env: AC.createGain()
    }
    const { osc, env } = noise
    if (type !== "noise") {
      osc.type = type
      osc.frequency.value = freq
      osc.detune.value = 0  
    }
    env.gain.value = 1.0
    osc.start()
    osc.connect(env)
    env.connect(masterVolume)
    SoundMachine.noises.push(noise)
    return noise
  },
  
  noise: (freq, type) => {
    // reuse a noise we muted before
    const noise = SoundMachine.noises.find(n => {
      return n.env.gain.value === 0.0 &&
        n.osc.type === type
    })
    if (! noise) {
      // create new noise
      return SoundMachine.makeSomeNoise(freq, type)
    }
    const { osc, env } = noise
    osc.frequency.setValueAtTime(freq, 0)
    // chromium issue 645776
    // osc.frequency.value = freq
    env.gain.value = 1.0
    return noise
  }
  
}

class Noise {
  constructor(x,y,type) {
    this.element=draw("path",{
      "d":"",
      "style": `stroke:${typeColors[type]};stroke-width:4;fill:none;`
    })
    this.coords = []
    this.type = type
    if (x) {
      if (typeof x === "object") {
        this.add(x)
      } else {
        if (isFinite(x) && y && isFinite(y)) this.add(x, y)  
      }
    }
    svg.appendChild(this.element)
    this.render()
  }
  
  add(x, y, quiet) {
    this.lastX = x
    this.lastY = y
    const { relX, relY } = typeof x === "object" ? x : relPos(x, y)
    if (this.coords.length > 0) {
      const lastCoord = this.coords[this.coords.length - 1]
      const firstCoord = this.coords[0]
      if (distance([relX, relY], lastCoord) < 5) {
        return
      }
      if (firstCoord[0] < relX) {
        this.coords = this.coords.filter(c => c[0] < relX)  
      } else {
        this.coords = this.coords.filter(c => c[0] > relX)
      }
    }
    this.coords.push([relX, relY])
    if (relX > borders.r) borders.r+=borderExtend
    if (relX < borders.l) borders.l-=borderExtend
    this.render()
    if (quiet) {
      return
    }
    if (! this.noise) {
      this.noise = SoundMachine.noise(freq(relY), this.type)
    }
    if (this.type !== "noise") {
      this.noise.osc.frequency.value = freq(relY)  
    } else {
      this.noise.osc.playbackRate.value = freq(relY) / 1e4
    }
    
  }
  
  playAtX(x) {
    const { coords } = this
    const l = coords.length
    if (l < 2) {
      return
    }
    const isMuted = coords[0][0] > x || coords[l - 1][0] < x
    if (isMuted) {
      if (this.playerNoise) {
        this.playerNoise.env.gain.value=0.0
        this.playerNoise = null
      }
    } else {
      const nearPoints = coords.filter((p) => Math.abs(p[0] - x) <= 5)
      const averageFreq = freq(nearPoints.map(p => p[1]).avg())
      if(!isFinite(averageFreq)) {
        return
      }
      if (!this.playerNoise) {
        this.playerNoise = SoundMachine.noise(averageFreq, this.type)
      } else {
        if (this.type !== "noise") {
          this.playerNoise.osc.frequency.setValueAtTime(averageFreq, 0)
          // https://bugs.chromium.org/p/chromium/issues/detail?id=645776
          // this.playerNoise.osc.frequency.value = averageFreq
          
        } else {
          this.playerNoise.osc.playbackRate.value = averageFreq / 1e4
        }
      }
    }
  }
  
  mute() {
    if (this.noise) {
      this.noise.env.gain.value=0.0
      this.noise = null
    }
    if (this.playerNoise) {
      this.playerNoise.env.gain.value=0.0
      this.playerNoise = null
    }
  }
  
  dispose() {
    this.mute()
    svg.removeChild(this.element)
    this.element = null
  }
  
  sortCoords() {
    this.coords.sort((a,b) => {
      if (a[0] > b[0]) return 1
      if (a[0] < b[0]) return -1
      if (a[0] == b[0]) return 0
    })
    this.render()
  }
  
  render() {
    const { coords } = this
    if (coords.length < 2) {
      return
    }
    this.element.setAttribute("d", "M"+coords[0].join(",")+
      "L"+coords.slice(1).map(c=> c.join(",")).join("L")) 
  }
  
  static fromPath(el) {
    const waveForms = Object.keys(typeColors).reduce((obj,key) => {
      obj[typeColors[key]] = key
      return obj
    },{})
    const color = hexColor(el.style.stroke)
    const d = el.getAttribute("d")
    if (waveForms[color] && /M\d+\,\d+(L\d+\,\d+)+/.test(d)) {
      const n = new Noise(null, null, waveForms[color] || "sine")
      const coords = d.slice(1).split("L").map(p => p.split(',').map(x => x|0))
      coords.forEach(c => n.add({relX: c[0], relY: c[1]}, null, true))
      return n
    }
  }  
}

const moveStart = (e) => {
  moveMode = {
    moving: true,
    x0: e.clientX,
    y0: e.clientY,
    scrollX0: scrollX,
    scrollY0: scrollY
  }
}

const moveDrag = (e) => {
  if (!moveMode.moving) {
    return
  }
  const { x0, y0, scrollX0, scrollY0 } = moveMode
  const dx = x0 - e.clientX
  const dy = y0 - e.clientY 
  scrollX = scrollX0 + dx
  scrollY = scrollY0 + dy
  setViewBox()
}

const moveEnd = (e) => {
  moveMode = { moving: false }
}

const setMoveMode = (move, e) => {
  const btn = $('#moveBtn')
  if (move) {
    moveMode = e? {
      moving: true,
      x0: e.clientX,
      y0: e.clientY,
      scrollX0: scrollX,
      scrollY0: scrollY
    } : { moving: false }
    btn.classList.add("selected")
    svg.classList.add("move")
  } else {
    moveMode = null
    btn.classList.remove("selected")
    svg.classList.remove("move")
  }
}

$('#moveBtn').addEventListener("click", e => {
  setMoveMode(!!!moveMode)
  // "multiple exclamation marks", he went on,
  //  shaking his head, "are a sure sign of
  //  a diseased mind." 
  // (Terry Pratchet in 'Eric') ♥
})


svg.addEventListener("mousedown", e => {
  if (touchNoises.length > 0) {
    // long tap on mobile
    // triggers contextmenu. 
    // Additionally: mousedown
    // without a mouseup event.
    // this would result in a never-ending
    // beeeeeeeep on mobile
    return;
  }
  if (e.button === 1) {
    const { relX, relY } = relPos(e.clientX, e.clientY)
    setCursor(relX)
    e.preventDefault()
    return
  }
  if (!isDebug && e.button === 2) {
    setMoveMode(true, e)
    return
  }
  if (mouseNoise) {
    mouseNoise.dispose()
    mouseNoise = null
  }
  if (moveMode) {
    moveStart(e)
    return
  }
  mouseNoise = new Noise(e.clientX, e.clientY, currentType)
})

svg.addEventListener("mousemove", e => {
  if (moveMode) {
    moveDrag(e)
    return
  }
  if (mouseNoise) {
    mouseNoise.add(e.clientX, e.clientY)
  }
})

svg.addEventListener("mouseup", e => {
  if (moveMode) {
    moveEnd(e)
    if (e.button === 2) {
      setMoveMode(false)
    }
    return
  }
  if (mouseNoise) {
    mouseNoise.mute()
    mouseNoise.sortCoords()
    music.push(mouseNoise)
    mouseNoise = null
  }
})

svg.addEventListener("touchstart", e => {
  if (moveMode) {
    setMoveMode(true, e.changedTouches[0])
    return
  }
  Array.prototype.slice.call(e.changedTouches).map(t => {
    touchNoises.push({
      id: t.identifier,
      noise: new Noise(t.clientX, t.clientY, currentType)
    })
  })  
})

const touch = (id) => touchNoises.find(el => el.id === id)

svg.addEventListener("touchmove", e => {
  e.preventDefault()
  if (moveMode) {
    moveDrag(e.changedTouches[0])
    return
  }
  Array.prototype.slice.call(e.changedTouches).map(t => {
    const touchObj = touch(t.identifier)
    if (touchObj) {
      touchObj.noise.add(t.clientX, t.clientY)
    }
  })
})

svg.addEventListener("touchend", e => {
  if (moveMode) {
    moveEnd(e)
    return
  }
  Array.prototype.slice.call(e.changedTouches).map((t, idx) => {
    const touchObj = touch(t.identifier)
    if (touchObj) {
      // touchObj.identifier = void 0
      touchObj.noise.mute()
      touchObj.noise.sortCoords()
      music.push(touchObj.noise)
      touchObj.noise = null
    }
  })
  touchNoises = touchNoises.filter(n => n.noise !== null)
})

const setViewBox = () => {
  clientRect = svg.getBoundingClientRect()
  w = max(0, innerWidth - clientRect.left)
  h = max(0, innerHeight - clientRect.top)
  const bounds = $`#bounds`
  const x0 = scrollX - scrollX % (borderExtend/8)
  const y0 = scrollY - scrollY % (borderExtend/8)
  const nX = 2 + ((8*w / borderExtend)|0)
  const nY = 2 + ((8*h / borderExtend)|0)
  const gridLines = Array(nX).fill(0).map((e,i) => {
    return `M${x0+i*borderExtend/8},${scrollY}l0,${h}`
  }).join('') + Array(nY).fill(0).map((e,i) => {
    return `M${scrollX},${y0+i*borderExtend/8}l${w},0`
  })
  bounds.setAttribute("d", `M${borders.l},${scrollY}l0,${h}`
                          +`M${borders.r},${scrollY}l0,${h}`)
  const cursor = $`#cursor`
  cursor.setAttribute("d", `M${cursorX},${scrollY}l0,${h}`)
  svg.setAttribute("viewBox", [scrollX, scrollY, w, h])
  const grid = $`#grid`
  grid.setAttribute("d", gridLines)
}
setViewBox()
addEventListener("resize", setViewBox)

addEventListener("contextmenu", e => {
  // prevent long-tap on touch screens 
  // to trigger the context menu event.
  // Also prevent the context menu when 
  // not in debug-mode because it is
  // used for moving the svg
  if (!isDebug || touchNoises.length > 0) {
    e.preventDefault()
    return false
  }
})

const rewind = () => {
  scrollX = borders.l 
  cursorX = borders.l
  setViewBox()
}

const play = () => {
  playing = true
  scrollX = 0
  $('#playBtn').parentNode.classList.add('hidden')
  $('#pauseBtn').parentNode.classList.remove('hidden')
}

const pause = () => {
  playing = false
  music.forEach(beep => beep.mute())
  $('#pauseBtn').parentNode.classList.add('hidden')
  $('#playBtn').parentNode.classList.remove('hidden')
}

$`#rewBtn`.addEventListener("click", rewind)
$`#playBtn`.addEventListener("click", play)
$`#pauseBtn`.addEventListener("click", pause)

const waveBtns = $$('a[role=type]')
waveBtns.map(btn => btn.addEventListener("click", (e) => {
  waveBtns.map(btn => btn.parentNode.classList.add("hidden"))
  let a = e.target
  while (a.nodeName.toLowerCase() !== 'a') {
    a = a.parentNode
  }
  const idx = waveBtns.indexOf(a)
  const nextA = waveBtns[(idx+1) % waveBtns.length]
  currentType = nextA.getAttribute("href").slice(1)
  nextA.parentNode.classList.remove("hidden")
  setMoveMode(false)
}))

const shakeEvent = new Shake()
shakeEvent.start()

const clearScr = () => {
  pause()
  const tmp = music.splice(0, music.length)
  tmp.forEach(beep => beep.dispose())
  rewind()
  scrollY = 0
  borders.l = 0
  borders.r = borderExtend
  setViewBox()
}

window.addEventListener('shake', clearScr)
$('#clrBtn').addEventListener('click', clearScr)
window.addEventListener('orientationchange', () => {
  touchNoises.splice(0,music.length).forEach(beep => beep.dispose())
})

window.addEventListener('blur', () => {
  if (masterVolume) masterVolume.gain.value = 0.0
})

window.addEventListener('focus', () => {
  if (masterVolume) masterVolume.gain.value = 0.5
}) 

const getSurroundingViewBox = () => {
  let t = Infinity, l = borders.l
  let b = -Infinity, r = borders.r
  music.forEach(m => m.coords.forEach(p => {
    t = min(t, p[1])
    b = max(b, p[1])
  }))
  if (!isFinite(t)) t = 0
  if (!isFinite(b)) b = innerHeight
  return `${t} ${l} ${b-t+1} ${r-l+1}`
}

$`#dlBtn`.addEventListener('click', () => {
  const anchor = document.createElement("a")
  anchor.setAttribute("download", "awesome-music.svg")
  const viewBox = getSurroundingViewBox()
  const code = `<?xml version="1.0" encoding="utf-8" standalone="no"?>\n`+
        `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" \n` +
        ` "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="${viewBox}">\n${music.map(m => m.element.outerHTML).join("\n")}\n</svg>`
  anchor.setAttribute("href", "data:application/octet-stream;base64,"+btoa(code))
  anchor.click()
})

$`#ulBtn`.addEventListener('click',() => {
  if (music.length > 0) {
    if (!confirm('Discard your current music ?')) return
    clearScr()
  }
  $`#inputFile`.click()
})

$`#inputFile`.addEventListener('change', (e) => {
  const file = $`#inputFile`.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    let code = reader.result.replace(/\<\?xml.+\?\>|\<\!DOCTYPE.+]\>/ig, '').trim()
    if (!code.slice(4) === "<svg") {
      return
    }
    const container = document.createElement("div")
    container.innerHTML = code
    const innerSVG = $$('svg', container)[0]
    $$("path", innerSVG).forEach(p => {
      const n = Noise.fromPath(p)
      if (n) music.push(n)
    })
    $`#inputFile`.value=""
    setViewBox()
  }
  reader.readAsText(file)
})

WebMidi.enable(function(err) {
  if (err) {
    console.log("No midi. Too bad :(")
  }
  WebMidi.inputs.forEach(input => {
    input.addListener('noteon', 'all', e => {
      const noteName = e.note.name + e.note.octave
      const f = noteToFreq(e.note.name, e.note.octave)
      const y = freqToY(f)
      if (!midiNoises[noteName]) {
        midiNoises[noteName] = new Noise({relX: cursorX, relY: y}, null, currentType)
        midiNoises[noteName].add({relX: cursorX + 5, relY: y}, null)
        scrollToCursor()
      }
    })
    input.addListener('noteoff', 'all', e => {
      const noteName = e.note.name + e.note.octave
      const f = noteToFreq(e.note.name, e.note.octave)
      const y = freqToY(f)
      if (midiNoises[noteName]) {
        midiNoises[noteName].coords[1][0] = cursorX
        music.push(midiNoises[noteName])
        midiNoises[noteName].mute()
        delete midiNoises[noteName]
        scrollToCursor()
      }
    })
  })  
})

const keyboardMappings = () => {
  const lang = navigator.language.slice(0,2)
  const mappings = {
    "de": "ysxdcvgbhnjmq2w3er5t6z7u",
    "en": "zsxdcvgbhnjmq2w3er5t6y7u",
    "fr": "wsxdcvgbhnj,a2z3er5t6y7u",
  }
  return mappings[lang]||mappings.en
}

window.addEventListener("keydown", (e) => {
  const mappings = keyboardMappings()
  console.log(e.key)
  const i = mappings.indexOf(e.key)
  if (i > -1) {
    const note = notes[i % 12]
    const oct  = 1 + (i / 12)|0
    const noteName = "_" + note + oct

    const f = noteToFreq(note, oct)
    const y = freqToY(f)
    if (!midiNoises[noteName]) {
      midiNoises[noteName] = new Noise({relX: cursorX, relY: y}, null, currentType)
      midiNoises[noteName].add({relX: cursorX + 5, relY: y}, null)
      scrollToCursor()
    }
  }
})

window.addEventListener("keyup", (e) => {
  const mappings = keyboardMappings()
  const i = mappings.indexOf(e.key)
  if (i > -1) {
    const note = notes[i % 12]
    const oct  = 1 + (i / 12)|0
    const noteName = "_" + note + oct
    if (midiNoises[noteName]) {
      midiNoises[noteName].coords[1][0] = cursorX
      music.push(midiNoises[noteName])
      midiNoises[noteName].mute()
      delete midiNoises[noteName]
      scrollToCursor()
    }
  }  
})

~function loop() {
  const midiKeys = Object.keys(midiNoises)
  if (playing || midiKeys.length > 0) {
    cursorX+=2
    if (midiKeys.length > 0 && cursorX > borders.r) {
      borders.r += borderExtend
    }
    midiKeys.forEach(k => {
      let n = midiNoises[k]
      if (n.coords.length == 2) {
        n.coords[1][0] = cursorX
        n.render()
      }
    })
    scrollToCursor()
    setViewBox()
  }
  if (playing) {
    if (cursorX > borders.r && (!userIsJamming())) setCursor(borders.l)
    music.forEach(beep => beep.playAtX(cursorX))
  }
  if (touchNoises.length > 0 || mouseNoise) {
    if (!playing) scrollX+=3
    if (mouseNoise) {
      mouseNoise.add(mouseNoise.lastX, mouseNoise.lastY)
    }
    touchNoises.forEach(n => n.noise.add(n.noise.lastX,n.noise.lastY))
    setViewBox()
  }
  requestAnimationFrame(loop)
}(0)