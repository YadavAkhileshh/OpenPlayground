        // ATM Simulator
        class ATMSimulator {
            constructor() {
                // User data
                this.user = {
                    pin: '1234',
                    balance: 2500.00,
                    cardInserted: false,
                    authenticated: false
                };

                // Current state
                this.currentScreen = 'welcome';
                this.currentPin = '';
                this.selectedAmount = 0;
                this.transactionType = '';
                this.receiptData = null;

                // Initialize
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateTime();
                setInterval(() => this.updateTime(), 60000);
            }

            setupEventListeners() {
                // Card insertion
                document.getElementById('cardSlot').addEventListener('click', () => this.insertCard());
                document.getElementById('atmCard').addEventListener('click', () => this.ejectCard());

                // Keypad buttons
                document.querySelectorAll('.keypad-btn[data-key]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const key = e.currentTarget.dataset.key;
                        this.handleKeypad(key);
                    });
                });

                // Action buttons
                document.getElementById('withdrawBtn').addEventListener('click', () => this.showWithdrawScreen());
                document.getElementById('depositBtn').addEventListener('click', () => this.showDepositScreen());
                document.getElementById('confirmWithdraw').addEventListener('click', () => this.processWithdrawal());
                document.getElementById('confirmDeposit').addEventListener('click', () => this.processDeposit());

                // Amount selection
                document.querySelectorAll('.amount-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        // Remove selection from all buttons
                        document.querySelectorAll('.amount-btn').forEach(b => {
                            b.classList.remove('selected');
                        });
                        
                        // Select current button
                        e.currentTarget.classList.add('selected');
                        
                        // Set amount
                        this.selectedAmount = parseFloat(e.currentTarget.dataset.amount);
                        
                        // Clear custom amount input
                        if (this.currentScreen === 'withdraw') {
                            document.getElementById('customWithdraw').value = '';
                        } else if (this.currentScreen === 'deposit') {
                            document.getElementById('customDeposit').value = '';
                        }
                    });
                });

                // Custom amount inputs
                document.getElementById('customWithdraw').addEventListener('input', (e) => {
                    this.selectedAmount = parseFloat(e.target.value) || 0;
                    document.querySelectorAll('.amount-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
                });

                document.getElementById('customDeposit').addEventListener('input', (e) => {
                    this.selectedAmount = parseFloat(e.target.value) || 0;
                    document.querySelectorAll('.amount-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
                });
            }

            // Screen Management
            showScreen(screenName) {
                // Hide all screens
                document.querySelectorAll('.screen-state').forEach(screen => {
                    screen.classList.remove('active');
                });

                // Show requested screen
                document.getElementById(`${screenName}Screen`).classList.add('active');
                this.currentScreen = screenName;

                // Update balance display
                this.updateBalanceDisplay();
            }

            // Card Operations
            insertCard() {
                if (!this.user.cardInserted) {
                    this.user.cardInserted = true;
                    document.getElementById('atmCard').classList.add('inserted');
                    
                    // Show PIN screen after short delay
                    setTimeout(() => {
                        this.showScreen('pin');
                        this.currentPin = '';
                        this.updatePinDisplay();
                    }, 1000);
                }
            }

            ejectCard() {
                if (this.user.cardInserted) {
                    this.user.cardInserted = false;
                    this.user.authenticated = false;
                    this.currentPin = '';
                    document.getElementById('atmCard').classList.remove('inserted');
                    
                    // Reset to welcome screen
                    setTimeout(() => {
                        this.showScreen('welcome');
                    }, 500);
                }
            }

            // PIN Management
            handleKeypad(key) {
                if (!this.user.cardInserted) return;

                switch (key) {
                    case 'clear':
                        this.currentPin = '';
                        this.updatePinDisplay();
                        this.hidePinError();
                        break;
                    
                    case 'enter':
                        if (this.currentScreen === 'pin') {
                            this.verifyPin();
                        } else if (this.currentScreen === 'withdraw' && this.selectedAmount > 0) {
                            this.processWithdrawal();
                        } else if (this.currentScreen === 'deposit' && this.selectedAmount > 0) {
                            this.processDeposit();
                        }
                        break;
                    
                    default:
                        if (this.currentScreen === 'pin' && this.currentPin.length < 4) {
                            this.currentPin += key;
                            this.updatePinDisplay();
                            this.hidePinError();
                            
                            // Auto-submit when PIN is complete
                            if (this.currentPin.length === 4) {
                                setTimeout(() => this.verifyPin(), 300);
                            }
                        }
                        break;
                }
            }

            updatePinDisplay() {
                const dots = document.querySelectorAll('.pin-dot');
                dots.forEach((dot, index) => {
                    if (index < this.currentPin.length) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            showPinError() {
                const errorDiv = document.getElementById('pinError');
                const dots = document.querySelectorAll('.pin-dot');
                
                // Add error class to dots
                dots.forEach(dot => {
                    dot.classList.add('error');
                });
                
                // Show error message
                errorDiv.style.display = 'block';
                
                // Clear error after 2 seconds
                setTimeout(() => {
                    this.hidePinError();
                }, 2000);
            }

            hidePinError() {
                const errorDiv = document.getElementById('pinError');
                const dots = document.querySelectorAll('.pin-dot');
                
                dots.forEach(dot => {
                    dot.classList.remove('error');
                });
                
                errorDiv.style.display = 'none';
            }

            verifyPin() {
                if (this.currentPin === this.user.pin) {
                    this.user.authenticated = true;
                    this.showScreen('menu');
                } else {
                    this.showPinError();
                    this.currentPin = '';
                    this.updatePinDisplay();
                }
            }

            // Transaction Screens
            showWithdrawScreen() {
                if (this.user.authenticated) {
                    this.showScreen('withdraw');
                    this.selectedAmount = 0;
                    document.querySelectorAll('.amount-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
                    document.getElementById('customWithdraw').value = '';
                    this.hideWithdrawError();
                }
            }

            showDepositScreen() {
                if (this.user.authenticated) {
                    this.showScreen('deposit');
                    this.selectedAmount = 0;
                    document.querySelectorAll('.amount-btn').forEach(b => {
                        b.classList.remove('selected');
                    });
                    document.getElementById('customDeposit').value = '';
                }
            }

            // Transaction Processing
            async processWithdrawal() {
                if (!this.user.authenticated || this.selectedAmount <= 0) return;

                // Validate amount
                if (this.selectedAmount > this.user.balance) {
                    this.showWithdrawError();
                    return;
                }

                if (this.selectedAmount < 10) {
                    alert('Minimum withdrawal amount is $10');
                    return;
                }

                // Show processing screen
                this.showScreen('processing');
                
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Process withdrawal
                this.user.balance -= this.selectedAmount;
                
                // Generate receipt
                this.generateReceipt('Withdrawal', -this.selectedAmount);
                
                // Show receipt
                this.showScreen('receipt');
            }

            async processDeposit() {
                if (!this.user.authenticated || this.selectedAmount <= 0) return;

                if (this.selectedAmount < 10) {
                    alert('Minimum deposit amount is $10');
                    return;
                }

                // Show processing screen
                this.showScreen('processing');
                
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Process deposit
                this.user.balance += this.selectedAmount;
                
                // Generate receipt
                this.generateReceipt('Deposit', this.selectedAmount);
                
                // Show receipt
                this.showScreen('receipt');
            }

            showWithdrawError() {
                const errorDiv = document.getElementById('withdrawError');
                errorDiv.style.display = 'block';
                
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 3000);
            }

            hideWithdrawError() {
                document.getElementById('withdrawError').style.display = 'none';
            }

            // Receipt Generation
            generateReceipt(type, amount) {
                const now = new Date();
                const dateStr = now.toLocaleDateString();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                this.receiptData = {
                    date: dateStr,
                    time: timeStr,
                    type: type,
                    amount: Math.abs(amount).toFixed(2),
                    balance: this.user.balance.toFixed(2)
                };
                
                // Update receipt display
                document.getElementById('receiptDate').textContent = this.receiptData.date;
                document.getElementById('receiptTime').textContent = this.receiptData.time;
                document.getElementById('receiptType').textContent = this.receiptData.type;
                document.getElementById('receiptAmount').textContent = this.receiptData.amount;
                document.getElementById('receiptBalance').textContent = this.receiptData.balance;
                
                // Show receipt
                document.getElementById('receipt').classList.add('visible');
            }

            // Utility Functions
            updateBalanceDisplay() {
                const balanceElements = document.querySelectorAll('#currentBalance, #availableBalance');
                balanceElements.forEach(el => {
                    el.textContent = this.user.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                });
            }

            updateTime() {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                document.getElementById('currentTime').textContent = timeStr;
            }
        }

        // Global functions for inline event handlers
        function goToMenu() {
            if (atm.user.authenticated) {
                atm.showScreen('menu');
            }
        }

        function ejectCard() {
            atm.ejectCard();
        }

        // Initialize ATM
        const atm = new ATMSimulator();

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (!atm.user.cardInserted) return;

            const key = e.key;
            
            if (key >= '0' && key <= '9') {
                atm.handleKeypad(key);
            } else if (key === 'Enter') {
                atm.handleKeypad('enter');
            } else if (key === 'Backspace' || key === 'Delete') {
                atm.handleKeypad('clear');
            }
        });

        // Add initial animation
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                document.querySelector('.atm-machine').style.transform = 'translateY(0)';
                document.querySelector('.atm-machine').style.opacity = '1';
            }, 100);
        });