"use client";

import { ConnectButton, useAccount } from "@particle-network/connectkit";
import { useState, useEffect } from "react";

// Universal Accounts imports
import { UniversalAccount, IAssetsResponse } from "@GDdark/universal-account";

const App = () => {
  const { address, isConnected } = useAccount();

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
        projectId: process.env.NEXT_PUBLIC_UA_PROJECT_ID || "",
        ownerAddress: address,
        // If not set it will use auto-slippage
        tradeConfig: {
          slippageBps: 100, // 1% slippage tolerance
          universalGas: true, // Enable gas abstraction
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-md p-6 space-y-6 border border-gray-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-400">
            Universal Accounts
          </h1>
          <h2 className="text-xl font-medium text-gray-300">Workshop</h2>
        </div>

        <div className="flex justify-center mt-6">
          <ConnectButton />
        </div>

        {isConnected && (
          <div className="space-y-4 mt-6">
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300 font-medium">
                  Wallet Address
                </div>
              </div>
              <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                {formatAddress(address as string)}
              </div>
            </div>

            {accountInfo && (
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-300 font-medium">
                  EVM Smart Account Address
                </div>
                <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                  {formatAddress(accountInfo.evmSmartAccount)}
                </div>
              </div>
            )}

            {accountInfo && (
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-300 font-medium">
                  SOL Smart Account Address
                </div>
                <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                  {formatAddress(accountInfo.solanaSmartAccount)}
                </div>
              </div>
            )}

            {/* Balance */}
            <div className="bg-gray-700   rounded-lg p-4 border border-gray-600">
              <h2 className="text-sm text-gray-300 font-medium">
                Universal Balance
              </h2>
              <h3 className="text-xs text-gray-300 font-medium">
                Aggregated primary assets from every chain
              </h3>
              <p className="text-lg font-bold text-gray-200">
                ${primaryAssets?.totalAmountInUSD.toFixed(4) || "0.00"}
              </p>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-gray-400 text-sm mt-4">
            Connect your wallet to view account details
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
