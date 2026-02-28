# 🛠️ Localhost Setup Guide

Follow these steps to get **BlockPulse** running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

## 🚀 Getting Started

### 1. Clone the Repository
If you haven't already, clone the main repository:
```bash
git clone https://github.com/your-username/100-Days-Of-Web-Development-ECWoC26.git
cd 100-Days-Of-Web-Development-ECWoC26
```

### 2. Navigate to the Project Folder
Go to the specifically designated folder for Day 114:
```bash
cd "public/Day 114"
```

### 3. Install Dependencies
Install all required npm packages:
```bash
npm install
```

### 4. Run the Development Server
Start the local Vite development server:
```bash
npm run dev
```

### 5. Access the Application
Once the server is running, you should see an output like:
```text
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open your browser and navigate to `http://localhost:5173`.

## ⚙️ Configuration (Optional)

### Using Custom RPC Nodes
By default, the application uses public RPC nodes for Ethereum Mainnet and Sepolia. If you want to use your own (e.g., from Infura or Alchemy) to avoid rate limits:

1. Open `src/utils/web3.js`.
2. Replace the `rpc` URLs in the `NETWORKS` object with your custom endpoints.

```javascript
// src/utils/web3.js
export const NETWORKS = {
    mainnet: {
        name: 'Ethereum Mainnet',
        rpc: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID', // Replace here
        // ...
    },
    // ...
};
```

## 🧪 Running Tests
(Note: If you add tests in the future)
```bash
npm test
```

## 🏗️ Building for Production
To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` folder.
