import type { Metadata } from "next";

import "./globals.css";

// Import the ConnectKitProvider configuration (exported as ParticleConnectKit)
import { ParticleConnectkit } from "./ConnectKit";

export const metadata: Metadata = {
  title: "Particle Connect",
  description: "Demo showcasing a quickstart for Particle Connect 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParticleConnectkit>{children}</ParticleConnectkit>
      </body>
    </html>
  );
}
