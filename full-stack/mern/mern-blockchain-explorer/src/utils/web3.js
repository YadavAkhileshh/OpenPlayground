import Web3 from 'web3';

export const NETWORKS = {
    mainnet: {
        name: 'Ethereum Mainnet',
        rpc: 'https://ethereum-rpc.publicnode.com',
        // chainId: 1,
        symbol: 'ETH',
        explorer: 'https://etherscan.io',
    },
    sepolia: {
        name: 'Sepolia Testnet',
        rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
        // chainId: 11155111,
        symbol: 'SepoliaETH',
        explorer: 'https://sepolia.etherscan.io',
    },
    simulated: {
        name: 'Simulated Mode',
        rpc: null,
        symbol: 'SIM-ETH',
        explorer: null,
    },
};

export function createWeb3(networkKey) {
    const network = NETWORKS[networkKey];
    if (!network || !network.rpc) return null;
    return new Web3(network.rpc);
}

export const formatAddress = (address) => {
    if (!address) return '—';
    return `${address.slice(0, 8)}…${address.slice(-6)}`;
};

export const formatEther = (wei) => {
    if (wei === undefined || wei === null) return '0';
    try {
        return Web3.utils.fromWei(String(wei), 'ether');
    } catch {
        return '0';
    }
};

export const formatGwei = (wei) => {
    if (wei === undefined || wei === null) return '0';
    try {
        return Web3.utils.fromWei(String(wei), 'gwei');
    } catch {
        return '0';
    }
};

export const bn = (value) => {
    try {
        return BigInt(value);
    } catch {
        return BigInt(0);
    }
};
