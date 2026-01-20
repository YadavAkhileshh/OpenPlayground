// ==========================================
// EASING FUNCTIONS
// ==========================================
const Easing = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => t * (2 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  elastic: t => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },
  bounce: t => {
    if (t < 1/2.75) return 7.5625 * t * t;
    if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
    if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
  },
  overshoot: t => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  }
};

// ==========================================
// ANIMATION ENGINE
// ==========================================
class Engine {
  constructor() {
    this.animations = [];
    this.running = false;
    this.paused = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.timeScale = 1;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTime = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.loop();
    console.log('Engine started');
  }

  pause() {
    this.paused = true;
    console.log('Engine paused');
  }

  resume() {
    if (!this.running) {
      this.start();
      return;
    }
    this.paused = false;
    this.lastTime = performance.now();
    console.log('Engine resumed');
  }

  loop() {
    if (!this.running) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.deltaTime = this.paused ? 0 : delta * this.timeScale;
    this.lastTime = now;

    // FPS calculation
    this.frameCount++;
    if (now - this.fpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    if (!this.paused) {
      this.update(this.deltaTime);
    }

    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      
      if (anim.delay > 0) {
        anim.delay -= dt;
        continue;
      }

      anim.elapsed += dt;
      const progress = Math.min(anim.elapsed / anim.duration, 1);
      const eased = anim.easing(progress);
      const value = anim.from + (anim.to - anim.from) * eased;

      this.apply(anim.target, anim.property, value);

      if (anim.onUpdate) {
        anim.onUpdate(value, progress);
      }

      if (progress >= 1) {
        if (anim.onComplete) {
          anim.onComplete();
        }

        if (anim.loop) {
          anim.elapsed = 0;
          if (anim.yoyo) {
            [anim.from, anim.to] = [anim.to, anim.from];
          }
        } else {
          this.animations.splice(i, 1);
        }
      }
    }
  }

  apply(target, property, value) {
    if (!target) return;

    const transforms = ['translateX', 'translateY', 'rotate', 'scale'];
    
    if (transforms.includes(property)) {
      if (!target._t) {
        target._t = { translateX: 0, translateY: 0, rotate: 0, scale: 1 };
      }
      target._t[property] = value;
      
      const t = target._t;
      target.style.transform = `translate(${t.translateX}px, ${t.translateY}px) rotate(${t.rotate}deg) scale(${t.scale})`;
    } else if (property === 'opacity') {
      target.style.opacity = value;
    } else {
      target.style[property] = value + 'px';
    }
  }

  animate(config) {
    const anim = {
      target: config.target,
      property: config.property,
      from: config.from !== undefined ? config.from : this.getValue(config.target, config.property),
      to: config.to,
      duration: config.duration || 1000,
      delay: config.delay || 0,
      easing: config.easing || Easing.linear,
      elapsed: 0,
      loop: config.loop || false,
      yoyo: config.yoyo || false,
      onUpdate: config.onUpdate,
      onComplete: config.onComplete
    };

    this.animations.push(anim);
    console.log('Animation added:', config.property);
    return anim;
  }

  getValue(target, property) {
    if (!target) return 0;
    if (target._t && target._t[property] !== undefined) {
      return target._t[property];
    }
    return 0;
  }

  clear(target = null) {
    if (target) {
      this.animations = this.animations.filter(a => a.target !== target);
    } else {
      this.animations = [];
    }
  }
}

// ==========================================
// GLOBAL ENGINE INSTANCE
// ==========================================
const engine = new Engine();

// Get elements
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');
const box3 = document.getElementById('box3');
const box4 = document.getElementById('box4');
const boxes = [box1, box2, box3, box4];

const debugEl = document.getElementById('debug');
let debugActive = false;
let debugInterval = null;

// Auto-start engine
engine.start();

// ==========================================
// CONTROL FUNCTIONS
// ==========================================
function startEngine() {
  engine.start();
  console.log('Engine started!');
}

function pauseEngine() {
  engine.pause();
  updateStatusDisplay(true);
  console.log('Engine paused!');
}

function resumeEngine() {
  engine.resume();
  updateStatusDisplay(false);
  console.log('Engine resumed!');
}

function resetAll() {
  engine.clear();
  boxes.forEach(box => {
    box.style.transform = '';
    box._t = null;
  });
  console.log('Reset complete!');
}

function updateSpeed(value) {
  engine.timeScale = parseFloat(value);
  document.getElementById('speedDisplay').textContent = value + 'x';
  document.getElementById('scaleDisplay').textContent = value + 'x';
}

function updateStatusDisplay(paused) {
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  
  if (paused) {
    statusText.textContent = 'PAUSED';
    statusText.classList.add('paused');
    statusDot.classList.add('paused');
  } else {
    statusText.textContent = 'RUNNING';
    statusText.classList.remove('paused');
    statusDot.classList.remove('paused');
  }
}

// Update live stats in status bar
setInterval(() => {
  if (engine.running) {
    document.getElementById('fpsDisplay').textContent = engine.fps;
    document.getElementById('animDisplay').textContent = engine.animations.length;
    document.getElementById('deltaDisplay').textContent = engine.deltaTime.toFixed(0) + 'ms';
  }
}, 100);

function toggleDebug() {
  debugActive = !debugActive;
  debugEl.classList.toggle('active', debugActive);
  
  if (debugActive) {
    debugInterval = setInterval(updateDebugInfo, 100);
  } else {
    clearInterval(debugInterval);
  }
}

function updateDebugInfo() {
  document.getElementById('fps').textContent = engine.fps;
  document.getElementById('delta').textContent = engine.deltaTime.toFixed(2);
  document.getElementById('animCount').textContent = engine.animations.length;
  document.getElementById('status').textContent = engine.paused ? 'PAUSED' : 'RUNNING';
}

// ==========================================
// DEMO FUNCTIONS
// ==========================================
function demoWave() {
  engine.clear();
  boxes.forEach((box, i) => {
    engine.animate({
      target: box,
      property: 'translateY',
      from: 0,
      to: -60,
      duration: 800,
      delay: i * 150,
      easing: Easing.easeInOut,
      loop: true,
      yoyo: true
    });
  });
  console.log('Wave demo started');
}

function demoBounce() {
  engine.clear();
  boxes.forEach((box, i) => {
    engine.animate({
      target: box,
      property: 'translateY',
      from: 0,
      to: -80,
      duration: 600,
      delay: i * 100,
      easing: Easing.bounce,
      loop: true,
      yoyo: true
    });
  });
  console.log('Bounce demo started');
}

function demoRotate() {
  engine.clear();
  boxes.forEach((box, i) => {
    engine.animate({
      target: box,
      property: 'rotate',
      from: 0,
      to: 360,
      duration: 2000,
      delay: i * 200,
      easing: Easing.easeInOut,
      loop: true
    });
  });
  console.log('Rotate demo started');
}

function demoChaos() {
  engine.clear();
  
  boxes.forEach(box => {
    const chaos = () => {
      engine.animate({
        target: box,
        property: 'translateX',
        to: (Math.random() - 0.5) * 150,
        duration: 500 + Math.random() * 500,
        easing: Easing.easeInOut
      });
      
      engine.animate({
        target: box,
        property: 'translateY',
        to: (Math.random() - 0.5) * 150,
        duration: 500 + Math.random() * 500,
        easing: Easing.easeInOut
      });

      engine.animate({
        target: box,
        property: 'rotate',
        to: (Math.random() - 0.5) * 360,
        duration: 500 + Math.random() * 500,
        easing: Easing.easeInOut,
        onComplete: chaos
      });
    };
    chaos();
  });
  console.log('Chaos demo started');
}

function demoScale() {
  engine.clear();
  boxes.forEach((box, i) => {
    engine.animate({
      target: box,
      property: 'scale',
      from: 1,
      to: 1.5,
      duration: 600,
      delay: i * 120,
      easing: Easing.elastic,
      loop: true,
      yoyo: true
    });
  });
  console.log('Scale demo started');
}

// ==========================================
// BOX INTERACTIONS
// ==========================================
boxes.forEach(box => {
  // Touch and mouse tap handlers
  const handleTap = function(e) {
    e.preventDefault();
    engine.animate({
      target: this,
      property: 'rotate',
      from: 0,
      to: 360,
      duration: 500,
      easing: Easing.easeInOut
    });

    engine.animate({
      target: this,
      property: 'scale',
      from: 1,
      to: 1.3,
      duration: 250,
      easing: Easing.easeOut,
      yoyo: true
    });
  };

  // Hover effects
  const handleHoverIn = function() {
    engine.animate({
      target: this,
      property: 'scale',
      to: 1.1,
      duration: 200,
      easing: Easing.easeOut
    });
  };

  const handleHoverOut = function() {
    engine.animate({
      target: this,
      property: 'scale',
      to: 1,
      duration: 200,
      easing: Easing.easeOut
    });
  };

  // Mouse events
  box.addEventListener('click', function(e) {
    handleTap.call(this, e);
  });

  box.addEventListener('mouseenter', handleHoverIn);
  box.addEventListener('mouseleave', handleHoverOut);

  // Touch events for mobile
  box.addEventListener('touchstart', function(e) {
    handleTap.call(this, e);
    handleHoverIn.call(this);
  });

  box.addEventListener('touchend', handleHoverOut);
  box.addEventListener('touchcancel', handleHoverOut);
  
  // Prevent context menu on touch devices
  box.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
});

console.log('Animation engine initialized!');
console.log('Try clicking the demo buttons or interacting with the boxes!');