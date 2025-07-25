/* eslint-disable @next/next/no-img-element */
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
                  src="https://imgs.search.brave.com/Y9vvJZuEnDqsz_n9zWu_62qnHYkje9Uwt8F5CGTmXws/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcnlw/dG9hc3QuZnIvd3At/Y29udGVudC91cGxv/YWRzLzIwMjQvMDIv/YmVyYWNoYWluLWJl/cmEtbG9nby5wbmc"
                  alt="Berachain Logo"
                  className="h-12 w-12"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-[#C084FC] drop-shadow-lg">
                  Universal Accounts on Berachain
                </h1>
                <h2 className="text-2xl font-semibold text-gray-300">
                  Workshop
                </h2>
              </div>
            </div>
          </div>
          {/* Connect Button */}
          <div className="flex justify-center md:justify-end mt-6 md:mt-0">
            <ConnectButton />
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
                {/* Wallet Address */}
                <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 font-medium">
                      Wallet Address
                    </div>
                    <button
                      onClick={copyAddress}
                      className="text-xs text-[#FACC15] hover:text-[#EAB308] transition-colors font-semibold"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-gray-200 text-sm mt-2 break-all">
                    {formatAddress(address as string)}
                  </div>
                </div>
                {/* Network */}
                <div className="bg-[#2A2A4A] rounded-lg p-4 border border-[#4A4A6A] shadow-inner">
                  <div className="text-sm text-gray-300 font-medium">
                    Network
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <div className="text-gray-200">Chain ID: {chainId}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Overview & Actions */}
            <div className="space-y-6">
              {/* Universal Balance Section (Placeholder for this app) */}
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
                    $0.00
                  </p>{" "}
                  {/* Placeholder value as this app doesn't fetch primaryAssets */}
                </div>
              </div>

              {/* Transaction Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-[#4A4A6A] pb-2">
                  Actions
                </h3>
                <div className="bg-[#2A2A4A] rounded-lg p-5 border border-[#4A4A6A] shadow-inner flex flex-col items-center gap-4">
                  <p className="text-gray-300 text-sm text-center">
                    Ready to send a transaction?
                  </p>
                  <button className="w-full py-3 px-6 rounded-lg font-bold text-lg text-gray-900 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#FACC15] transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                    Send Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-gray-400 text-base mt-4">
            Connect your wallet to view account details
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
