    (function() {
        // ----- DATA & STATE -----
        let steps = [];  // each step: { id, type, label, desc, icon }

        // prefill with two demo steps to make canvas look alive
        const demoSteps = [
            { id: 'step_1', type: 'trigger', label: 'Webhook', desc: 'Incoming HTTP call', icon: 'link' },
            { id: 'step_2', type: 'action', label: 'Send email', desc: 'Gmail / SMTP', icon: 'envelope' },
            { id: 'step_3', type: 'condition', label: 'Condition', desc: 'If / Else branch', icon: 'code-branch' },
        ];

        demoSteps.forEach(s => steps.push(s));

        // ----- DOM elements -----
        const canvasEl = document.getElementById('workflowCanvas');
        const publishBtn = document.getElementById('publishBtn');

        // ----- helper: render all steps from steps array to canvas -----
        function renderCanvas() {
            if (steps.length === 0) {
                canvasEl.innerHTML = `<div class="empty-canvas-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <div>Drag and drop components here</div>
                    <span style="font-size:0.9rem; background: rgba(0,0,0,0.02); padding: 8px 20px; border-radius: 40px;">⇩ drop to build automation</span>
                </div>`;
                return;
            }

            let html = '';
            steps.forEach((step, index) => {
                const iconMap = {
                    'calendar': 'fa-calendar-alt',
                    'link': 'fa-link',
                    'envelope': 'fa-envelope',
                    'slack': 'fa-slack',
                    'code-branch': 'fa-code-branch',
                    'hourglass': 'fa-hourglass-half',
                    'database': 'fa-database',
                };
                // fallback icon
                const iconClass = iconMap[step.icon] || 'fa-gear';
                // type for border color
                const typeAttr = step.type || 'action';

                html += `
                    <div class="canvas-step" data-id="${step.id}" data-type="${typeAttr}">
                        <div class="step-icon"><i class="fas ${iconClass}"></i></div>
                        <div class="step-content">
                            <div style="font-weight: 600;">${step.label}</div>
                            <div class="step-desc">${step.desc}</div>
                        </div>
                        <button class="step-remove" data-id="${step.id}" title="Remove step"><i class="fas fa-trash-can"></i></button>
                    </div>
                    ${index < steps.length-1 ? '<div class="connector-dots"><i class="fas fa-arrow-down"></i></div>' : ''}
                `;
            });
            canvasEl.innerHTML = html;

            // attach remove listeners
            document.querySelectorAll('.step-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    removeStepById(id);
                });
            });
        }

        // ----- remove step -----
        function removeStepById(id) {
            steps = steps.filter(step => step.id !== id);
            renderCanvas();
        }

        // ----- add new step from drag data -----
        function addStepFromDrag(data) {
            // dataTransfer items from drag
            const type = data.type || 'action';
            let label = data.label || 'Component';
            let desc = data.desc || 'automation step';
            let icon = data.icon || 'gear';

            // small variations based on type (just for demonstration)
            if (type === 'trigger' && label === 'Schedule trigger') {
                label = 'Schedule';
                desc = 'Cron / time event';
                icon = 'calendar';
            } else if (type === 'trigger' && label === 'Webhook') {
                label = 'Webhook';
                desc = 'Incoming HTTP';
                icon = 'link';
            } else if (type === 'action' && label === 'Send email') {
                label = 'Send email';
                desc = 'Gmail / SMTP';
                icon = 'envelope';
            } else if (type === 'action' && label === 'Slack message') {
                label = 'Slack';
                desc = 'Post to channel';
                icon = 'slack';
            } else if (type === 'condition') {
                label = 'Condition';
                desc = 'If / Else branch';
                icon = 'code-branch';
            } else if (type === 'delay') {
                label = 'Delay';
                desc = 'Wait 1h';
                icon = 'hourglass';
            } else if (type === 'action' && label === 'Update database') {
                label = 'Database';
                desc = 'SQL / NoSQL';
                icon = 'database';
            }

            const newStep = {
                id: 'step_' + Date.now() + '_' + Math.floor(Math.random()*1000),
                type: type,
                label: label,
                desc: desc,
                icon: icon,
            };
            steps.push(newStep);
            renderCanvas();
        }

        // ----- drag & drop: prepare data from toolbox items -----
        function handleDragStart(e) {
            const item = e.target.closest('.draggable-item');
            if (!item) return;

            const type = item.getAttribute('data-type') || 'action';
            const label = item.getAttribute('data-label') || item.innerText.trim();
            const desc = item.getAttribute('data-desc') || '';
            const icon = item.getAttribute('data-icon') || 'gear';

            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: type,
                label: label,
                desc: desc,
                icon: icon
            }));
            e.dataTransfer.effectAllowed = 'move';
        }

        // ----- dragover / dragleave highlight -----
        function handleDragOver(e) {
            e.preventDefault();
            canvasEl.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            canvasEl.classList.remove('drag-over');
        }

        // ----- DROP -----
        function handleDrop(e) {
            e.preventDefault();
            canvasEl.classList.remove('drag-over');

            const rawData = e.dataTransfer.getData('text/plain');
            if (!rawData) return;

            try {
                const stepData = JSON.parse(rawData);
                addStepFromDrag(stepData);
            } catch (err) {
                console.warn('drop parse error', err);
            }
        }

        // ----- disable default dragover for whole container (already done via @dragover.prevent in html attribute? better attach) -----
        canvasEl.addEventListener('dragover', handleDragOver);
        canvasEl.addEventListener('dragleave', handleDragLeave);
        canvasEl.addEventListener('drop', handleDrop);

        // ----- make all draggable items actually draggable -----
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            // prevent default browser drag image weirdness (fine)
            item.setAttribute('draggable', 'true');
        });

        // ----- initial render -----
        renderCanvas();

        // ----- publish simulation -----
        publishBtn.addEventListener('click', () => {
            if (steps.length === 0) {
                alert('✨ Canvas is empty — add some steps first.');
            } else {
                alert(`🚀 Workflow published with ${steps.length} steps (simulated).`);
            }
        });

        // ----- also remove any unwanted default drag behaviors on canvas children (safe) -----
        window.addEventListener('dragenter', (e) => e.preventDefault());
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => e.preventDefault());

        // small extra: canvas drop should not navigate etc.
    })();