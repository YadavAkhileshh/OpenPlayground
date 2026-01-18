// ========================================
// Blockchain Transaction Visualizer
// ========================================

class BlockchainVisualizer {
    constructor() {
        // Configuration
        this.config = {
            blockTime: 5000, // milliseconds
            transactionRate: 3000, // milliseconds
            maxTransactionsPerBlock: 5,
            miningDifficulty: 3,
            gasPriorities: {
                high: 50,
                medium: 25,
                low: 10
            }
        };

        // State
        this.state = {
            isRunning: false,
            wallets: [
                { id: 'alice', name: 'Alice', balance: 100, color: '#6366f1', active: false },
                { id: 'bob', name: 'Bob', balance: 100, color: '#8b5cf6', active: false },
                { id: 'charlie', name: 'Charlie', balance: 100, color: '#ec4899', active: false }
            ],
            mempool: [],
            miners: [
                { id: 'miner1', name: 'Miner 1', status: 'idle', progress: 0, hashrate: 100 },
                { id: 'miner2', name: 'Miner 2', status: 'idle', progress: 0, hashrate: 80 }
            ],
            blockchain: [],
            stats: {
                blocksMinedCount: 0,
                pendingTxCount: 0,
                confirmedTxCount: 0,
                networkHashrate: 0
            },
            selectedTransaction: null,
            transactionCounter: 0,
            forkDetected: false
        };

        // Intervals
        this.intervals = {
            transaction: null,
            mining: null,
            stats: null
        };

        // Particle system
        this.particles = [];
        this.canvas = null;
        this.ctx = null;

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initParticleSystem();
        this.createGenesisBlock();
        this.render();
        this.showTutorial();
    }

    setupElements() {
        // Control elements
        this.elements = {
            blockTimeSlider: document.getElementById('blockTime'),
            blockTimeValue: document.getElementById('blockTimeValue'),
            txRateSlider: document.getElementById('txRate'),
            txRateValue: document.getElementById('txRateValue'),
            gasPrioritySelect: document.getElementById('gasPriority'),
            demoBtn: document.getElementById('demoBtn'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            createTxBtn: document.getElementById('createTxBtn'),
            simulateForkBtn: document.getElementById('simulateForkBtn'),
            clearMempoolBtn: document.getElementById('clearMempoolBtn'),
            networkStatus: document.getElementById('networkStatus'),
            statusDot: document.querySelector('.status-dot'),
            // Stats
            blocksMinedStat: document.getElementById('blocksMined'),
            pendingTxStat: document.getElementById('pendingTx'),
            confirmedTxStat: document.getElementById('confirmedTx'),
            hashrateStat: document.getElementById('hashrate'),
            // Containers
            walletsContainer: document.getElementById('walletsContainer'),
            mempoolContainer: document.getElementById('mempoolQueue'),
            minersContainer: document.getElementById('minersContainer'),
            blockchainContainer: document.getElementById('blockchainScroll'),
            // Details panel
            detailsPanel: document.getElementById('detailsPanel'),
            panelContent: document.getElementById('panelContent'),
            closePanelBtn: document.getElementById('closePanel'),
            // Fork overlay
            forkOverlay: document.getElementById('forkOverlay'),
            closeForkBtn: document.getElementById('closeFork'),
            // Tutorial
            tutorialTooltip: document.getElementById('tutorialTooltip'),
            gotItBtn: document.getElementById('gotItBtn')
        };
    }

    setupEventListeners() {
        // Control sliders
        this.elements.blockTimeSlider.addEventListener('input', (e) => {
            this.config.blockTime = parseInt(e.target.value);
            this.elements.blockTimeValue.textContent = `${this.config.blockTime / 1000}s`;
        });

        this.elements.txRateSlider.addEventListener('input', (e) => {
            this.config.transactionRate = parseInt(e.target.value);
            this.elements.txRateValue.textContent = `${this.config.transactionRate / 1000}s`;
            if (this.state.isRunning) {
                this.restartTransactionGeneration();
            }
        });

        // Action buttons
        this.elements.demoBtn.addEventListener('click', () => this.startDemo());
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.createTxBtn.addEventListener('click', () => this.createTransaction());
        this.elements.simulateForkBtn.addEventListener('click', () => this.simulateFork());
        this.elements.clearMempoolBtn.addEventListener('click', () => this.clearMempool());

        // Details panel
        this.elements.closePanelBtn.addEventListener('click', () => {
            this.elements.detailsPanel.classList.remove('active');
        });

        // Fork overlay
        this.elements.closeForkBtn.addEventListener('click', () => {
            this.elements.forkOverlay.classList.remove('active');
            this.state.forkDetected = false;
        });

        // Tutorial
        this.elements.gotItBtn.addEventListener('click', () => {
            this.elements.tutorialTooltip.classList.add('hidden');
            localStorage.setItem('blockchain-tutorial-seen', 'true');
        });

        // Wallet clicks
        this.elements.walletsContainer.addEventListener('click', (e) => {
            const wallet = e.target.closest('.wallet');
            if (wallet) {
                const walletId = wallet.dataset.walletId;
                this.toggleWallet(walletId);
            }
        });
    }

    // ========== Particle System ==========
    initParticleSystem() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        for (let i = 0; i < 50; i++) {
            this.particles.push(this.createParticle());
        }

        this.animateParticles();

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    animateParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            this.ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animateParticles());
    }

    // ========== Blockchain Logic ==========
    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0000000000000000',
            hash: this.calculateHash(0, [], '0000000000000000'),
            miner: 'Genesis',
            nonce: 0
        };
        this.state.blockchain.push(genesisBlock);
        this.state.stats.blocksMinedCount = 1;
    }

    calculateHash(index, transactions, previousHash, nonce = 0) {
        const data = `${index}${JSON.stringify(transactions)}${previousHash}${nonce}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
    }

    createBlock(transactions, miner) {
        const previousBlock = this.state.blockchain[this.state.blockchain.length - 1];
        const index = previousBlock.index + 1;
        const previousHash = previousBlock.hash;
        
        let nonce = 0;
        let hash = '';
        do {
            nonce++;
            hash = this.calculateHash(index, transactions, previousHash, nonce);
        } while (!hash.startsWith('0'.repeat(this.config.miningDifficulty)));

        const block = {
            index,
            timestamp: Date.now(),
            transactions,
            previousHash,
            hash,
            miner: miner.name,
            nonce
        };

        return block;
    }

    createTransaction(from = null, to = null, amount = null) {
        // Get active wallets
        const activeWallets = this.state.wallets.filter(w => w.active);
        
        if (!from && activeWallets.length >= 2) {
            // Random selection from active wallets
            from = activeWallets[Math.floor(Math.random() * activeWallets.length)];
            const possibleRecipients = activeWallets.filter(w => w.id !== from.id);
            to = possibleRecipients[Math.floor(Math.random() * possibleRecipients.length)];
        } else if (!from) {
            // Random selection from all wallets
            from = this.state.wallets[Math.floor(Math.random() * this.state.wallets.length)];
            const possibleRecipients = this.state.wallets.filter(w => w.id !== from.id);
            to = possibleRecipients[Math.floor(Math.random() * possibleRecipients.length)];
        }

        if (!amount) {
            amount = Math.floor(Math.random() * 10) + 1;
        }

        const priority = this.elements.gasPrioritySelect.value;
        const gasFee = this.config.gasPriorities[priority];

        if (from.balance < amount + gasFee) {
            console.warn(`Insufficient balance for ${from.name}`);
            return null;
        }

        const transaction = {
            id: `TX-${++this.state.transactionCounter}`,
            from: from.id,
            to: to.id,
            amount,
            gasFee,
            priority,
            timestamp: Date.now(),
            status: 'pending'
        };

        this.state.mempool.push(transaction);
        this.state.stats.pendingTxCount++;
        
        // Deduct from sender immediately (will be refunded if transaction fails)
        from.balance -= (amount + gasFee);

        this.render();
        return transaction;
    }

    // ========== Mining Process ==========
    startMining() {
        this.intervals.mining = setInterval(() => {
            if (this.state.mempool.length === 0) return;

            // Select transactions based on priority
            const sortedMempool = [...this.state.mempool].sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            const transactionsToMine = sortedMempool.slice(0, this.config.maxTransactionsPerBlock);
            
            if (transactionsToMine.length === 0) return;

            // Select a miner (weighted by hashrate)
            const totalHashrate = this.state.miners.reduce((sum, m) => sum + m.hashrate, 0);
            const random = Math.random() * totalHashrate;
            let cumulativeHashrate = 0;
            let selectedMiner = this.state.miners[0];

            for (const miner of this.state.miners) {
                cumulativeHashrate += miner.hashrate;
                if (random <= cumulativeHashrate) {
                    selectedMiner = miner;
                    break;
                }
            }

            // Start mining animation
            selectedMiner.status = 'mining';
            selectedMiner.progress = 0;
            this.render();

            const miningInterval = setInterval(() => {
                selectedMiner.progress += 10;
                this.render();

                if (selectedMiner.progress >= 100) {
                    clearInterval(miningInterval);
                    
                    // Mine the block
                    const block = this.createBlock(transactionsToMine, selectedMiner);
                    this.state.blockchain.push(block);
                    this.state.stats.blocksMinedCount++;

                    // Remove mined transactions from mempool
                    transactionsToMine.forEach(tx => {
                        const index = this.state.mempool.findIndex(t => t.id === tx.id);
                        if (index !== -1) {
                            this.state.mempool.splice(index, 1);
                            this.state.stats.pendingTxCount--;
                            this.state.stats.confirmedTxCount++;

                            // Update balances
                            const toWallet = this.state.wallets.find(w => w.id === tx.to);
                            
                            if (toWallet) {
                                toWallet.balance += tx.amount;
                            }
                        }
                    });

                    // Miner gets gas fees
                    const totalGasFees = transactionsToMine.reduce((sum, tx) => sum + tx.gasFee, 0);
                    const minerWallet = this.state.wallets.find(w => w.name.toLowerCase() === selectedMiner.name.toLowerCase());
                    if (minerWallet) {
                        minerWallet.balance += totalGasFees;
                    } else {
                        // Fallback: track miner rewards directly on the miner object
                        if (typeof selectedMiner.balance !== 'number') {
                            selectedMiner.balance = 0;
                        }
                        selectedMiner.balance += totalGasFees;
                    }

                    selectedMiner.status = 'idle';
                    selectedMiner.progress = 0;
                    this.render();
                }
            }, this.config.blockTime / 10);
        }, this.config.blockTime);
    }

    // ========== Control Methods ==========
    startDemo() {
        // Reset first
        this.reset();
        
        // Close tutorial if open
        this.elements.tutorialTooltip.classList.add('hidden');
        
        // Set optimal settings for demo
        this.config.blockTime = 3000;
        this.config.transactionRate = 2000;
        this.elements.blockTimeSlider.value = 3;
        this.elements.blockTimeValue.textContent = '3s';
        this.elements.txRateSlider.value = 2;
        this.elements.txRateValue.textContent = '2s';
        
        // Start the network
        this.start();
        
        // Create initial burst of transactions
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.createTransaction();
                }, i * 300);
            }
        }, 500);
        
        // Show transaction details after 4 seconds
        setTimeout(() => {
            if (this.state.mempool.length > 0) {
                this.showTransactionDetails(this.state.mempool[0]);
            }
        }, 4000);
        
        // Close details panel after viewing
        setTimeout(() => {
            this.elements.detailsPanel.classList.remove('active');
        }, 7000);
        
        // Show block details after first block is mined
        setTimeout(() => {
            if (this.state.blockchain.length > 1) {
                this.showBlockDetails(this.state.blockchain[1]);
            }
        }, 10000);
        
        // Close block details
        setTimeout(() => {
            this.elements.detailsPanel.classList.remove('active');
        }, 13000);
        
        // Simulate fork scenario
        setTimeout(() => {
            if (this.state.blockchain.length >= 3) {
                this.simulateFork();
            }
        }, 18000);
        
        // Resolve fork
        setTimeout(() => {
            this.elements.forkOverlay.classList.remove('active');
        }, 23000);
        
        // Create another burst of transactions
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.createTransaction();
                }, i * 400);
            }
        }, 25000);
        
        // Show completion message
        setTimeout(() => {
            const originalText = this.elements.demoBtn.innerHTML;
            this.elements.demoBtn.innerHTML = '✅ Demo Complete!';
            this.elements.demoBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                this.elements.demoBtn.innerHTML = originalText;
                this.elements.demoBtn.style.background = '';
            }, 3000);
        }, 30000);
    }

    start() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.elements.statusDot.classList.add('active');
        this.elements.networkStatus.textContent = 'Network Active';

        // Activate all wallets
        this.state.wallets.forEach(w => w.active = true);

        // Start generating transactions
        this.intervals.transaction = setInterval(() => {
            this.createTransaction();
        }, this.config.transactionRate);

        // Start mining
        this.startMining();

        // Update stats
        this.intervals.stats = setInterval(() => {
            this.updateStats();
        }, 1000);

        this.render();
    }

    pause() {
        if (!this.state.isRunning) return;

        this.state.isRunning = false;
        this.elements.statusDot.classList.remove('active');
        this.elements.networkStatus.textContent = 'Network Paused';

        clearInterval(this.intervals.transaction);
        clearInterval(this.intervals.mining);
        clearInterval(this.intervals.stats);

        this.render();
    }

    reset() {
        this.pause();
        
        // Reset state
        this.state.wallets.forEach(w => {
            w.balance = 100;
            w.active = false;
        });
        this.state.mempool = [];
        this.state.blockchain = [];
        this.state.stats = {
            blocksMinedCount: 0,
            pendingTxCount: 0,
            confirmedTxCount: 0,
            networkHashrate: 0
        };
        this.state.miners.forEach(m => {
            m.status = 'idle';
            m.progress = 0;
        });
        this.state.transactionCounter = 0;

        this.createGenesisBlock();
        this.elements.detailsPanel.classList.remove('active');
        this.render();
    }

    restartTransactionGeneration() {
        clearInterval(this.intervals.transaction);
        this.intervals.transaction = setInterval(() => {
            this.createTransaction();
        }, this.config.transactionRate);
    }

    toggleWallet(walletId) {
        const wallet = this.state.wallets.find(w => w.id === walletId);
        if (wallet) {
            wallet.active = !wallet.active;
            this.render();
        }
    }

    clearMempool() {
        // Refund gas fees
        this.state.mempool.forEach(tx => {
            const fromWallet = this.state.wallets.find(w => w.id === tx.from);
            if (fromWallet) {
                fromWallet.balance += tx.amount + tx.gasFee;
            }
        });

        this.state.mempool = [];
        this.state.stats.pendingTxCount = 0;
        this.render();
    }

    simulateFork() {
        if (this.state.blockchain.length < 3) {
            alert('Need at least 3 blocks to simulate a fork');
            return;
        }

        this.state.forkDetected = true;
        this.elements.forkOverlay.classList.add('active');

        // Create fork visualization
        const forkPoint = this.state.blockchain.length - 2;
        const mainChain = this.state.blockchain.slice(0, forkPoint + 1);
        
        // Create alternate block
        const alternateBlock = {
            ...this.state.blockchain[forkPoint + 1],
            hash: this.calculateHash(forkPoint + 1, [], mainChain[forkPoint].hash, 9999),
            miner: 'Miner 2 (Fork)'
        };

        this.renderForkVisualization(mainChain, alternateBlock);
    }

    renderForkVisualization(mainChain, alternateBlock) {
        const chainAContainer = document.getElementById('chainA');
        const chainBContainer = document.getElementById('chainB');

        // Chain A (main chain)
        chainAContainer.innerHTML = '';
        mainChain.slice(-3).forEach(block => {
            chainAContainer.appendChild(this.createBlockElement(block, true));
        });

        // Chain B (forked chain)
        chainBContainer.innerHTML = '';
        mainChain.slice(-3, -1).forEach(block => {
            chainBContainer.appendChild(this.createBlockElement(block, true));
        });
        chainBContainer.appendChild(this.createBlockElement(alternateBlock, true));
    }

    // ========== Rendering Methods ==========
    render() {
        this.renderWallets();
        this.renderMempool();
        this.renderMiners();
        this.renderBlockchain();
        this.updateStats();
    }

    renderWallets() {
        this.elements.walletsContainer.innerHTML = '';
        this.state.wallets.forEach(wallet => {
            const walletEl = document.createElement('div');
            walletEl.className = `wallet ${wallet.active ? 'active' : ''}`;
            walletEl.dataset.walletId = wallet.id;
            walletEl.innerHTML = `
                <div class="wallet-icon">👤</div>
                <div class="wallet-info">
                    <span class="wallet-name">${wallet.name}</span>
                    <span class="wallet-balance">${wallet.balance.toFixed(2)} ETH</span>
                </div>
            `;
            this.elements.walletsContainer.appendChild(walletEl);
        });
    }

    renderMempool() {
        this.elements.mempoolContainer.innerHTML = '';
        
        if (this.state.mempool.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'mempool-info';
            emptyMsg.textContent = 'No pending transactions';
            this.elements.mempoolContainer.appendChild(emptyMsg);
            return;
        }

        this.state.mempool.forEach(tx => {
            const txEl = document.createElement('div');
            txEl.className = `transaction ${tx.priority}`;
            txEl.onclick = () => this.showTransactionDetails(tx);
            
            const fromWallet = this.state.wallets.find(w => w.id === tx.from);
            const toWallet = this.state.wallets.find(w => w.id === tx.to);

            txEl.innerHTML = `
                <div class="transaction-header">
                    <span class="tx-id">${tx.id}</span>
                    <span class="priority-badge ${tx.priority}">${tx.priority}</span>
                </div>
                <div class="transaction-info">
                    <div><strong>From:</strong> ${fromWallet?.name || tx.from}</div>
                    <div><strong>To:</strong> ${toWallet?.name || tx.to}</div>
                    <div><strong>Amount:</strong> ${tx.amount} ETH</div>
                    <div><strong>Gas:</strong> ${tx.gasFee} Gwei</div>
                </div>
            `;
            this.elements.mempoolContainer.appendChild(txEl);
        });
    }

    renderMiners() {
        this.elements.minersContainer.innerHTML = '';
        this.state.miners.forEach(miner => {
            const minerEl = document.createElement('div');
            minerEl.className = `miner ${miner.status}`;
            minerEl.innerHTML = `
                <div class="miner-icon">⛏️</div>
                <div class="miner-info">
                    <span class="miner-name">${miner.name}</span>
                    <span class="miner-status ${miner.status}">${miner.status.toUpperCase()}</span>
                    <div class="mining-progress">
                        <div class="progress-bar" style="width: ${miner.progress}%"></div>
                    </div>
                    <div style="margin-top: 5px; font-size: 0.8rem; color: var(--text-secondary);">
                        Hashrate: ${miner.hashrate} H/s
                    </div>
                </div>
            `;
            this.elements.minersContainer.appendChild(minerEl);
        });
    }

    renderBlockchain() {
        this.elements.blockchainContainer.innerHTML = '';
        this.state.blockchain.forEach((block, index) => {
            const blockEl = this.createBlockElement(block);
            this.elements.blockchainContainer.appendChild(blockEl);
        });
    }

    createBlockElement(block, isSmall = false) {
        const blockEl = document.createElement('div');
        blockEl.className = `block ${block.index === 0 ? 'genesis-block' : ''}`;
        if (isSmall) blockEl.style.minWidth = '150px';
        
        blockEl.onclick = () => this.showBlockDetails(block);
        
        blockEl.innerHTML = `
            <div class="block-header">
                <span class="block-number">#${block.index}</span>
            </div>
            <div class="block-body">
                <div class="block-hash">Hash: ${block.hash.substring(0, 12)}...</div>
                <div class="block-info">
                    <span>Miner: ${block.miner}</span>
                    <span>TXs: ${block.transactions.length}</span>
                    <span>Nonce: ${block.nonce}</span>
                </div>
                ${block.transactions.length > 0 ? `
                    <div class="block-transactions">
                        ${block.transactions.slice(0, 3).map(tx => 
                            `<div class="block-tx-item">${tx.id}</div>`
                        ).join('')}
                        ${block.transactions.length > 3 ? `<div class="block-tx-item">+${block.transactions.length - 3} more</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        return blockEl;
    }

    showTransactionDetails(tx) {
        const fromWallet = this.state.wallets.find(w => w.id === tx.from);
        const toWallet = this.state.wallets.find(w => w.id === tx.to);

        this.elements.panelContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Transaction ID</div>
                <div class="detail-value">${tx.id}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">${tx.status}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">From</div>
                <div class="detail-value">${fromWallet?.name || tx.from} (${tx.from})</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">To</div>
                <div class="detail-value">${toWallet?.name || tx.to} (${tx.to})</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Amount</div>
                <div class="detail-value">${tx.amount} ETH</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gas Fee</div>
                <div class="detail-value">${tx.gasFee} Gwei</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Priority</div>
                <div class="detail-value">${tx.priority.toUpperCase()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Timestamp</div>
                <div class="detail-value">${new Date(tx.timestamp).toLocaleString()}</div>
            </div>
        `;
        
        this.elements.detailsPanel.classList.add('active');
    }

    showBlockDetails(block) {
        this.elements.panelContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Block Number</div>
                <div class="detail-value">#${block.index}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Hash</div>
                <div class="detail-value">${block.hash}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Previous Hash</div>
                <div class="detail-value">${block.previousHash}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Miner</div>
                <div class="detail-value">${block.miner}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Nonce</div>
                <div class="detail-value">${block.nonce}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Transactions</div>
                <div class="detail-value">${block.transactions.length}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Timestamp</div>
                <div class="detail-value">${new Date(block.timestamp).toLocaleString()}</div>
            </div>
            ${block.transactions.length > 0 ? `
                <div class="detail-row">
                    <div class="detail-label">Transaction Details</div>
                    <div class="detail-value">
                        ${block.transactions.map(tx => {
                            const fromWallet = this.state.wallets.find(w => w.id === tx.from);
                            const toWallet = this.state.wallets.find(w => w.id === tx.to);
                            return `<div style="margin: 10px 0; padding: 10px; background: var(--dark); border-radius: 6px;">
                                <div><strong>${tx.id}</strong></div>
                                <div style="font-size: 0.85rem; margin-top: 5px;">
                                    ${fromWallet?.name || tx.from} → ${toWallet?.name || tx.to}<br>
                                    Amount: ${tx.amount} ETH | Gas: ${tx.gasFee} Gwei
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        this.elements.detailsPanel.classList.add('active');
    }

    updateStats() {
        this.elements.blocksMinedStat.textContent = this.state.stats.blocksMinedCount;
        this.elements.pendingTxStat.textContent = this.state.stats.pendingTxCount;
        this.elements.confirmedTxStat.textContent = this.state.stats.confirmedTxCount;
        
        const totalHashrate = this.state.miners.reduce((sum, m) => sum + m.hashrate, 0);
        this.state.stats.networkHashrate = totalHashrate;
        this.elements.hashrateStat.textContent = `${totalHashrate} H/s`;
    }

    showTutorial() {
        const tutorialSeen = localStorage.getItem('blockchain-tutorial-seen');
        if (!tutorialSeen) {
            this.elements.tutorialTooltip.classList.remove('hidden');
        }
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.blockchainVisualizer = new BlockchainVisualizer();
});
