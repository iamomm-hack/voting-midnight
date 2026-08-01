# Midnight Private Voting

[![CI](https://github.com/iamomm-hack/voting-midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/iamomm-hack/voting-midnight/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-oriented voting dApp for the Midnight Network. It uses a Compact zero-knowledge contract, poll-scoped nullifiers, a React wallet UI, contract tests, and automated build/deployment.

- **Chosen Level 3 idea:** Private Voting — anonymous participation with publicly verifiable tallies
- **Live demo:** [GitHub Pages](https://iamomm-hack.github.io/voting-midnight/)
- **Network:** Midnight Preprod
- **Deployed contract:** `0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0`
- **Product proposal:** [docs/PRODUCT_PROPOSAL.md](docs/PRODUCT_PROPOSAL.md)
- **Submission checklist:** [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md)

![Governance dashboard](ss/Screenshot%202026-07-27%20171837.png)

## What the dApp does

1. A user connects a Midnight-compatible browser wallet.
2. The app supplies a random local secret as a private Compact witness.
3. `castVote` proves knowledge of that secret, derives a poll-scoped nullifier, rejects a reused nullifier, and records the selected tally.
4. The public ledger exposes aggregate YES/NO counts and participation count for verification.
5. Only the identity that deployed the poll can execute `endVoting`.

The repository includes the browser UI, reusable API package, CLI/deployment utilities, Compact source and generated proof assets.

## Privacy model

This implementation provides **voter-identity privacy**, not sealed ballot-choice privacy. That distinction is intentional and should be stated clearly in demos and review material.

### What an observer can learn

- proposal title and whether voting is open or ended;
- YES, NO and total participation counts;
- the choice contributed by a transaction, because the selected public counter changes;
- a poll-scoped nullifier for each accepted voting identity;
- transaction timing and normal public network metadata.

### What an observer cannot learn from the contract

- the voter's `localSecretKey`, which remains in private application state;
- the wallet identity represented by that secret;
- a reusable global voter identifier: the nullifier is domain-separated by the poll's admin key;
- enough information to submit a second valid ballot using an already-consumed private identity.

### Selective disclosure design

| Value | Treatment | Reason |
|---|---|---|
| Local secret | Private witness | Proves authority without exposing the secret |
| Poll-scoped nullifier | Disclosed hash | Enforces one ballot per private identity |
| Vote choice | Disclosed to circuit/public tally | Enables immediately verifiable results |
| Aggregate tallies | Public ledger | Lets anyone audit the outcome |
| Admin key | Disclosed hash | Authorizes poll closure without exposing admin secret |

The contract does not claim Sybil resistance: one person who creates multiple independent local identities can vote more than once unless a separate eligibility/allowlist layer is added. The current guarantee is one accepted vote per private identity per poll.

## Security properties

- duplicate nullifiers are rejected on-chain;
- nullifiers are separated across polls to reduce cross-poll correlation;
- ballots are rejected after poll closure;
- only the poll administrator's private witness can close the poll;
- secrets are never written to public ledger state;
- tests cover success paths, privacy-state preservation and authorization failures.

## Tests

The contract suite contains six voting-specific simulator tests and runs without a blockchain node or proof server after Compact compilation.

```bash
npm ci --legacy-peer-deps
npm run compact --workspace=@midnight-ntwrk/voting-contract
npm test
```

Expected summary:

```text
Test Files  1 passed (1)
Tests       6 passed (6)
```

The CI badge at the top links to the full compile/test/build run. Capture the successful test summary from that run for the required submission screenshot.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. installs Node.js 24.11.1 and Compact 0.31.0;
2. installs the locked npm dependency graph;
3. compiles the Compact contract and proof assets;
4. runs contract tests, type checks and lint checks;
5. builds the production React app;
6. uploads the verified `voting-ui/dist` production artifact.

`.github/workflows/deploy-pages.yml` is the dedicated CD workflow. It deploys
only after CI succeeds and the repository variable `ENABLE_GITHUB_PAGES` is set
to `true`; it can also be started manually for the first deployment.

For the first deployment, open **Settings → Pages**, choose **GitHub Actions**
as the source, add the Actions variable `ENABLE_GITHUB_PAGES=true`, and run
**Deploy Pages** once from the Actions tab.

## Run locally

### Prerequisites

- Node.js 24.11.1 or newer
- npm 10+
- Compact compiler 0.31.0
- Docker Desktop for the local proof server
- Lace or another compatible Midnight wallet

```bash
git clone https://github.com/iamomm-hack/voting-midnight.git
cd voting-midnight
npm ci --legacy-peer-deps
npm run compact --workspace=@midnight-ntwrk/voting-contract
npm run build
npm run dev --workspace=@midnight-ntwrk/voting-ui
```

Open `http://localhost:5173`.

## Deploy or join a contract

Start the proof server:

```bash
docker compose -f voting-cli/proof-server.yml up -d
```

For interactive Preprod deployment:

```bash
npm run preprod-remote --workspace=@midnight-ntwrk/voting-cli
```

For the existing non-interactive launcher:

```bash
npm run deploy-direct
```

ZK proving can require several gigabytes of memory. The CLI launchers already set an 8 GB Node heap.

## Repository layout

```text
contract/      Compact source, witnesses, generated circuits and unit tests
api/           Deploy/join/call API and public derived-state observable
voting-cli/    Wallet, proof-server and network deployment launchers
voting-ui/     React + Vite browser application
ss/            Product screenshots
docs/          Proposal, demo script and submission checklist
.github/       CI/CD and security workflows
```

## Screenshots

| View | Screenshot |
|---|---|
| Proposals | [Dashboard](ss/Screenshot%202026-07-27%20171837.png) |
| Activity | [On-chain activity](ss/Screenshot%202026-07-27%20171851.png) |
| Documentation | [Privacy documentation](ss/Screenshot%202026-07-27%20171905.png) |
| Wallet | [Wallet connection](ss/Screenshot%202026-07-27%20171913.png) |

## Known limitations

- The deployed address above may refer to an earlier circuit build; redeploy after changing Compact code and update the address before final submission.
- GitHub Pages must be enabled once in repository settings before the demo URL becomes available.
- Sybil resistance and credential-based eligibility are out of scope for this cycle.
- Real-time public tallies reveal each anonymous transaction's choice through its counter delta.

## License

MIT — see [LICENSE](LICENSE).
