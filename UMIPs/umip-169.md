## Headers

| UMIP-169   |                                        |
| ---------- | -------------------------------------- |
| UMIP Title | Add OptimisticAsserter                 |
| Authors    | Pablo Maldonado (pablo@umaproject.org) |
| Status     | Approved                               |
| Created    | January 25, 2023                       |

## Summary (2-5 sentences)

This UMIP proposes the introduction of the `OptimisticAsserter` contract, which allows for the assertion of truths about the world using an optimistic escalation game. The contract utilizes the UMA Data Verification Mechanism (DVM) to arbitrate disputes, and allows for the use of Escalation Managers to define their own security properties and tradeoffs.

## Motivation

The `OptimisticAsserter` is a new form of Optimisitic Oracle which existing mechanics have been streamlined in order to simplify the creation of world-truth assertions. To this end, the result of an assertion can only be true or false, and an assertion is resolved only after the liveness period has expired or, in the case of a dispute, after it has been settled in the Oracle. In addition, the `OptimisticAsserter` permits the use of Escalation Managers to provide better control and setting over the escalation game and, ultimately, to disconnect from the UMA DVM in order to arbitrate conflicts in the specified Oracle. This disconnection logic is left up to the integrating project and is disabled by default.

## Technical Specification

To accomplish this upgrade, a few actions will need to be taken:

- A new `OptimisticAsserter` contract has been deployed in the following networks:

  - Mainnet: [0x123](https://etherscan.io/address/0x123)
  - Polygon: [0x123](https://polygonscan.com/address/0x123)
  - TODO - add other networks

- Transactions will need to be proposed to add this new addresses to the `Finder` contract under the name `OptimisticAsserter` in each network. This is how other contracts will find the optimistic oracle and reference it.
- The `OptimisticAsserter` will need to be registered with the `Registry` in each network so that it can make requests to the DVM.

Note: this change will only add the `OptimisticAsserter` to the networks mentioned above. New contracts that utilize the `OptimisticAsserter` will need to be deployed for it to become useful. Until all steps above are performed, the deployed `OptimisticAsserter` _should not_ be used in production since it will not be able to raise disputes to the DVM.

## Implementation

The `OptimisticAsserter` contract can be found [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-asserter/implementation/OptimisticAsserter.sol). The contract has already been audited by Open Zeppelin and the audit report can be found [here](TODO).

## Security considerations

The `OptimisticAsserter` only has the ability to send price requests to the DVM, so in the event of a serious bug, the biggest security implication would be that end-users would be able to send requests to the DVM without paying the final fee.
