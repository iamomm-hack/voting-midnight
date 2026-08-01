# Level 3 Submission Checklist

Use this as the final pre-submission gate. Do not mark evidence complete until the linked public artifact is visible.

| Requirement | Repository evidence | Status before push |
|---|---|---|
| Functional privacy dApp | Compact contract, API, CLI and React UI | Implemented; redeployment required after circuit change |
| Chosen approved-list idea | `docs/PRODUCT_PROPOSAL.md` — Private Voting | Ready to submit for reviewer approval |
| Minimum 3 tests | Six voting-specific tests in `contract/src/test/voting.test.ts` | Implemented; CI run required |
| CI/CD pipeline | `.github/workflows/ci.yml` and `.github/workflows/deploy-pages.yml` | Implemented; enable Pages for live deployment |
| Complete README | Root `README.md`, including privacy model | Implemented |
| Live demo | GitHub Pages deployment job | Enable Pages and verify URL |
| Test screenshot | Successful CI test summary | Capture after first green run |
| CI badge/workflow | Badge in README and workflow file | Implemented; badge turns green after run |
| One-minute video | `docs/DEMO_SCRIPT.md` | Record and add public video link |
| Minimum 10 meaningful commits | Check `git rev-list --count HEAD` | Add/retain at least 10 before submission |
