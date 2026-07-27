# 🌑 Midnight Privacy Voting DApp

A privacy-preserving decentralized governance application built on the **Midnight Network** using Zero-Knowledge (ZK) smart contracts. Individual voting choices remain completely private while aggregate results are publicly verifiable on-chain.

![Governance Dashboard](ss/Screenshot%202026-07-27%20171837.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Privacy Model](#privacy-model)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Smart Contract Compilation](#smart-contract-compilation)
- [Build](#build)
- [Deployment](#deployment)
- [Running the Web UI](#running-the-web-ui)
- [Contract Details](#contract-details)
- [How It Works](#how-it-works)
- [License](#license)

---

## Overview

This DApp enables community members to participate in on-chain governance proposals **without exposing their identities**. Voters generate local Zero-Knowledge proofs that prove they hold a valid secret key and haven't voted yet, while the Compact smart contract safely updates public tallies on the Midnight Preprod testnet.

### Key Features

- **🔒 Anonymous Voting** — Users cast votes without revealing their wallet identity or secret credentials on-chain
- **✅ Verifiable Tallies** — Public ledger accurately tallies YES/NO votes while keeping individual choices private
- **🚫 Double-Vote Prevention** — Cryptographic nullifiers via `persistentHash` ensure each voter casts only one vote
- **🌐 Multi-Interface** — Complete CLI launcher + institutional-grade React web UI
- **💳 Native Wallet Support** — Lace Wallet & 1AM Wallet integration via `window.midnight` API

---

## Screenshots

### Governance Dashboard — Proposals View
The main dashboard displays active governance proposals with real-time voting results, quorum tracking, and ZK circuit status.

![Proposals View](ss/Screenshot%202026-07-27%20171837.png)

### Wallet Connection
Native support for Midnight Lace Wallet and 1AM Wallet browser extensions with auto-detection.

![Wallet Selector](ss/Screenshot%202026-07-27%20171913.png)

### Wallet Integration with Dashboard
Connect wallet overlay showing detected browser extensions alongside the governance interface.

![Wallet Integration](ss/Screenshot%202026-07-27%20173301.png)

### On-Chain Activity Feed
Real-time feed of verified ZK proof submissions, voting period state transitions, and proposal creation events.

![Activity View](ss/Screenshot%202026-07-27%20171851.png)

### Technical Documentation
Institutional-grade specifications covering ZK privacy model, Compact circuit logic, testnet infrastructure endpoints, and wallet integration flow.

![Documentation View](ss/Screenshot%202026-07-27%20171905.png)

---

## Privacy Model

| Category | Data | Visibility |
|----------|------|------------|
| **Public State** | Proposal title, YES/NO vote counts, voter count, voting state, admin address | On-chain, visible to all |
| **Private State** | Voter secret key (`localSecretKey`), individual vote choice, wallet credentials | Local browser memory only |
| **Disclosed** | Vote validity proof, voter public key (derived nullifier) | ZK proof output only |

### ZK Guarantees

- Vote choice is encrypted and **never leaves the voter's device**
- Voter identity is **not disclosed** on-chain
- ZK proof is generated **locally** before submission
- Aggregate tally is **publicly verifiable** by any observer
- Nullifier prevents double-voting **without revealing identity**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser / CLI                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Lace Wallet │  │  React UI    │  │    CLI Launcher        │  │
│  │ / 1AM Wallet│  │  (Vite+MUI)  │  │  (Node.js + ts-node)   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          │                                       │
│              ┌───────────▼───────────┐                           │
│              │     VotingAPI         │                           │
│              │  (api/ package)       │                           │
│              └───────────┬───────────┘                           │
└──────────────────────────┼───────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
  ┌───────▼──────┐ ┌──────▼───────┐ ┌──────▼──────┐
  │  Proof Server│ │ Indexer      │ │  RPC Node   │
  │  (Docker)    │ │ (GraphQL)    │ │  (Substrate)│
  │  :6300       │ │ preprod.mn   │ │  preprod.mn │
  └──────────────┘ └──────────────┘ └─────────────┘
                           │
               ┌───────────▼───────────┐
               │  Midnight Blockchain  │
               │   (Preprod Testnet)   │
               └───────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract Language | Compact `v0.31.0` |
| Blockchain | Midnight Preprod Testnet |
| SDK | `@midnight-ntwrk/midnight-js` `v4.1.1` |
| Wallet SDK | `@midnight-ntwrk/wallet-sdk` `v1.0.0` |
| Proof Server | Midnight Docker container (port `6300`) |
| Frontend | React 19, Vite 8, Material UI 6 |
| CLI | TypeScript, Node.js v24+, ts-node |
| State Management | RxJS Observables |

---

## Project Structure

```
midnight/mid/
├── contract/                   # Compact smart contract source & compilation output
│   └── src/
│       ├── managed/voting/     # Compiled ZKIR, proving keys, verifier keys
│       └── witnesses.ts        # TypeScript witness declarations
├── api/                        # VotingAPI — deploy, join, state observables, provider types
│   └── src/
│       └── index.ts            # Core API exports (VotingAPI, providers, private state)
├── voting-cli/                 # CLI launcher for wallet setup, deployment, and voting
│   └── src/
│       ├── config.ts           # Environment configs (Standalone, Preview, Preprod)
│       ├── generate-dust.ts    # NIGHT → DUST gas token conversion
│       ├── wallet-utils.ts     # Wallet balance polling & fund detection
│       ├── launcher/
│       │   ├── preprod.ts      # Interactive Preprod deployment launcher
│       │   └── deploy-direct.ts# Non-interactive direct deployment script
│       └── proof-server.yml    # Docker Compose for local proof server
├── voting-ui/                  # React web application
│   └── src/
│       ├── App.tsx             # Root component with tab navigation
│       ├── config/
│       │   ├── tokens.ts       # Graphite design system tokens
│       │   └── theme.ts        # MUI theme configuration
│       └── components/
│           ├── TopNavigation.tsx      # Navigation bar with wallet connector
│           ├── GovernanceOverview.tsx  # Hero section with network stats
│           ├── Board.tsx              # Proposal card with voting panel
│           ├── VotingPanel.tsx        # Vote casting with wallet approval modal
│           ├── ResultsVisualization.tsx# Real-time vote tally bar chart
│           ├── OnChainActivity.tsx    # ZK proof verification event feed
│           └── DocsView.tsx           # Technical specification documentation
├── ss/                         # Application screenshots
├── package.json                # Root workspace configuration
└── README.md
```

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | `≥ v24.11.1` | Runtime |
| npm | `≥ v10` | Package management |
| Docker Desktop | Latest | Proof server container |
| Compact Compiler | `v0.31.0` | Smart contract compilation |
| Lace Wallet Extension | Latest | Browser wallet (Web UI) |

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd midnight/mid

# Install all workspace dependencies
npm install
```

> This repository uses **NPM Workspaces**. Dependencies for `contract`, `api`, `voting-cli`, and `voting-ui` are resolved automatically from the root.

---

## Smart Contract Compilation

Compile the Compact voting contract and generate Zero-Knowledge circuits:

```bash
cd contract
npm run compact    # Compile voting.compact → ZKIR + proving keys
npm run build      # Generate TypeScript bindings
cd ..
```

**Output:** `contract/src/managed/voting/` — contains compiled ZKIR assets, proving keys, and verifier keys.

---

## Build

Build all workspace packages:

```bash
# Build everything
npm run build

# Or build individually:
npm run build --workspace=@midnight-ntwrk/voting-api
npm run build --workspace=@midnight-ntwrk/voting-cli
npm run build --workspace=@midnight-ntwrk/voting-ui
```

---

## Deployment

### 1. Start the Proof Server

```bash
cd voting-cli
docker compose -f proof-server.yml up -d
```

Verify it's running at `http://localhost:6300/health`.

### 2. Fund Your Wallet

Visit the **[Midnight Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)** and request 1000 tNight tokens for your wallet address.

### 3. Deploy the Contract

**Option A — Non-interactive (recommended):**

```bash
npm run deploy-direct
```

This auto-generates a fresh wallet, requests faucet funding, converts NIGHT → DUST, and deploys.

**Option B — Interactive CLI:**

```bash
cd voting-cli
NODE_OPTIONS="--max-old-space-size=8192" npm run preprod-remote
```

Follow the interactive prompts to:
1. Build or restore a wallet from seed
2. Deploy or connect to a voting contract
3. Cast votes and manage proposals

### Deployment Flow

```
Fund Wallet (tNight) → Generate DUST Gas → Deploy ZK Contract → Contract Address
```

> **Note:** The `--max-old-space-size=8192` flag is required for ZK proof generation memory.

---

## Running the Web UI

```bash
cd voting-ui
npm run dev
```

Open **http://localhost:5173/** in your browser to access the governance dashboard.

### UI Navigation

| Tab | Description |
|-----|-------------|
| **Proposals** | Active governance proposals, voting panel, real-time results |
| **Activity** | On-chain ZK proof verification event feed |
| **Docs** | Technical specification — ZK privacy model, Compact circuits, testnet endpoints |

---

## Contract Details

| Field | Value |
|-------|-------|
| **Network** | Midnight Preprod Testnet |
| **Contract Address** | `0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0` |
| **RPC Node** | `https://rpc.preprod.midnight.network` |
| **Indexer GraphQL** | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| **Indexer WebSocket** | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| **Proof Server** | `http://localhost:6300` (Docker) |
| **Faucet** | `https://midnight-tmnight-preprod.nethermind.dev/` |

---

## How It Works

### Compact Circuit (`voting.compact`)

```compact
export circuit castVote(voteChoice: Boolean): [] {
  assert(state == VotingState.VOTING_OPEN);
  const voterPk = disclose(voterPublicKey(localSecretKey()));
  if (disclose(voteChoice)) yesVotes.increment(1);
}
```

### Voting Flow

1. **Connect Wallet** — Select Lace or 1AM Wallet from the navigation bar
2. **Select Proposal** — View active governance proposals and their current results
3. **Cast Vote** — Choose FOR or AGAINST and confirm in the approval modal
4. **ZK Proof Generation** — A zero-knowledge proof is generated locally in your browser
5. **On-Chain Submission** — The proof is submitted to the Midnight blockchain
6. **Tally Update** — Public vote counts update without revealing individual choices

### Token Model

| Token | Purpose |
|-------|---------|
| **NIGHT** | Base token received from the faucet |
| **DUST** | Gas token generated from NIGHT, required for all transactions |

---

## License

MIT — see [LICENSE](LICENSE) for details.
