// your code goes here
    let input = '';
    let terminalOpen = false;
    let ctrlPressed = false;
    let shiftPressed = false;
    
    const display = document.getElementById('display');
    const terminal = document.getElementById('terminal');
    const ctrlKey = document.getElementById('ctrlKey');
    const shiftKey = document.getElementById('shiftKey');
    
    const moneyEmojis = ['💰', '💵', '💴', '💶', '💷', '💸', '🤑', '💲', '🪙'];

    function updateDisplay() {
      display.textContent = input;
    }

    function openTerminal() {
      if (!terminalOpen) {
        terminalOpen = true;
        terminal.classList.add('active');
        input = '';
        updateDisplay();
      }
    }

    function spawnMoney() {
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const emoji = document.createElement('div');
          emoji.className = 'money-emoji';
          emoji.textContent = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];
          emoji.style.left = Math.random() * 100 + '%';
          emoji.style.top = -50 + 'px';
          emoji.style.animationDuration = (1.5 + Math.random()) + 's';
          document.body.appendChild(emoji);
          
          setTimeout(() => emoji.remove(), 2500);
        }, i * 100);
      }
    }

    function checkMotherlode() {
      if (input.toUpperCase() === 'MOTHERLODE') {
        spawnMoney();
        input = '';
        updateDisplay();
      }
    }

    function handleKey(key) {
      if (!terminalOpen) return;
      
      if (key === 'Backspace') {
        input = input.slice(0, -1);
      } else if (key === 'Enter') {
        checkMotherlode();
      } else if (key === ' ') {
        input += ' ';
      } else if (key === 'Control' || key === 'Shift') {
        return;
      } else if (key.length === 1) {
        input += key.toUpperCase();
      }
      updateDisplay();
    }

    document.querySelectorAll('kbd').forEach(key => {
      key.addEventListener('click', () => {
        const keyValue = key.getAttribute('data-key');
        
        if (keyValue === 'Control') {
          ctrlPressed = !ctrlPressed;
          key.classList.toggle('pressed', ctrlPressed);
          return;
        }
        
        if (keyValue === 'Shift') {
          shiftPressed = !shiftPressed;
          key.classList.toggle('pressed', shiftPressed);
          return;
        }
        
        if (ctrlPressed && shiftPressed && keyValue === 'C') {
          openTerminal();
          ctrlPressed = false;
          shiftPressed = false;
          ctrlKey.classList.remove('pressed');
          shiftKey.classList.remove('pressed');
        }
        
        handleKey(keyValue);
        key.classList.add('pressed');
        setTimeout(() => {
          if (keyValue !== 'Control' && keyValue !== 'Shift') {
            key.classList.remove('pressed');
          }
        }, 150);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Control') {
        ctrlPressed = true;
        ctrlKey.classList.add('pressed');
      }
      if (e.key === 'Shift') {
        shiftPressed = true;
        shiftKey.classList.add('pressed');
      }
      
      if (ctrlPressed && shiftPressed && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        openTerminal();
        return;
      }
      
      if (!terminalOpen) return;
      
      const key = e.key;
      if (key === 'Backspace' || key === 'Enter' || key === ' ' || /^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        handleKey(key);
        
        const kbd = document.querySelector(`kbd[data-key="${key.toUpperCase()}"]`) ||
                    document.querySelector(`kbd[data-key="${key}"]`);
        if (kbd) {
          kbd.classList.add('pressed');
          setTimeout(() => kbd.classList.remove('pressed'), 150);
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        ctrlPressed = false;
        ctrlKey.classList.remove('pressed');
      }
      if (e.key === 'Shift') {
        shiftPressed = false;
        shiftKey.classList.remove('pressed');
      }
    });