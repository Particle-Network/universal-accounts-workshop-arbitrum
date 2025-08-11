# Workshop: Building with Universal Accounts on Arbitrum

This workshop demonstrates how to build a simple decentralized application (dApp) on Arbitrum that allows users to mint an NFT using Particle Network's Universal Accounts.

## Features

- Connect to the application.
- View your Universal Account addresses (EVM and Solana).
- See your aggregated balance across all supported chains.
- Mint a `ARBnft` on the Arbitrum mainnet with a single click.

## How it works

The application leverages Particle Network's Universal Account SDK to create and manage smart accounts for users. When a user wants to mint an NFT, the dApp creates a transaction that calls the `mint` function on the `ARBnft` smart contract deployed on Arbitrum. The user can pay for the gas fees on any chain where they have funds, and the Universal Account handles the cross-chain messaging and execution.

In this workshop, you'll learn how to integrate Particle Network's Universal Accounts into a Next.js application to create seamless, cross-chain experiences on Arbitrum.

We will start with a basic application that uses Particle's ConnectKit for wallet connection and progressively add Universal Account features to fetch balances, display smart account addresses, and send a transaction.

- **`workshop-starter`**: The initial state of the application. This is where you'll start coding.
- **`workshop-completed`**: The final, completed version of the application for your reference.

## Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or higher)
- A code editor (e.g., [VS Code](https://code.visualstudio.com/))
- A web browser (e.g., Chrome)

## 1. Getting Started

First, let's set up the starter project.

### Clone the Repository

If you haven't already, clone the workshop repository to your local machine.

### Configure Environment Variables

1.  Navigate to the `workshop-starter` directory.
2.  You'll find a file named `.env.example`. Rename it to `.env.local`.
3.  Open `.env.local` and fill in your Particle Network project credentials. You can get these from the [Particle Dashboard](https://dashboard.particle.network).

    ```
    NEXT_PUBLIC_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_CLIENT_KEY=YOUR_CLIENT_KEY
    NEXT_PUBLIC_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
    ```

### Install Dependencies and Run the App

Open your terminal in the `workshop-starter` directory and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see a simple dApp interface. Connect your wallet to see your address and the current chain ID.

## 2. Integrating Universal Accounts

Now, let's modify the starter app to use Universal Accounts. All our changes will be in `workshop-starter/app/page.tsx`.

### Step 2.1: Add Imports

First, import the necessary components from the `@particle-network/universal-account-sdk` and `ethers`.

```tsx
// Add these imports at the top of app/page.tsx
import {
  UniversalAccount,
  type IAssetsResponse,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";
import { Interface, parseEther, toBeHex } from "ethers";
import { useWallets } from "@particle-network/connectkit";
```

### Step 2.2: Initialize Universal Account

We need to create an instance of `UniversalAccount` when a user connects their wallet.

1.  **Add State Variables**: Add state to hold the Universal Account instance, smart account info, balances, and transaction status.

    ```tsx
    // Add these below the existing useState hooks
    const [universalAccountInstance, setUniversalAccountInstance] = useState<UniversalAccount | null>(null);
    const [accountInfo, setAccountInfo] = useState<{ ownerAddress: string; evmSmartAccount: string; solanaSmartAccount: string; } | null>(null);
    const [primaryAssets, setPrimaryAssets] = useState<IAssetsResponse | null>(null);
    const [txResult, setTxResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    ```

2.  **Initialize on Connect**: Use a `useEffect` hook to create a `UniversalAccount` instance when `address` and `isConnected` change.

    ```tsx
    // Add this useEffect hook
    useEffect(() => {
      if (isConnected && address) {
        const ua = new UniversalAccount({
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
          projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
          projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
          ownerAddress: address,
        });
        setUniversalAccountInstance(ua);
      } else {
        setUniversalAccountInstance(null);
      }
    }, [isConnected, address]);
    ```

### Step 2.3: Fetch Account Information

Once the Universal Account is initialized, we can fetch the user's smart account addresses and aggregated asset balances.

1.  **Fetch Smart Accounts**: Add a `useEffect` to get the user's EVM and Solana smart account addresses.

    ```tsx
    useEffect(() => {
      if (!universalAccountInstance || !address) return;
      const fetchSmartAccountAddresses = async () => {
        const options = await universalAccountInstance.getSmartAccountOptions();
        setAccountInfo({
          ownerAddress: address,
          evmSmartAccount: options.smartAccountAddress || "",
          solanaSmartAccount: options.solanaSmartAccountAddress || "",
        });
      };
      fetchSmartAccountAddresses();
    }, [universalAccountInstance, address]);
    ```

2.  **Fetch Primary Assets**: Add another `useEffect` to get the user's aggregated balance across all supported chains.

    ```tsx
    useEffect(() => {
      if (!universalAccountInstance || !address) return;
      const fetchPrimaryAssets = async () => {
        const assets = await universalAccountInstance.getPrimaryAssets();
        setPrimaryAssets(assets);
      };
      fetchPrimaryAssets();
    }, [universalAccountInstance, address]);
    ```

### Step 2.4: Send a Transaction

Let's implement the `runTransaction` function to mint an NFT on Berachain using the Universal Account.

```tsx
const App = () => {
  const [primaryWallet] = useWallets();
  const walletClient = primaryWallet?.getWalletClient();
  // ... other hooks

  const runTransaction = async () => {
    if (!universalAccountInstance || !walletClient) return;
    setIsLoading(true);
    setTxResult(null);

    const CONTRACT_ADDRESS = "0x702E0755450aFb6A72DbE3cAD1fb47BaF3AC525C"; // NFT contract on Arbitrum

    try {
      const contractInterface = new Interface(["function mint() external"]);

      const transaction = await universalAccountInstance.createUniversalTransaction({
        chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
        transactions: [{
          to: CONTRACT_ADDRESS,
          data: contractInterface.encodeFunctionData("mint"),
        }],
      });

      const signature = await walletClient.signMessage({ account: address as `0x${string}`, message: { raw: transaction.rootHash } });
      const result = await universalAccountInstance.sendTransaction(transaction, signature);

      setTxResult(`https://universalx.app/activity/details?id=${result.transactionId}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTxResult(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ... other code
};
```


## Setup

1. Clone this repository

```bash
git clone https://github.com/particle-network/universal-accounts-workshop.git
cd workshop-completed
```

2. Install dependencies

```bash
npm install or yarn install
```

3. Run the app

```bash
npm run dev or yarn dev
```
