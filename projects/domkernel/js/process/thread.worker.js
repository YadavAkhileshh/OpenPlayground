/**
 * Worker Pool Thread Script
 * Handles CPU intensive tasks transparently
 */
self.onmessage = function (e) {
    const { messageId, type, payload } = e.data;

    try {
        if (type === 'EVAL_TASK') {
            const { code, args } = payload;

            // Safety wrapper to execute string functions
            const workFunc = new Function('args', 'return (' + code + ')(args);');

            const result = workFunc(args);

            if (result instanceof Promise) {
                result.then(res => self.postMessage({ messageId, success: true, result: res }))
                    .catch(err => self.postMessage({ messageId, success: false, error: err.message || 'Worker Exception' }));
            } else {
                self.postMessage({ messageId, success: true, result });
            }
        }
        else if (type === 'LONG_LOOP') {
            // Simulated intense computation finding primes
            const limit = payload.limit || 1000000;
            let primes = 0;
            for (let i = 2; i < limit; i++) {
                let isPrime = true;
                for (let j = 2; j <= Math.sqrt(i); j++) {
                    if (i % j === 0) {
                        isPrime = false;
                        break;
                    }
                }
                if (isPrime) primes++;

                // Report progress every 10K
                if (i % 10000 === 0) {
                    self.postMessage({ messageId, type: 'PROGRESS', progress: i / limit });
                }
            }
            self.postMessage({ messageId, success: true, result: `Found ${primes} primes below ${limit}` });
        }
        else {
            self.postMessage({ messageId, success: false, error: 'Unknown worker task type' });
        }
    } catch (error) {
        self.postMessage({ messageId, success: false, error: error.message || 'Worker Exception' });
    }
};
