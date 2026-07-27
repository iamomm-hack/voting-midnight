# Midnight Privacy Voting DApp

A privacy-preserving decentralized voting application built on the Midnight Network using Zero-Knowledge (ZK) smart contracts for the **Rise In Level 1 Midnight Builder Challenge**.

## Contract Address

| Network | Contract Address | Status |
|---------|------------------|--------|
| Preprod Testnet | `0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0` | Verified |

```env
CONTRACT_ADDRESS=0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0
```

## Features

- **Anonymous Voting**: Users cast votes without revealing their wallet identity or secret credentials on-chain.
- **Verifiable Vote Tallies**: Public ledger accurately tallies YES and NO votes while keeping individual choices private.
- **Double-Vote Prevention**: Uses persistent cryptographic nullifiers to ensure each voter casts only one vote per sequence.
- **Interactive CLI & Web Interface**: Complete CLI launcher and React browser UI for interaction with testnet nodes and proof servers.

## What This Project Does

This DApp enables community members to participate in governance proposals without exposing their identities. Voters generate local Zero-Knowledge proofs that prove they hold a valid secret key and haven't voted yet, while the smart contract safely updates public tallies on the Midnight testnet.

## Privacy Model

- **Public Information**: Proposal Title, Total YES Votes, Total NO Votes, Total Voters count, State (OPEN/ENDED), Admin address, and Transaction hashes.
- **Private Information**: Voter secret keys (`localSecretKey`), individual voting choices, and local private state.
- **ZK Guarantees**: Users disclose only the validity of their vote (`disclose(voteChoice)`) without revealing their private secret key or linking their vote to their public wallet address.

## Tech Stack

- **Smart Contract Language**: Compact (`0.31.0`)
- **Blockchain Platform**: Midnight Testnet (Preprod)
- **SDK & Client Libraries**: `@midnight-ntwrk/midnight-js`, `@midnight-ntwrk/wallet-sdk`
- **Proof Generation**: Midnight Proof Server (Docker container port 6300)
- **CLI & UI**: TypeScript, Node.js v24+, React, Vite, Material UI
- **Proof Generation**: Midnight Proof Server (Docker container)
- **CLI & UI**: TypeScript, Node.js v24+, React, Vite

## Folder Structure

```
voting-dapp/
├── contract/               # Compact smart contract source (voting.compact) and compilation output
│   └── src/                # Contract circuits, witness declarations, and TypeScript bindings
├── api/                    # Core VotingAPI, contract state observables, and provider abstractions
├── voting-cli/             # Command-line interface launcher for interactive wallet & voting actions
└── voting-ui/              # Modern React web application interface for Midnight Lace wallet users
```

## Prerequisites

- **Node.js**: `v24.11.1` or higher
- **Docker Desktop**: Running for proof server container execution
- **Compact Compiler**: `compactc` version `0.31.0` or higher
- **Browser Extension**: Lace Wallet (for Web UI testing)

## Installation

```bash
npm install
```

This repository uses NPM Workspaces. Dependencies for `contract`, `api`, `voting-cli`, and `voting-ui` are resolved automatically from the root.

## Compile

To compile the Compact contract and generate Zero-Knowledge circuits:

```bash
cd contract
npm run compact
npm run build
cd ..
```

## Build

To build the API, CLI, and Web UI packages:

```bash
# Build API
cd api
npm run build
cd ..

# Build CLI
cd voting-cli
npm run build
cd ..

# Build Web UI
cd voting-ui
npm run build
cd ..
```

## Deployment & Verification

To run the interactive CLI launcher and deploy or connect to a contract on Midnight Preprod testnet:

```bash
NODE_OPTIONS="--max-old-space-size=8192" cd voting-cli && npm run preprod-remote
```

To launch the local Web Application UI:

```bash
cd voting-ui && npm run dev
```

Open `http://localhost:5173/` in your browser to view the interactive Voting DApp governance dashboard.
