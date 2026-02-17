
        // Data structures
        let stack = [];
        let queue = [];
        const maxSize = 10;
        let currentStructure = 'stack'; // 'stack' or 'queue'
        let operationHistory = [];
        let animationSpeed = 5; // 1-10 scale
        
        // DOM elements
        const stackToggle = document.getElementById('stack-toggle');
        const queueToggle = document.getElementById('queue-toggle');
        const stackVisualization = document.getElementById('stack-visualization');
        const queueVisualization = document.getElementById('queue-visualization');
        const pushBtn = document.getElementById('push-btn');
        const popBtn = document.getElementById('pop-btn');
        const enqueueBtn = document.getElementById('enqueue-btn');
        const dequeueBtn = document.getElementById('dequeue-btn');
        const resetBtn = document.getElementById('reset-btn');
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        const explanationText = document.getElementById('explanation-text');
        const historyList = document.getElementById('history-list');
        const elementCount = document.getElementById('element-count');
        const structureType = document.getElementById('structure-type');
        const statusIndicator = document.getElementById('status-indicator');
        
        // Initialize the visualizer
        function initVisualizer() {
            updateVisualization();
            updateButtons();
            updateExplanation('Welcome! Select a structure and start performing operations to see how they work.');
            addHistory('Visualizer initialized');
            updateStatus();
        }
        
        // Toggle between stack and queue
        stackToggle.addEventListener('click', () => {
            if (currentStructure === 'queue') {
                currentStructure = 'stack';
                stackToggle.classList.add('active');
                queueToggle.classList.remove('active');
                stackVisualization.style.display = 'flex';
                queueVisualization.style.display = 'none';
                pushBtn.style.display = 'flex';
                popBtn.style.display = 'flex';
                enqueueBtn.style.display = 'none';
                dequeueBtn.style.display = 'none';
                structureType.textContent = 'Stack (Last In, First Out)';
                updateExplanation('Switched to Stack (LIFO). In a stack, the last element added is the first one to be removed.');
                addHistory('Switched to Stack visualization');
                updateStatus();
            }
        });
        
        queueToggle.addEventListener('click', () => {
            if (currentStructure === 'stack') {
                currentStructure = 'queue';
                queueToggle.classList.add('active');
                stackToggle.classList.remove('active');
                queueVisualization.style.display = 'flex';
                stackVisualization.style.display = 'none';
                enqueueBtn.style.display = 'flex';
                dequeueBtn.style.display = 'flex';
                pushBtn.style.display = 'none';
                popBtn.style.display = 'none';
                structureType.textContent = 'Queue (First In, First Out)';
                updateExplanation('Switched to Queue (FIFO). In a queue, the first element added is the first one to be removed.');
                addHistory('Switched to Queue visualization');
                updateStatus();
            }
        });
        
        // Operation buttons
        pushBtn.addEventListener('click', () => pushElement());
        popBtn.addEventListener('click', () => popElement());
        enqueueBtn.addEventListener('click', () => enqueueElement());
        dequeueBtn.addEventListener('click', () => dequeueElement());
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            stack = [];
            queue = [];
            operationHistory = [];
            updateVisualization();
            updateButtons();
            updateExplanation('Visualizer has been reset. Both Stack and Queue are now empty.');
            historyList.innerHTML = '';
            addHistory('Reset visualizer');
            updateStatus();
        });
        
        // Speed control
        speedSlider.addEventListener('input', () => {
            animationSpeed = parseInt(speedSlider.value);
            updateSpeedLabel();
        });
        
        function updateSpeedLabel() {
            if (animationSpeed <= 3) {
                speedValue.textContent = 'Slow';
            } else if (animationSpeed <= 7) {
                speedValue.textContent = 'Medium';
            } else {
                speedValue.textContent = 'Fast';
            }
        }
        
        // Stack operations
        function pushElement() {
            if (stack.length >= maxSize) {
                updateExplanation('Stack Overflow! Cannot push element because stack is full. Try popping some elements first.');
                setStatus('error', 'Stack Overflow - Stack is full');
                addHistory('Stack overflow attempt');
                return;
            }
            
            const newElement = Math.floor(Math.random() * 90) + 10; // Random number 10-99
            stack.push(newElement);
            
            updateExplanation(`Pushed element ${newElement} onto the stack. In LIFO (Last In, First Out) structure, this element is now at the TOP and will be the first one removed by a pop operation.`);
            addHistory(`Pushed ${newElement} to stack`);
            updateVisualization();
            updateButtons();
            updateStatus();
            
            // Animate the new element
            const elements = document.querySelectorAll('#stack-visualization .element');
            if (elements.length > 0) {
                const lastElement = elements[elements.length - 1];
                lastElement.classList.add('pulse');
                setTimeout(() => lastElement.classList.remove('pulse'), 500);
            }
        }
        
        function popElement() {
            if (stack.length === 0) {
                updateExplanation('Stack Underflow! Cannot pop element because stack is empty. Try pushing some elements first.');
                setStatus('error', 'Stack Underflow - Stack is empty');
                addHistory('Stack underflow attempt');
                return;
            }
            
            const poppedElement = stack.pop();
            
            updateExplanation(`Popped element ${poppedElement} from the stack. In LIFO structure, the TOP element (last one pushed) is always removed first.`);
            addHistory(`Popped ${poppedElement} from stack`);
            updateVisualization();
            updateButtons();
            updateStatus();
        }
        
        // Queue operations
        function enqueueElement() {
            if (queue.length >= maxSize) {
                updateExplanation('Queue Overflow! Cannot enqueue element because queue is full. Try dequeuing some elements first.');
                setStatus('error', 'Queue Overflow - Queue is full');
                addHistory('Queue overflow attempt');
                return;
            }
            
            const newElement = Math.floor(Math.random() * 90) + 10; // Random number 10-99
            queue.push(newElement);
            
            updateExplanation(`Enqueued element ${newElement} to the queue. In FIFO (First In, First Out) structure, this element is now at the REAR and will be removed after all elements ahead of it.`);
            addHistory(`Enqueued ${newElement} to queue`);
            updateVisualization();
            updateButtons();
            updateStatus();
            
            // Animate the new element
            const elements = document.querySelectorAll('#queue-visualization .element');
            if (elements.length > 0) {
                const lastElement = elements[elements.length - 1];
                lastElement.classList.add('pulse');
                setTimeout(() => lastElement.classList.remove('pulse'), 500);
            }
        }
        
        function dequeueElement() {
            if (queue.length === 0) {
                updateExplanation('Queue Underflow! Cannot dequeue element because queue is empty. Try enqueuing some elements first.');
                setStatus('error', 'Queue Underflow - Queue is empty');
                addHistory('Queue underflow attempt');
                return;
            }
            
            const dequeuedElement = queue.shift();
            
            updateExplanation(`Dequeued element ${dequeuedElement} from the queue. In FIFO structure, the FRONT element (first one enqueued) is always removed first.`);
            addHistory(`Dequeued ${dequeuedElement} from queue`);
            updateVisualization();
            updateButtons();
            updateStatus();
        }
        
        // Update visualization
        function updateVisualization() {
            if (currentStructure === 'stack') {
                updateStackVisualization();
                elementCount.textContent = stack.length;
            } else {
                updateQueueVisualization();
                elementCount.textContent = queue.length;
            }
        }
        
        function updateStackVisualization() {
            stackVisualization.innerHTML = '';
            
            // Add labels
            const topLabel = document.createElement('div');
            topLabel.className = 'element-label top-label';
            topLabel.textContent = 'TOP';
            stackVisualization.appendChild(topLabel);
            
            const bottomLabel = document.createElement('div');
            bottomLabel.className = 'element-label bottom-label';
            bottomLabel.textContent = 'BOTTOM';
            stackVisualization.appendChild(bottomLabel);
            
            // Add elements
            for (let i = stack.length - 1; i >= 0; i--) {
                const element = document.createElement('div');
                element.className = 'element slide-in';
                element.textContent = stack[i];
                element.style.animationDelay = `${(stack.length - 1 - i) * (100 / animationSpeed)}ms`;
                stackVisualization.appendChild(element);
            }
        }
        
        function updateQueueVisualization() {
            queueVisualization.innerHTML = '';
            
            // Add labels
            const frontLabel = document.createElement('div');
            frontLabel.className = 'element-label front-label';
            frontLabel.textContent = 'FRONT';
            queueVisualization.appendChild(frontLabel);
            
            const rearLabel = document.createElement('div');
            rearLabel.className = 'element-label rear-label';
            rearLabel.textContent = 'REAR';
            queueVisualization.appendChild(rearLabel);
            
            // Add elements
            for (let i = 0; i < queue.length; i++) {
                const element = document.createElement('div');
                element.className = 'element queue-element slide-in';
                element.textContent = queue[i];
                element.style.animationDelay = `${i * (100 / animationSpeed)}ms`;
                queueVisualization.appendChild(element);
            }
        }
        
        // Update button states
        function updateButtons() {
            if (currentStructure === 'stack') {
                popBtn.disabled = stack.length === 0;
                pushBtn.disabled = stack.length >= maxSize;
                
                if (popBtn.disabled) {
                    popBtn.classList.add('disabled-btn');
                } else {
                    popBtn.classList.remove('disabled-btn');
                }
                
                if (pushBtn.disabled) {
                    pushBtn.classList.add('disabled-btn');
                } else {
                    pushBtn.classList.remove('disabled-btn');
                }
            } else {
                dequeueBtn.disabled = queue.length === 0;
                enqueueBtn.disabled = queue.length >= maxSize;
                
                if (dequeueBtn.disabled) {
                    dequeueBtn.classList.add('disabled-btn');
                } else {
                    dequeueBtn.classList.remove('disabled-btn');
                }
                
                if (enqueueBtn.disabled) {
                    enqueueBtn.classList.add('disabled-btn');
                } else {
                    enqueueBtn.classList.remove('disabled-btn');
                }
            }
        }
        
        // Update explanation text
        function updateExplanation(text) {
            explanationText.textContent = text;
            explanationText.classList.add('pulse');
            setTimeout(() => explanationText.classList.remove('pulse'), 500);
        }
        
        // Add to history log
        function addHistory(operation) {
            const historyItem = document.createElement('li');
            historyItem.className = `history-item ${currentStructure}`;
            
            const timestamp = new Date().toLocaleTimeString();
            historyItem.textContent = `[${timestamp}] ${operation}`;
            
            historyList.appendChild(historyItem);
            historyList.scrollTop = historyList.scrollHeight;
            
            // Limit history to 20 items
            if (historyList.children.length > 20) {
                historyList.removeChild(historyList.firstChild);
            }
        }
        
        // Update status indicator
        function updateStatus() {
            const count = currentStructure === 'stack' ? stack.length : queue.length;
            
            if (count === 0) {
                setStatus('warning', `${currentStructure === 'stack' ? 'Stack' : 'Queue'} is empty`);
            } else if (count >= maxSize) {
                setStatus('error', `${currentStructure === 'stack' ? 'Stack' : 'Queue'} is full`);
            } else {
                setStatus('normal', `Ready - ${count} element${count !== 1 ? 's' : ''} in ${currentStructure}`);
            }
        }
        
        function setStatus(type, message) {
            statusIndicator.className = `status-indicator status-${type}`;
            statusIndicator.textContent = message;
        }
        
        // Initialize on load
        window.onload = initVisualizer;
        updateSpeedLabel();