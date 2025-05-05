# Universal Accounts Starter App

This is a basic app that uses the Particle ConnectKit to connect to a wallet and display the connected wallet address and chain id. This is the started app for the Universal Accounts workshop. 

The user will be guided through the workshop to add support for Universal Accounts to this app.

## Prerequisites

- A Particle Connect porject set up in the [Particle Dashboard](https://dashboard.particle.network/)
- A WalletConnect project set up in the [WalletConnect Dashboard](https://cloud.reown.com/)

## Setup

1. Clone this repository

```bash
git clone https://github.com/particle-network/universal-accounts-workshop.git
cd workshop-starter
```

2. Install dependencies

```bash
npm install or yarn install
```

3. Set up the Particle Connect project

Copy the .env.sample file to .env and fill in the values
```bash
cp .env.sample .env
```

4. Run the app

```bash
npm run dev or yarn dev
```
