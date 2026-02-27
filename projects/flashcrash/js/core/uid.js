/**
 * Ultra-fast unique ID generator for high volume data (Orders, Trades)
 */
let _uidCount = 0;
const _uidPrefix = Date.now().toString(36) + '-';

function uid() {
    return _uidPrefix + (++_uidCount).toString(36);
}

window.uid = uid;
