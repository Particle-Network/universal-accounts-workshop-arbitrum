"use client";

import { ConnectButton, useAccount } from "@particle-network/connectkit";
import { useState, useEffect } from "react";

const App = () => {
  const { address, isConnected, chainId } = useAccount();
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
    }
  };

  // Format address to show truncated version
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

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
                <button
                  onClick={copyAddress}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-gray-200 text-sm mt-1 break-all">
                {formatAddress(address as string)}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="text-sm text-gray-300 font-medium">Network</div>
              <div className="flex items-center mt-1">
                <div className="h-3 w-3 bg-green-400 rounded-full mr-2"></div>
                <div className="text-gray-200">Chain ID: {chainId}</div>
              </div>
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
