/* eslint-disable @next/next/no-img-element */
"use client";
import {
  ConnectButton,
  useAccount,
  useWallets,
  useDisconnect,
} from "@particle-network/connectkit";
import { useState, useEffect } from "react";
// Universal Accounts imports
import {
  UniversalAccount,
  type IAssetsResponse,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";
import { Interface } from "ethers";

const App = () => {
  // Get wallet from Particle Connect
  const [primaryWallet] = useWallets();
  const walletClient = primaryWallet?.getWalletClient();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [universalAccountInstance, setUniversalAccountInstance] =
    useState<UniversalAccount | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    ownerAddress: string;
    evmSmartAccount: string;
    solanaSmartAccount: string;
  } | null>(null);

  // Format address to show truncated version
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // === Initialize UniversalAccount ===
  useEffect(() => {
    if (isConnected && address) {
      // Create new UA instance when user connects
      const ua = new UniversalAccount({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        projectClientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
        projectAppUuid: process.env.NEXT_PUBLIC_APP_ID!,
        ownerAddress: address,
        //rpcUrl: "https://universal-rpc-staging.particle.network",
        // If not set it will use auto-slippage
        tradeConfig: {
          slippageBps: 100, // 1% slippage tolerance
          universalGas: false, // Prioritize PARTI token to pay for gas
          //usePrimaryTokens: [SUPPORTED_TOKEN_TYPE.SOL], // Specify token to use as source (only for swaps)
        },
      });
      console.log("UniversalAccount initialized:", ua);
      setUniversalAccountInstance(ua);
    } else {
      // Reset UA when user disconnects
      setUniversalAccountInstance(null);
    }
  }, [isConnected, address]);

  // === Fetch Smart Account Addresses ===
  useEffect(() => {
    if (!universalAccountInstance || !address) return;
    const fetchSmartAccountAddresses = async () => {
      // Get smart account addresses for both EVM and Solana
      const options = await universalAccountInstance.getSmartAccountOptions();
      setAccountInfo({
        ownerAddress: address, // EOA address
        evmSmartAccount: options.smartAccountAddress || "", // EVM smart account
        solanaSmartAccount: options.solanaSmartAccountAddress || "", // Solana smart account
      });
      console.log("Smart Account Options:", options);
    };
    fetchSmartAccountAddresses();
  }, [universalAccountInstance, address]);

  // Aggregated balance across all chains
  const [primaryAssets, setPrimaryAssets] = useState<IAssetsResponse | null>(
    null
  );
  const [txResult, setTxResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runTransaction = async () => {
    if (!universalAccountInstance) return;
    setIsLoading(true);
    setTxResult(null);

    const CONTRACT_ADDRESS = "0x702E0755450aFb6A72DbE3cAD1fb47BaF3AC525C"; // NFT contract on Arbitrum

    try {
      const contractInterface = new Interface(["function mint() external"]);

      const transaction =
        await universalAccountInstance.createUniversalTransaction({
          chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
          expectTokens: [],
          transactions: [
            {
              to: CONTRACT_ADDRESS,
              data: contractInterface.encodeFunctionData("mint"),
              //  value: "0x0",
            },
          ],
        });

      const signature = await walletClient?.signMessage({
        account: address as `0x${string}`,
        message: { raw: transaction.rootHash },
      });

      const result = await universalAccountInstance.sendTransaction(
        transaction,
        signature
      );

      setTxResult(
        `https://universalx.app/activity/details?id=${result.transactionId}`
      );
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTxResult(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // === Fetch Primary Assets ===
  useEffect(() => {
    if (!universalAccountInstance || !address) return;
    const fetchPrimaryAssets = async () => {
      // Get aggregated balance across all chains
      // This includes ETH, USDC, USDT, etc. on various chains
      const assets = await universalAccountInstance.getPrimaryAssets();
      setPrimaryAssets(assets);
    };
    fetchPrimaryAssets();
  }, [universalAccountInstance, address]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0A1A] to-[#1A0A2A] p-4 font-sans overflow-hidden">
      {/* Particle background effect */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, #8B5CF6 0%, transparent 30%), radial-gradient(circle at 80% 20%, #FACC15 0%, transparent 30%)",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-6xl bg-[#1F1F3A]/80 rounded-xl shadow-2xl p-8 space-y-8 border border-[#3A3A5A] backdrop-blur-sm">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
          {/* Logos and Title */}
          <div className="flex flex-col items-center md:items-start space-y-2 md:space-y-0 md:flex-row md:gap-6">
            <div className="flex gap-4">
              <img
                src="https://pbs.twimg.com/profile_images/1623919818108997633/o2JfMaqi_400x400.png"
                alt="Particle Network Logo"
                className="h-12 w-12"
              />
              <img
                src="https://imgs.search.brave.com/-FBJeqhdu6lfe_nQnYUTvRBT2So_g8ySIq3TBPoPjvc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZXMu/Y29pbnBhcGVyLmNv/bS9jb2lucGFwZXIv/Zl93ZWJwLGNfbGlt/aXQsd182NDAscV9h/dXRvOmdvb2QvYXJi/X2ZiYTkyYjI1YmMu/cG5n"
                alt="Arbitrum Logo"
                className="h-12 w-12"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-[#C084FC] drop-shadow-lg">
                Universal Accounts on Arbitrum
              </h1>
              <h2 className="text-2xl font-semibold text-gray-300">Workshop</h2>
            </div>
          </div>
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Left Column: Account Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-200 border-b border-[#4A4A6A] pb-2">
                Account Details
              </h3>
              <div className="space-y-4">
                {" "}
                {/* Changed from grid to vertical stack */}
                {/* Wallet Address */}
                <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
                  <div className="text-sm text-gray-300 font-medium">
                    Wallet Address
                  </div>
                  <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                    {formatAddress(address as string)}
                  </div>
                </div>
                {/* EVM Smart Account */}
                {accountInfo && (
                  <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
                    <div className="text-sm text-gray-300 font-medium">
                      EVM Smart Account Address
                    </div>
                    <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                      {formatAddress(accountInfo.evmSmartAccount)}
                    </div>
                  </div>
                )}
                {/* SOL Smart Account */}
                {accountInfo && (
                  <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
                    <div className="text-sm text-gray-300 font-medium">
                      SOL Smart Account Address
                    </div>
                    <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                      {formatAddress(accountInfo.solanaSmartAccount)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {isConnected && (
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Financial Overview & Actions */}
            <div className="space-y-6">
              {/* Universal Balance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-[#4A4A6A] pb-2">
                  Financial Overview
                </h3>
                <div className="bg-[#2A2A4A] rounded-lg p-5 border border-[#4A4A6A] shadow-inner">
                  <div>
                    <h2 className="text-sm text-gray-300 font-medium">
                      Universal Balance
                    </h2>
                    <h3 className="text-xs text-gray-400 font-medium mt-1">
                      Aggregated primary assets from every chain
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-[#FACC15] mt-3">
                    ${primaryAssets?.totalAmountInUSD.toFixed(4) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Transaction Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-[#4A4A6A] pb-2">
                  Actions
                </h3>
                <div className="bg-[#2A2A4A] rounded-lg p-5 border border-[#4A4A6A] shadow-inner flex flex-col items-center gap-4">
                  <p className="text-gray-300 text-sm text-center">
                    Mint an NFT on Arbitrum holding tokens anywhere else
                  </p>
                  <button
                    onClick={runTransaction}
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-lg font-bold text-lg text-gray-900 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#FACC15] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Minting..." : "Mint NFT"}
                  </button>
                  {txResult && (
                    <div className="mt-4 text-center text-sm">
                      {txResult.startsWith("Error") ? (
                        <p className="text-red-400 break-all">{txResult}</p>
                      ) : (
                        <a
                          href={txResult}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline break-all"
                        >
                          View Transaction on Explorer
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-gray-400 text-base mt-4">
            Connect your wallet to view account details
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
