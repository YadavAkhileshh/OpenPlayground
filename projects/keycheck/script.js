        (function() {
            // ----- STATE -----
            // pressed keys set (stores event.code for uniqueness)
            const pressedSet = new Set();
            // mapping from code to visual representation (key attribute)
            const keyElements = document.querySelectorAll('.key');
            const pressedBubblesDiv = document.getElementById('pressedBubbles');
            const keyCountSpan = document.getElementById('keyCount');
            const lastKeySpan = document.getElementById('lastKey');
            const resetBtn = document.getElementById('resetBtn');

            // helper to update UI (highlight keys and bubble list)
            function updateUI() {
                // 1. reset all highlights
                keyElements.forEach(el => el.classList.remove('pressed'));

                // 2. highlight keys that are in pressedSet by matching data-key attribute
                pressedSet.forEach(code => {
                    // try to match by data-key (exact code)
                    let matched = false;
                    keyElements.forEach(el => {
                        const dataKey = el.getAttribute('data-key');
                        if (dataKey && dataKey === code) {
                            el.classList.add('pressed');
                            matched = true;
                        }
                    });
                    // optional: handle special cases (space, enter etc already covered)
                });

                // 3. update bubble list
                const codesArray = Array.from(pressedSet).sort();
                if (codesArray.length === 0) {
                    pressedBubblesDiv.innerHTML = '<div class="empty-state">— no keys pressed —</div>';
                } else {
                    let html = '';
                    codesArray.forEach(code => {
                        // get nice display name (remove 'Key', 'Digit' etc)
                        let display = code;
                        if (code.startsWith('Key')) display = code.slice(3);
                        else if (code.startsWith('Digit')) display = code.slice(5);
                        else if (code === 'Space') display = '␣ Space';
                        else if (code === 'Enter') display = '⏎ Enter';
                        else if (code === 'Backspace') display = '⌫ Backspace';
                        else if (code === 'Tab') display = 'Tab';
                        else if (code.includes('Shift')) display = '⇧ Shift';
                        else if (code.includes('Control')) display = 'Ctrl';
                        else if (code.includes('Alt')) display = 'Alt';
                        else if (code.includes('Meta')) display = '⊞ Win';
                        else if (code === 'CapsLock') display = 'Caps';
                        else if (code === 'ContextMenu') display = '≣ Menu';
                        
                        html += `<div class="bubble"><span>${display}</span> <span class="code">${code}</span></div>`;
                    });
                    pressedBubblesDiv.innerHTML = html;
                }

                // 4. update counters
                keyCountSpan.innerText = pressedSet.size;
            }

            // add a key (by code)
            function addKey(code) {
                pressedSet.add(code);
                // update last key
                lastKeySpan.innerText = code;
                updateUI();
            }

            // remove a key
            function removeKey(code) {
                pressedSet.delete(code);
                updateUI();
            }

            // reset all
            function resetAll() {
                pressedSet.clear();
                lastKeySpan.innerText = '—';
                updateUI();
            }

            // ---- EVENT LISTENERS (real keyboard) ----
            window.addEventListener('keydown', (e) => {
                e.preventDefault(); // avoid triggering browser shortcuts, but keep it friendly
                const code = e.code;
                if (!pressedSet.has(code)) {
                    addKey(code);
                }
            });

            window.addEventListener('keyup', (e) => {
                const code = e.code;
                if (pressedSet.has(code)) {
                    removeKey(code);
                }
            });

            // handle window blur (if user switches tab, release all keys)
            window.addEventListener('blur', () => {
                resetAll();
            });

            // ---- SIMULATED KEY CLICKS (click on visual key) ----
            keyElements.forEach(el => {
                el.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const dataKey = el.getAttribute('data-key');
                    if (dataKey) {
                        // simulate press (add to set)
                        if (!pressedSet.has(dataKey)) {
                            addKey(dataKey);
                        }
                    }
                });
                el.addEventListener('mouseup', () => {
                    // we don't know which key to release on mouseup (could be many). better use mouseleave?
                });
                el.addEventListener('mouseleave', () => {
                    // optional: we could release the specific key, but for simplicity we keep pressed until real keyup
                });
            });

            // also handle mouseup anywhere to release? not accurate. We'll rely on keyup.
            // but we can add a "release all" on clicking reset.

            resetBtn.addEventListener('click', resetAll);

            // prevent context menu on keys
            document.querySelectorAll('.key').forEach(el => {
                el.addEventListener('contextmenu', (e) => e.preventDefault());
            });

            // initial update
            updateUI();
        })();