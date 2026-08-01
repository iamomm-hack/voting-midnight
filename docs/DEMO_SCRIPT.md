# One-Minute Demo Script

**0:00–0:08 — Problem and product**

“Midnight Private Voting lets a community participate without publishing the local identity secret, while everyone can verify the public result.” Show the README title, CI badge and live demo link.

**0:08–0:18 — Connect**

Open the deployed app, connect the Midnight wallet, and show the active proposal and current tallies.

**0:18–0:35 — Cast a ballot**

Choose YES or NO, confirm, and show proof/transaction progress. After confirmation, show the public tally and total-voter count increase.

**0:35–0:45 — Privacy boundary**

Open the Privacy section. State: “The local secret and wallet identity are not written on-chain. The choice and aggregate tallies are public. A poll-scoped nullifier prevents this private identity from voting twice.”

**0:45–0:52 — Failure path**

Attempt a second ballot with the same identity and show that the contract rejects it.

**0:52–1:00 — Quality evidence**

Show the GitHub Actions run with six passing tests and the deployment job, then end on the live demo URL.

Before recording, redeploy the hardened contract and update its address in `api/src/common-types.ts` and `README.md`.
