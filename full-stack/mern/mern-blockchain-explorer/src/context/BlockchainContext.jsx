import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createWeb3, NETWORKS, formatEther, formatGwei } from '../utils/web3';
import { SimulatedBlockchain } from '../utils/simulator';

const BlockchainContext = createContext();

export function useBlockchain() {
    return useContext(BlockchainContext);
}

export function BlockchainProvider({ children }) {
    const [network, setNetwork] = useState('simulated');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestBlockNumber, setLatestBlockNumber] = useState(null);
    const [latestBlocks, setLatestBlocks] = useState([]);
    const [latestTransactions, setLatestTransactions] = useState([]);
    const [gasPrice, setGasPrice] = useState(null);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('bp_recent_searches') || '[]');
        } catch { return []; }
    });

    const web3Ref = useRef(null);
    const simRef = useRef(null);
    const intervalRef = useRef(null);

    // Initialize
    useEffect(() => {
        if (network === 'simulated') {
            web3Ref.current = null;
            if (!simRef.current) {
                simRef.current = new SimulatedBlockchain();
            }
        } else {
            simRef.current = null;
            web3Ref.current = createWeb3(network);
        }
        fetchData();

        // Auto-refresh for live networks
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (network !== 'simulated') {
            intervalRef.current = setInterval(fetchData, 20000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [network]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (network === 'simulated') {
                const sim = simRef.current;
                const blockNum = sim.getBlockNumber();
                setLatestBlockNumber(blockNum);
                setGasPrice(sim.getGasPrice());

                const blocks = [];
                for (let i = 0; i < 8; i++) {
                    const b = sim.getBlock(blockNum - BigInt(i), false);
                    if (b) blocks.push(b);
                }
                setLatestBlocks(blocks);

                const fullBlock = sim.getBlock(blockNum, true);
                if (fullBlock) {
                    setLatestTransactions(fullBlock.transactions.slice(0, 8));
                }
            } else {
                const web3 = web3Ref.current;
                if (!web3) throw new Error('Web3 not initialized');

                const blockNum = await web3.eth.getBlockNumber();
                setLatestBlockNumber(blockNum);

                try {
                    const gp = await web3.eth.getGasPrice();
                    setGasPrice(gp);
                } catch { setGasPrice(null); }

                const blocks = [];
                for (let i = 0; i < 8; i++) {
                    const target = BigInt(blockNum) - BigInt(i);
                    const b = await web3.eth.getBlock(target, false);
                    if (b) blocks.push(b);
                }
                setLatestBlocks(blocks);

                const fullBlock = await web3.eth.getBlock(blockNum, true);
                if (fullBlock && fullBlock.transactions) {
                    setLatestTransactions(fullBlock.transactions.slice(0, 8));
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch blockchain data');
        }
        setLoading(false);
    }, [network]);

    // Block details
    const getBlock = useCallback(async (identifier) => {
        try {
            if (network === 'simulated') {
                const id = typeof identifier === 'string' && !identifier.startsWith('0x') ? BigInt(identifier) : identifier;
                return simRef.current.getBlock(id, true);
            } else {
                const id = typeof identifier === 'string' && !identifier.startsWith('0x') ? BigInt(identifier) : identifier;
                return await web3Ref.current.eth.getBlock(id, true);
            }
        } catch (err) {
            console.error('getBlock error:', err);
            return null;
        }
    }, [network]);

    // Transaction details
    const getTransaction = useCallback(async (hash) => {
        try {
            if (network === 'simulated') {
                const tx = simRef.current.getTransaction(hash);
                const receipt = simRef.current.getTransactionReceipt(hash);
                return { tx, receipt };
            } else {
                const tx = await web3Ref.current.eth.getTransaction(hash);
                let receipt = null;
                try { receipt = await web3Ref.current.eth.getTransactionReceipt(hash); } catch { }
                return { tx, receipt };
            }
        } catch (err) {
            console.error('getTransaction error:', err);
            return { tx: null, receipt: null };
        }
    }, [network]);

    // Address details
    const getAddressInfo = useCallback(async (address) => {
        try {
            if (network === 'simulated') {
                const balance = simRef.current.getBalance(address);
                const txCount = simRef.current.getTransactionCount(address);
                const txs = simRef.current.getTransactionsForAddress(address);
                return { balance, txCount, transactions: txs };
            } else {
                const balance = await web3Ref.current.eth.getBalance(address);
                const txCount = await web3Ref.current.eth.getTransactionCount(address);
                // For live networks, we can't easily get tx history without an indexer
                return { balance, txCount: BigInt(txCount), transactions: [] };
            }
        } catch (err) {
            console.error('getAddressInfo error:', err);
            return { balance: BigInt(0), txCount: BigInt(0), transactions: [] };
        }
    }, [network]);

    // Mine block (simulated only)
    const mineBlock = useCallback(() => {
        if (network !== 'simulated' || !simRef.current) return null;
        const block = simRef.current.mineBlock();
        fetchData();
        return block;
    }, [network, fetchData]);

    // Add pending tx (simulated only)
    const addPendingTx = useCallback((from, to, value) => {
        if (network !== 'simulated' || !simRef.current) return null;
        return simRef.current.addPendingTransaction(from, to, value);
    }, [network]);

    // Search
    const addSearch = useCallback((term) => {
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== term);
            const next = [term, ...filtered].slice(0, 8);
            localStorage.setItem('bp_recent_searches', JSON.stringify(next));
            return next;
        });
    }, []);

    const value = {
        network,
        setNetwork,
        loading,
        error,
        latestBlockNumber,
        latestBlocks,
        latestTransactions,
        gasPrice,
        getBlock,
        getTransaction,
        getAddressInfo,
        mineBlock,
        addPendingTx,
        fetchData,
        recentSearches,
        addSearch,
        isSimulated: network === 'simulated',
        networkInfo: NETWORKS[network],
    };

    return (
        <BlockchainContext.Provider value={value}>
            {children}
        </BlockchainContext.Provider>
    );
}
