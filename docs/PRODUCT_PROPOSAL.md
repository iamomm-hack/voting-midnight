# Product Proposal: Midnight Private Voting

## Idea selected

**Private Voting — anonymous participation with publicly verifiable tallies.** This is one of the approved Level 3 idea-list categories. This document is ready to submit to the program reviewer for project-specific approval.

## Problem

Public governance systems usually force voters to reveal a durable wallet identity. That creates a searchable participation history and can expose voters to profiling or pressure. At the same time, a governance result must remain independently auditable.

## Proposed solution

Midnight Private Voting lets a participant cast a ballot using a locally held secret rather than publishing that secret or a wallet identifier. A zero-knowledge circuit derives a poll-scoped nullifier, proves that the private input is available, prevents reuse of the same voting identity, and updates public tallies. The poll creator alone can close voting by proving knowledge of the admin secret.

## Target users

- DAOs and community grant programs;
- member associations running lightweight governance polls;
- teams that need auditable results without a permanent wallet-identity voting history.

## Level 3 scope

- one active YES/NO proposal per deployed contract;
- Midnight-compatible browser-wallet connection;
- local ZK proof generation and Preprod transaction submission;
- poll-scoped duplicate-vote prevention;
- administrator-authorized closure;
- public aggregate results;
- six simulator tests and compile/test/build CI;
- automatically deployed static web demo.

## Privacy and disclosure decision

The product hides the voting identity represented by the local secret. It intentionally discloses the chosen side to update an immediately visible public tally. Therefore, it provides anonymous participation rather than sealed-choice secrecy. The UI and README state this boundary explicitly.

## Success criteria

1. A new private identity can cast one valid vote.
2. A second vote using the same identity fails.
3. The public tally exactly matches accepted ballots.
4. A non-admin cannot close voting.
5. No local secret appears in public ledger state.
6. Compile, tests, checks and production build pass on every push.

## Future work

- eligibility credentials or private allowlist membership for Sybil resistance;
- commit/reveal or encrypted aggregation for sealed ballot choices;
- multiple proposals and fixed voting deadlines;
- independent security review and Preprod load testing.
