const Cycle = {
    time: 480, // 08:00 AM (minutes from midnight)
    dayDuration: 1440, // 24 hours
    isNight: false,

    init() {
        setInterval(() => this.tick(), 1000); // 1 second real-time = 15 minutes in-game
    },

    tick() {
        if (Game.paused) return;
        this.time += 15;
        if (this.time >= this.dayDuration) this.time = 0;

        this.updateUI();
        this.checkDayNight();
    },

    updateUI() {
        const hours = Math.floor(this.time / 60);
        const minutes = this.time % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');

        document.querySelector('#stat-time .value').textContent =
            `${displayHours}:${displayMinutes} ${ampm}`;
    },

    checkDayNight() {
        // Night between 8 PM and 6 AM
        const hours = Math.floor(this.time / 60);
        const nightMode = hours >= 20 || hours < 6;

        if (nightMode !== this.isNight) {
            this.isNight = nightMode;
            const overlay = document.getElementById('night-overlay');
            overlay.style.opacity = this.isNight ? '0.7' : '0';

            // Toggle window lights
            document.querySelectorAll('.building').forEach(b => {
                if (this.isNight) b.classList.add('lit');
                else b.classList.remove('lit');
            });
        }
    }
};
