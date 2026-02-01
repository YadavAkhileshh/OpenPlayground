// color themes
var bodyStyles = document.body.style;

// keys
let keyboardElement = document.getElementsByClassName('keyboard');
let keys = document.querySelectorAll('kbd');

// audio 
let keyAudio = document.getElementById('keyAudio');

// theme buttons
let buttons = document.querySelectorAll('button');

// learn more
let info = document.getElementById('info');
let notes = document.getElementsByClassName('notes')[0];


// toggle class on a lock key element
function toggleLockClass(element, name) {
    element.classList.toggle('on');
};

// toggle function for caps, num, and scroll lock keys
function toggleKey(code) {
    var el;
    // detect el based on keyCode
    switch (code) {
        case '20':
            el = document.getElementById('clk');
            toggleLockClass(el, 'caps-lock');
            break;
        case '123':
            keyboardElement[0].classList.toggle('light-off');
            break;
        case '144':
            el = document.getElementById('nlk');
            toggleLockClass(el, 'num-lock');
            break;
        case '145':
            el = document.getElementById('slk');
            toggleLockClass(el, 'scroll-lock');
            break;
        default:
            keyAudio.currentTime = 0;
            keyAudio.play();
            break;
    }
};

// on screen keyboard keypress event
function keyPress(e) {
    let keyAttribute = e.target.dataset.key;
    if (e.target.localName === 'i' || e.target.localName === 'span') {
        // get data-key of kbd which is a parent of <i>
        keyAttribute = e.target.parentNode.dataset.key;
    }
    toggleKey(keyAttribute);
};

// virtual keyboard key event
keys.forEach(key => key.addEventListener('click', keyPress));

// color themes button events
let defaultElement = document.getElementById('t-0');
let themeOneElement = document.getElementById('t-1');
let themeTwoElement = document.getElementById('t-2');
let themeThreeElement = document.getElementById('t-3');
let themeFourElement = document.getElementById('t-4');

let customeElement = document.getElementById('c-t');
let customToggle = false;


function applyTheme(c1, c2, c3, c4, name) {
    // remove f12 light-off if present when a theme is about to apply
    if (keyboardElement[0].classList.contains('light-off')) {
        keyboardElement[0].classList.remove('light-off');
    }
  
    bodyStyles.setProperty('--keyboard-bg-color', c1);
    bodyStyles.setProperty('--key-bg-color', c2);
    bodyStyles.setProperty('--key-color', c3);
    bodyStyles.setProperty('--lock-on-color', c4);
}

function toggleCustomThemeContent() {
    customToggle = !customToggle;
    if (customToggle) {
        customeElement.style.display = 'block';
    } else {
        customeElement.style.display = 'none';
    }
}

function hideCustomTheme() {
    customToggle = true;
    toggleCustomThemeContent();
}

defaultElement.addEventListener('click', function() {
    applyTheme('#00c3b3', '#353535', '#f8f8f8', '#00AE94', 'default');
    hideCustomTheme();
});

themeOneElement.addEventListener('click', function() {
    applyTheme('#bbb', '#eee', '#808080', '#333', 'light');
    hideCustomTheme();
});

themeTwoElement.addEventListener('click', function() {
    applyTheme('rgba(0, 0, 0, 0.9)', '#353535', '#f8f8f8', '#008996', 'dark');
    hideCustomTheme();
});

themeThreeElement.addEventListener('click', function() {
    applyTheme('#D5BCA2', '#353535', '#f5f5f5', '#A46F5E', 'rose-gold');
    hideCustomTheme();
});

// custom theme
themeFourElement.addEventListener('click', function() {
    toggleCustomThemeContent();
});

// toggle key-press class on keys when real keyboard key is clicked
function toggleKeyPress(el) {
    if (el.classList.contains('key-press')) {
        el.classList.remove('key-press');
    } else {
        keys.forEach(key => key.classList.remove('key-press'));
        el.classList.add('key-press');
    }
}

// global window keydown event from real keyboard
window.addEventListener('keydown', function(e) {
    let codeName = e.code; // name of the key pressed
    let code = e.keyCode.toString();
    let keyElement = document.querySelector(`kbd[data-key="${code}"]`);
    toggleKey(code);
    toggleKeyPress(keyElement);
});

// info button
info.addEventListener('click', function() {
    notes.classList.toggle('show-notes');
});

// copyrights year
      const date = new Date();
      let yearElement = document.getElementById('year');
      yearElement.innerText = `- ${date.getFullYear()}`;


// color picker 
let kbc = document.getElementById('kbc');
      let keybc = document.getElementById('keybc');
      let kc = document.getElementById('kc');
      let lkc = document.getElementById('lkc');
      
const colorOptions = {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          hsva: true,
          input: true,
          clear: true,
          save: true
        },
};

// color picker
      const kbcPickr = Pickr.create({
        el: '#kbc',
        useAsButton: true,
        components: colorOptions,
        onSave(hsva, instance) {
          let color = hsva.toRGBA().toString();
          bodyStyles.setProperty('--keyboard-bg-color', color)
        },
      });

      const keybcPickr = Pickr.create({
        el: '#keybc',
        useAsButton: true,
        components: colorOptions,
        onSave(hsva, instance) {
          let color = hsva.toRGBA().toString();
          bodyStyles.setProperty('--key-bg-color', color)
        },
      });

      const kcPickr = Pickr.create({
        el: '#kc',
        useAsButton: true,
        components: colorOptions,
        onSave(hsva, instance) {
          let color = hsva.toRGBA().toString();
          bodyStyles.setProperty('--key-color', color)
        },
      });

      const lkcPickr = Pickr.create({
        el: '#lkc',
        useAsButton: true,
        components: colorOptions,
        onSave(hsva, instance) {
          let color = hsva.toRGBA().toString();
          bodyStyles.setProperty('--lock-on-color', color)
        },
      });