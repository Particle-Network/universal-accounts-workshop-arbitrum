# Workshop: Building with Universal Accounts on Berachain

Welcome! In this workshop, you'll learn how to integrate Particle Network's Universal Accounts into a Next.js application to create seamless, cross-chain experiences on Berachain.

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

Let's implement the `handleDeposit` function to send a transaction on Berachain using the Universal Account.

```tsx
const App = () => {
  const [primaryWallet] = useWallets();
  const walletClient = primaryWallet?.getWalletClient();
  // ... other hooks

  const handleDeposit = async () => {
    if (!universalAccountInstance || !walletClient) return;
    setIsLoading(true);
    setTxResult(null);

    const CONTRACT_ADDRESS = "0xce7007e421A84b3f73fb6A230b2E6298f0bbbcbe"; // Workshop contract

    try {
      const contractInterface = new Interface(["function deposit(string message) external payable"]);
      const depositAmount = "0.01"; // 0.01 BERA
      const depositMessage = "gm from universal account";

      const transaction = await universalAccountInstance.createUniversalTransaction({
        chainId: CHAIN_ID.BERACHAIN_MAINNET,
        transactions: [{
          to: CONTRACT_ADDRESS,
          data: contractInterface.encodeFunctionData("deposit", [depositMessage]),
          value: toBeHex(parseEther(depositAmount)),
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

## 3. Update the UI

Now, let's display the information we're fetching and hook up our transaction button.

1.  **Display Smart Accounts**: In the "Account Details" section, add blocks to show the EVM and Solana smart accounts.

    ```jsx
    {/* Replace the existing Account Details with this */}
    <div className="space-y-4">
      {/* Wallet Address */}
      {/* ... existing wallet address div ... */}

      {/* EVM Smart Account */}
      {accountInfo && (
        <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
          <div className="text-sm text-gray-300 font-medium">EVM Smart Account</div>
          <div className="font-mono text-gray-200 text-sm mt-1 break-all">{formatAddress(accountInfo.evmSmartAccount)}</div>
        </div>
      )}
      {/* SOL Smart Account */}
      {accountInfo && (
        <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
          <div className="text-sm text-gray-300 font-medium">SOL Smart Account</div>
          <div className="font-mono text-gray-200 text-sm mt-1 break-all">{formatAddress(accountInfo.solanaSmartAccount)}</div>
        </div>
      )}
    </div>
    ```

2.  **Display Universal Balance**: Update the "Financial Overview" to show the fetched balance.

    ```jsx
    {/* Find the placeholder <p> tag and replace it */}
    <p className="text-2xl font-bold text-[#FACC15] mt-3">
      ${primaryAssets?.totalAmountInUSD.toFixed(4) || "0.00"}
    </p>
    ```

3.  **Update Action Button**: Modify the "Send Transaction" button to call `handleDeposit` and show a loading/result state.

    ```jsx
    {/* Replace the existing button and add the result display */}
    <button
      onClick={handleDeposit}
      disabled={isLoading}
      className="w-full py-3 px-6 rounded-lg font-bold text-lg text-gray-900 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#FACC15] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Sending..." : "Send Transaction"}
    </button>
    {txResult && (
      <div className="mt-4 text-center text-sm">
        {txResult.startsWith("Error") ? (
          <p className="text-red-400 break-all">{txResult}</p>
        ) : (
          <a href={txResult} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline break-all">
            View Transaction on Explorer
          </a>
        )}
      </div>
    )}
    ```

## 4. Final Configuration

Ensure your `workshop-starter/app/ConnectKit.tsx` is configured for **Berachain**.

```tsx
// In app/ConnectKit.tsx
import { berachain } from "@particle-network/connectkit/chains";

// ...

const config = createConfig({
  // ... other config
  chains: [berachain],
});
```

## Congratulations!

You've successfully integrated Universal Accounts into a Next.js application. You can now fetch cross-chain balances, see smart account addresses, and send transactions on Berachain through a single, unified interface.

For more information, check out the [official Particle Network documentation](https://docs.particle.network/universal-account).

This is a basic app that uses the Particle ConnectKit to connect to a wallet and display the connected wallet address and the Universal Account addresses, unified balance and send a Universal Transaction. This is the completed app for the Universal Accounts workshop. 

## Prerequisites

- A Particle Connect porject set up in the [Particle Dashboard](https://dashboard.particle.network/)
- A WalletConnect project set up in the [WalletConnect Dashboard](https://cloud.reown.com/)
- A Universal Accounts project ID. 

> The Universal Accounts SDK is still private, contact the Particle Team to be considered for [early access](https://form.typeform.com/to/xH4L4fJG).

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
