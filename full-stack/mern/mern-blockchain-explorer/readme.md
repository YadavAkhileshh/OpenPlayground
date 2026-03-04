# 🌐 BlockPulse: Academic Blockchain Explorer

BlockPulse is a comprehensive, interactive blockchain explorer built with **React.js** and **Web3.js**. It's designed to provide users with a clear view of blockchain data while serving as an educational tool for understanding core blockchain concepts like blocks, transactions, gas, and hash functions.

## 🚀 Features

- **Real-time Blockchain Data**: Integrated with Ethereum Mainnet and Sepolia Testnet via public RPC nodes.
- **Interactive Simulation Mode**: A built-in sandbox environment where users can create transactions and mine blocks to see how they are processed.
- **Detailed Insights**:
    - **Dashboard**: High-level overview of the network (latest blocks, transactions, gas price).
    - **Block Details**: Deep dive into specific block data (hash, miner, timestamp, gas limit).
    - **Transaction Details**: Verification of value transfers, gas consumption, and transaction status.
    - **Address Profiles**: View balances and transaction history for any wallet address.
- **Educational Tooltips**: Interactive "InfoTips" that explain technical terms as you navigate.
- **Glossary**: A centralized hub for learning blockchain terminology.
- **Modern UI/UX**: Premium design with dark/light mode support, glassmorphism effects, and smooth animations using Framer Motion.

## 📂 Project Structure

```text
public/Day 114/
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx      # Navigation and network switcher
│   │   ├── InfoTip.jsx     # Contextual educational components
│   │   ├── SearchBar.jsx   # Global search for blocks/tx/address
│   │   └── Glossary.jsx    # terminology educational panel
│   ├── context/            # Context API for state management
│   │   ├── BlockchainContext.jsx # Core blockchain data & simulation logic
│   │   └── ThemeContext.jsx      # UI Theme state (Light/Dark)
│   ├── pages/              # Main route views
│   │   ├── Dashboard.jsx   # Overview page
│   │   ├── BlockDetails.jsx# Individual block view
│   │   ├── TxDetails.jsx   # Transaction details view
│   │   └── AddressDetails.jsx # Wallet/Contract profile
│   ├── utils/              # Helper functions & data
│   │   ├── web3.js         # Web3 instance configuration
│   │   ├── simulator.js    # Logic for the Sandbox blockchain
│   │   └── glossary.js     # Data for educational tooltips
│   ├── App.jsx             # Main router & layout structure
│   ├── main.jsx            # Entry point
│   └── index.css           # Global design system & animations
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite configuration
```

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Blockchain Interface**: Web3.js
- **Styling**: Vanilla CSS (Custom Design System)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Date Utilities**: date-fns
