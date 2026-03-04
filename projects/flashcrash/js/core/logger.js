/**
 * Internal logger for debugging and UI terminal emulation
 */
class Logger {
    constructor(eventBusName = 'global') {
        this.history = new CircularBuffer(200);
        this.busName = eventBusName;
    }

    _log(level, msg, data = null) {
        const entry = {
            id: uid(),
            time: Date.now(),
            level,
            msg,
            data
        };
        this.history.push(entry);

        if (window.app && window.app.bus) {
            window.app.bus.emitAsync(CONSTANTS.EVENTS.LOG, entry);
        }
    }

    info(msg, data) { this._log('info', msg, data); }
    warn(msg, data) { this._log('warn', msg, data); }
    error(msg, data) { this._log('error', msg, data); }
    trade(msg, data) { this._log('trade', msg, data); }
}

window.Logger = Logger;
