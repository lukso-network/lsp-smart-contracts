# Smart Contracts Audits

In addition to the audits reports in pdf available in this page, you can find the audit report of the **Code4Rena audit contest** at the following link: [https://code4rena.com/reports/2021-05-lukso](https://code4rena.com/reports/2021-05-lukso)

## Nethermind AI Audit Agent scan

> **Disclaimer:** This report was produced by [Nethermind's AI Audit Agent](https://auditagent.nethermind.io/) tool. It is AI-generated output and was **not** manually reviewed by Nethermind's security team. It is **not** a full security audit and must not be presented or interpreted as one.

The AI auditing tool was used to review for security the Customizable token contracts and their extensions (both the `constructor` version and `initialize(...)` version for proxy deployment).

Below is a summary of the status and fixes implemented for each finding. See the [scan report in PDF](./Nethermind_AI_Audit_Agent_2026_05_19.pdf) for more details.

| Reference | Status | Finding |
| --------- | ------ | ------- |
| M-01 | fixed ✅ | Revocation to owner is blocked by the balance cap, contradicting expected behavior and allowing DoS on revokes |
| L-01 | fixed ✅ | `revoke` operations are incorrectly blocked by the balance cap if the recipient lacks the UNCAPPED_BALANCE_ROLE |
| L-02 | acknowledged ☑️ | Ownership transfer can be permanently DoSed by bloating the `REVOKER_ROLE` member set |
| L-03 | fixed ✅ | `LSP8CappedBalance` incorrect balance calculation blocks valid self-transfers when at the balance cap |
| I-01 | fixed ✅ | Initializer-time LSP1 reentrancy can bypass the configured supply cap during `_initialMint` |
| I-02 | fixed ✅ (NatSpec) | `LSP8NonTransferable` `updateTransferLockPeriod` fails to revert if lock period has already started |
| I-03 | acknowledged ☑️ (same as L-02) | `transferOwnership` can be gas-DoSed by inflating the `REVOKER_ROLE` member set |
