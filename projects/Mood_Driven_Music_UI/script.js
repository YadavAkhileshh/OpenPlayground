document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.mood-btn');
    const body = document.body;
    const reduceMotionToggle = document.getElementById('reduced-motion-toggle');

    setMood('calm');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            setMood(mood);
        });
    });

    function setMood(mood) {
        body.className = '';
        
        body.classList.add(mood);

        buttons.forEach(btn => {
            if(btn.getAttribute('data-mood') === mood) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (reduceMotionToggle.checked) {
            body.classList.add('reduced-motion');
        }
    }

    reduceMotionToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }
    });
});