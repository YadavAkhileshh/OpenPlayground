// Simulated blockchain for educational mode
const randomHash = () => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const randomAddress = () => '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const KNOWN_ADDRESSES = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
];

function createTransaction(blockNumber, blockTimestamp) {
    const value = Math.random() > 0.6 ? BigInt(Math.floor(Math.random() * 5e18)) : BigInt(Math.floor(Math.random() * 1e17));
    return {
        hash: randomHash(),
        blockNumber: BigInt(blockNumber),
        blockHash: randomHash(),
        from: KNOWN_ADDRESSES[Math.floor(Math.random() * KNOWN_ADDRESSES.length)],
        to: Math.random() > 0.1 ? (Math.random() > 0.5 ? KNOWN_ADDRESSES[Math.floor(Math.random() * KNOWN_ADDRESSES.length)] : randomAddress()) : null,
        value: value,
        gasPrice: BigInt(Math.floor(Math.random() * 50 + 10) * 1e9),
        gas: BigInt(Math.floor(Math.random() * 100000 + 21000)),
        nonce: BigInt(Math.floor(Math.random() * 500)),
        input: Math.random() > 0.7 ? '0x' + Array.from({ length: Math.floor(Math.random() * 100 + 10) * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join('') : '0x',
        type: BigInt(2),
        // Additional receipt-like data
        status: Math.random() > 0.05 ? BigInt(1) : BigInt(0),
        gasUsed: BigInt(Math.floor(Math.random() * 80000 + 21000)),
    };
}

function createBlock(number, prevHash, txCount = null) {
    const numTx = txCount !== null ? txCount : Math.floor(Math.random() * 180 + 20);
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - (500 - number) * 12);
    const transactions = [];
    for (let i = 0; i < numTx; i++) {
        transactions.push(createTransaction(number, timestamp));
    }
    const totalGasUsed = transactions.reduce((sum, tx) => sum + tx.gasUsed, BigInt(0));

    return {
        number: BigInt(number),
        hash: randomHash(),
        parentHash: prevHash || randomHash(),
        timestamp: timestamp,
        miner: KNOWN_ADDRESSES[Math.floor(Math.random() * KNOWN_ADDRESSES.length)],
        gasUsed: totalGasUsed,
        gasLimit: BigInt(30000000),
        baseFeePerGas: BigInt(Math.floor(Math.random() * 30 + 5) * 1e9),
        transactions: transactions,
        size: BigInt(Math.floor(Math.random() * 100000 + 20000)),
        difficulty: BigInt(0),
        totalDifficulty: BigInt(0),
        nonce: '0x0000000000000000',
    };
}

export class SimulatedBlockchain {
    constructor() {
        this.blocks = [];
        this.addressBalances = {};
        this.pendingTransactions = [];

        // Initialize balances
        KNOWN_ADDRESSES.forEach(addr => {
            this.addressBalances[addr.toLowerCase()] = BigInt(Math.floor(Math.random() * 100 + 10)) * BigInt(1e18);
        });

        // Generate initial chain
        let prevHash = randomHash();
        for (let i = 0; i < 20; i++) {
            const block = createBlock(490 + i, prevHash);
            this.blocks.push(block);
            prevHash = block.hash;
        }
    }

    getBlockNumber() {
        return this.blocks[this.blocks.length - 1].number;
    }

    getBlock(identifier, includeTxs = false) {
        let block;
        if (typeof identifier === 'bigint' || typeof identifier === 'number') {
            block = this.blocks.find(b => b.number === BigInt(identifier));
        } else if (typeof identifier === 'string') {
            block = this.blocks.find(b => b.hash === identifier);
        }
        if (!block) return null;

        if (!includeTxs) {
            return { ...block, transactions: block.transactions.map(tx => tx.hash) };
        }
        return { ...block };
    }

    getTransaction(hash) {
        for (const block of this.blocks) {
            const tx = block.transactions.find(t => t.hash === hash);
            if (tx) return { ...tx };
        }
        return null;
    }

    getTransactionReceipt(hash) {
        const tx = this.getTransaction(hash);
        if (!tx) return null;
        return {
            transactionHash: tx.hash,
            blockNumber: tx.blockNumber,
            blockHash: tx.blockHash,
            from: tx.from,
            to: tx.to,
            gasUsed: tx.gasUsed,
            status: tx.status,
            logs: [],
        };
    }

    getBalance(address) {
        const bal = this.addressBalances[address.toLowerCase()];
        return bal || BigInt(Math.floor(Math.random() * 5)) * BigInt(1e18);
    }

    getTransactionCount(address) {
        let count = 0;
        for (const block of this.blocks) {
            count += block.transactions.filter(tx => tx.from.toLowerCase() === address.toLowerCase()).length;
        }
        return BigInt(count);
    }

    getGasPrice() {
        const latest = this.blocks[this.blocks.length - 1];
        return latest.baseFeePerGas + BigInt(2e9);
    }

    getTransactionsForAddress(address) {
        const addr = address.toLowerCase();
        const txs = [];
        for (let i = this.blocks.length - 1; i >= 0 && txs.length < 20; i--) {
            for (const tx of this.blocks[i].transactions) {
                if (tx.from.toLowerCase() === addr || (tx.to && tx.to.toLowerCase() === addr)) {
                    txs.push({ ...tx });
                    if (txs.length >= 20) break;
                }
            }
        }
        return txs;
    }

    // Create a pending transaction
    addPendingTransaction(from, to, value) {
        const tx = {
            hash: randomHash(),
            from: from || randomAddress(),
            to: to || randomAddress(),
            value: BigInt(value || Math.floor(Math.random() * 1e18)),
            gasPrice: this.getGasPrice(),
            gas: BigInt(21000),
            nonce: BigInt(0),
            input: '0x',
            type: BigInt(2),
        };
        this.pendingTransactions.push(tx);
        return tx;
    }

    // Mine a new block
    mineBlock() {
        const prevBlock = this.blocks[this.blocks.length - 1];
        const newNumber = Number(prevBlock.number) + 1;

        // Include pending transactions + some random ones
        const block = createBlock(newNumber, prevBlock.hash, Math.floor(Math.random() * 50 + 5));

        // Add pending transactions to the block
        for (const ptx of this.pendingTransactions) {
            const fullTx = {
                ...ptx,
                blockNumber: BigInt(newNumber),
                blockHash: block.hash,
                status: BigInt(1),
                gasUsed: BigInt(21000),
            };
            block.transactions.unshift(fullTx);
        }

        // Recalculate gas
        block.gasUsed = block.transactions.reduce((sum, tx) => sum + (tx.gasUsed || BigInt(21000)), BigInt(0));

        this.pendingTransactions = [];
        this.blocks.push(block);

        // Keep only last 50 blocks in memory
        if (this.blocks.length > 50) {
            this.blocks = this.blocks.slice(-50);
        }

        return block;
    }
}
