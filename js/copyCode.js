document.addEventListener('DOMContentLoaded', () => {
    const preElements = document.querySelectorAll('pre');
    
    preElements.forEach((pre) => {
        // Only target pre elements that contain code or are meant to be code blocks
        // But to be safe, we'll add it to all <pre> elements that don't already have one
        if (pre.querySelector('.copy-btn')) return;

        // Make sure pre is relatively positioned so we can absolute-position the button
        if (window.getComputedStyle(pre).position === 'static') {
            pre.style.position = 'relative';
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        
        // Basic styling for the button
        Object.assign(copyBtn.style, {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: 'inherit',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            zIndex: '10'
        });

        // Hover effects
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        copyBtn.addEventListener('click', async () => {
            try {
                // Get text without the button's own text (if we add text later)
                const textToCopy = pre.innerText.replace(copyBtn.innerText, '').trim();
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                copyBtn.style.borderColor = '#4caf50';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                    copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });

        pre.appendChild(copyBtn);
    });
});
