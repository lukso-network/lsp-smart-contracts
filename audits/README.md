# Smart Contracts Audits

In addition to the audits reports in pdf available in this page, you can find the audit report of the **Code4Rena audit contest** at the following link: [https://code4rena.com/reports/2021-05-lukso](https://code4rena.com/reports/2021-05-lukso)

## Nethermind AI Audit Agent

The AI auditing tool [AI Audit Agent from Nethermind](https://auditagent.nethermind.io/) was used to review for security the Customizable token contracts and their extensions (both the `constructor` version and `initialize(...)` version for proxy deployment).

Below is a summary of the status and fixes implemented for each finding. See the [audit report in PDF](./Nethermind_AI_Audit_Agent_2026_05_19.pdf) for more details.

| Reference | Status                                | Finding                                                                                                         |
| --------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| M         | fixed ✅ -01                          | Revocation to owner is blocked by the balance cap, contradicting expected behavior and allowing DoS on revokes  |
| L         | fixed ✅ -01                          | `revoke` operations are incorrectly blocked by the balance cap if the recipient lacks the UNCAPPED_BALANCE_ROLE |
| L         | acknowledged ☑️ -02                   | Ownership transfer can be permanently DoSed by bloating the `REVOKER_ROLE` member set                           |
| L         | fixed ✅ -03                          | `LSP8CappedBalance` incorrect balance calculation blocks valid self-transfers when at the balance cap           |
| I         | fixed ✅ -01                          | Initializer-time LSP1 reentrancy can bypass the configured supply cap during `_initialMint`                     |
| I         | fixed incorrect Natspec comment ✅-02 | `LSP8NonTransferable` `updateTransferLockPeriod` fails to revert if lock period has already started             |
| I         | acknowledged like L-02 -03            | `transferOwnership` can be gas-DoSed by inflating the `REVOKER_ROLE` member set                                 |
