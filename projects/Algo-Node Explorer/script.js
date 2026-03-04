const btnSearch = document.getElementById('btnSearch');
const walletInput = document.getElementById('walletInput');
const statusMsg = document.getElementById('statusMsg');
const resultsArea = document.getElementById('resultsArea');
const displayAddress = document.getElementById('displayAddress');
const timelineContent = document.getElementById('timelineContent');

// AlgoNode Public Indexer URL
const BASE_URL = 'https://mainnet-idx.algonode.cloud/v2/accounts/';

btnSearch.addEventListener('click', () => {
    const address = walletInput.value.trim();
    if (address.length === 58) { // Algorand addresses are 58 chars
        fetchTransactions(address);
    } else {
        showError("Invalid Algorand Address format.");
    }
});

walletInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSearch.click();
});

async function fetchTransactions(address) {
    // UI Reset
    resultsArea.classList.add('hidden');
    statusMsg.classList.remove('hidden');
    statusMsg.classList.remove('error');
    statusMsg.innerText = "Querying Algorand Mainnet...";
    btnSearch.disabled = true;

    try {
        // Fetch last 15 transactions
        const response = await fetch(`${BASE_URL}${address}/transactions?limit=15`);
        
        if (!response.ok) {
            throw new Error("Address not found or network error.");
        }

        const data = await response.json();
        const transactions = data.transactions;

        if (!transactions || transactions.length === 0) {
            showError("No recent transactions found for this wallet.");
            return;
        }

        buildTimeline(address, transactions);

        // Success UI
        displayAddress.innerText = address;
        statusMsg.classList.add('hidden');
        resultsArea.classList.remove('hidden');

    } catch (error) {
        showError(error.message);
    } finally {
        btnSearch.disabled = false;
    }
}

function buildTimeline(searchAddress, txs) {
    timelineContent.innerHTML = '';

    txs.forEach(tx => {
        // We primarily visualize "pay" (Algo) transactions for this explorer
        if (tx['tx-type'] !== 'pay') return;

        const sender = tx.sender;
        const receiver = tx['payment-transaction']?.receiver;
        const microAmount = tx['payment-transaction']?.amount || 0;
        const fee = tx.fee || 0;
        
        // Math: 1 ALGO = 1,000,000 MicroAlgos
        const algoAmount = (microAmount / 1000000).toFixed(4);

        // Determine Direction
        const isOutbound = sender === searchAddress;
        const directionClass = isOutbound ? 'out' : 'in';
        const typeText = isOutbound ? 'SENT' : 'RECEIVED';
        const counterparty = isOutbound ? receiver : sender;

        // Truncate Counterparty Address for UI
        const shortCounterparty = counterparty ? `${counterparty.substring(0, 8)}...${counterparty.substring(50)}` : 'Network / App';
        const shortTxId = `${tx.id.substring(0, 8)}...`;

        // Parse Timestamp
        const dateObj = new Date(tx['round-time'] * 1000);
        const dateStr = dateObj.toLocaleString();

        // Build DOM Element
        const node = document.createElement('div');
        node.className = `tx-node ${directionClass}`;

        node.innerHTML = `
            <div class="tx-header">
                <div class="tx-type">${typeText} ALGO</div>
                <div class="tx-date">${dateStr}</div>
            </div>
            <div class="tx-details">
                <div><span>TxID:</span> ${shortTxId}</div>
                <div><span>${isOutbound ? 'To' : 'From'}:</span> ${shortCounterparty}</div>
                <div class="amount">${isOutbound ? '-' : '+'}${algoAmount} ₳</div>
            </div>
        `;

        timelineContent.appendChild(node);
    });

    if (timelineContent.children.length === 0) {
        timelineContent.innerHTML = `<div style="color: #888; font-size: 0.9rem;">No ALGO payment transactions found in recent history. Contains asset/app calls only.</div>`;
    }
}

function showError(msg) {
    statusMsg.classList.remove('hidden');
    statusMsg.classList.add('error');
    statusMsg.innerText = msg;
    resultsArea.classList.add('hidden');
}