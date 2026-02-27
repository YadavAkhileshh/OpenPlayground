/**
 * App.js
 * Main entry point for the AudioModem application.
 * Orchestrates UI interactions and connects the modular logic components.
 * 
 * Part of the AudioModem Project.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const elements = {
        txData: document.getElementById('tx-data'),
        txBitstream: document.getElementById('tx-bitstream'),
        btnTransmit: document.getElementById('btn-transmit'),
        btnClearTx: document.getElementById('btn-clear-tx'),
        btnStartRx: document.getElementById('btn-start-rx'),
        btnClearRx: document.getElementById('btn-clear-rx'),
        rxLog: document.getElementById('rx-log'),
        rxLight: document.getElementById('rx-light'),
        rxActivity: document.getElementById('rx-activity'),
        modemStatus: document.getElementById('modem-status'),
        latencyVal: document.getElementById('latency-val'),
        signalMeter: document.getElementById('signal-meter'),
        peakFreq: document.getElementById('peak-freq'),
        clock: document.getElementById('system-clock')
    };

    // Initialize Global State
    let isTransmitting = false;
    let isReceiving = false;

    // Initialize Component - Visualizer
    window.visualizer = new Visualizer(window.audioEngine, 'canvas-spectrum', 'canvas-waterfall', 'canvas-waveform');

    /**
     * SYSTEM CLOCK
     */
    setInterval(() => {
        const now = new Date();
        elements.clock.textContent = now.toTimeString().split(' ')[0];
    }, 1000);

    /**
     * TRANSMISSION LOGIC
     */
    elements.btnTransmit.addEventListener('click', async () => {
        if (isTransmitting) {
            window.modulator.stop();
            return;
        }

        const text = elements.txData.value.trim();
        if (!text) {
            alert("SYSTEM ERROR: NO DATA IN BUFFER.");
            return;
        }

        const bits = window.bitStream.textToBits(text);
        elements.txBitstream.textContent = window.bitStream.formatBits(bits);

        isTransmitting = true;
        updateUIState();

        const startTime = performance.now();
        window.modulator.transmit(
            bits,
            (bit, remaining) => {
                // UI feedback per bit if needed
                elements.modemStatus.textContent = `TX BITS: ${remaining}`;
            },
            () => {
                isTransmitting = false;
                elements.latencyVal.textContent = `${Math.round(performance.now() - startTime)} ms`;
                updateUIState();
            }
        );
    });

    elements.btnClearTx.addEventListener('click', () => {
        elements.txData.value = '';
        elements.txBitstream.textContent = '';
    });

    /**
     * RECEPTION LOGIC
     */
    elements.btnStartRx.addEventListener('click', async () => {
        if (isReceiving) {
            window.demodulator.stop();
            isReceiving = false;
            updateUIState();
            return;
        }

        try {
            await window.demodulator.start();
            window.visualizer.start();
            isReceiving = true;
            updateUIState();
        } catch (e) {
            alert("ACCESS DENIED: MICROPHONE INPUT REQUIRED.");
        }
    });

    elements.btnClearRx.addEventListener('click', () => {
        elements.rxLog.innerHTML = '';
    });

    /**
     * CALIBRATION LOGIC
     */
    const calBtn = document.createElement('button');
    calBtn.className = 'btn btn-secondary';
    calBtn.textContent = 'CALIBRATE';
    calBtn.style.marginTop = '10px';
    document.querySelector('.panel-rx .action-bar').appendChild(calBtn);

    calBtn.addEventListener('click', () => {
        calBtn.disabled = true;
        calBtn.textContent = 'CALIBRATING...';
        elements.rxLight.classList.add('syncing');

        window.telemetry.startCalibration(3);
        window.telemetry.onCalibrationComplete = (noiseFloor) => {
            calBtn.disabled = false;
            calBtn.textContent = 'CALIBRATE';
            elements.rxLight.classList.remove('syncing');
            alert(`CALIBRATION COMPLETE. NOISE FLOOR: ${noiseFloor.toFixed(2)}`);
        };
    });

    // Demodulator Callbacks
    window.demodulator.onBitDetected = (bit) => {
        elements.rxLight.classList.add('active');
        setTimeout(() => elements.rxLight.classList.remove('active'), 100);

        if (bit === 'SYNC') {
            elements.rxActivity.textContent = "SIGNAL ACQUIRED";
            elements.rxActivity.className = "text-green";
            elements.rxLight.classList.add('active');
        } else {
            elements.rxActivity.textContent = `DECODING: ${bit}`;
        }
    };

    window.demodulator.onDataDecoded = (data) => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const timestamp = new Date().toLocaleTimeString();
        entry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${data}`;
        elements.rxLog.prepend(entry);

        elements.rxActivity.textContent = "DATA RECEIVED";
        elements.rxActivity.className = "text-green";
        setTimeout(() => {
            if (isReceiving) elements.rxActivity.textContent = "LISTENING...";
        }, 2000);
    };

    window.demodulator.onSignalStats = (stats) => {
        elements.peakFreq.textContent = `${Math.round(stats.peakFreq)} Hz`;
        elements.signalMeter.style.width = `${stats.strength}%`;

        if (stats.strength > 50) {
            elements.signalMeter.style.background = 'var(--success-color)';
        } else {
            elements.signalMeter.style.background = 'var(--text-primary)';
        }
    };

    /**
     * UI STATE SYNC
     */
    function updateUIState() {
        // TX Button
        if (isTransmitting) {
            elements.btnTransmit.textContent = "ABORT BURST";
            elements.btnTransmit.classList.replace('btn-primary', 'btn-secondary');
            elements.modemStatus.textContent = "TRANSMITTING";
            elements.modemStatus.className = "status-val text-red";
        } else {
            elements.btnTransmit.textContent = "INITIATE BROADCAST";
            elements.btnTransmit.classList.replace('btn-secondary', 'btn-primary');
            elements.modemStatus.textContent = isReceiving ? "ACTIVE" : "IDLE";
            elements.modemStatus.className = isReceiving ? "status-val text-green" : "status-val text-orange";
        }

        // RX Button
        if (isReceiving) {
            elements.btnStartRx.textContent = "DISABLE RECEIVER";
            elements.btnStartRx.classList.replace('btn-primary', 'btn-secondary');
            elements.rxActivity.textContent = "LISTENING...";
        } else {
            elements.btnStartRx.textContent = "SYNC RECEIVER";
            elements.btnStartRx.classList.replace('btn-secondary', 'btn-primary');
            elements.rxActivity.textContent = "OFFLINE";
        }
    }

    // Initialize UI
    updateUIState();
    console.log("AudioModem: Application Ready.");
});
